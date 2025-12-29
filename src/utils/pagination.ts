/**
 * Cursor-based Pagination Utility
 * Provides efficient pagination for large datasets using cursor-based approach
 * instead of offset/skip-based pagination which becomes slow with large offsets.
 */

import { Model, FilterQuery, SortOrder } from 'mongoose';

// ============================================
// Types
// ============================================

/**
 * Cursor pagination options
 */
export interface CursorPaginationOptions<T> {
  /** Filter query to apply */
  query?: FilterQuery<T>;
  /** Cursor from previous request (null for first page) */
  cursor?: string | null;
  /** Number of items per page */
  limit?: number;
  /** Field to sort/paginate by (default: '_id') */
  sortField?: string;
  /** Sort direction: 1 for ascending, -1 for descending (default: -1) */
  sortOrder?: SortOrder;
  /** Fields to select (projection) */
  select?: string | string[];
  /** Paths to populate */
  populate?: string | string[] | PopulateOption[];
}

/**
 * Populate option for cursor pagination
 */
export interface PopulateOption {
  path: string;
  select?: string;
  model?: string;
}

/**
 * Cursor pagination result
 */
export interface CursorPaginationResult<T> {
  /** Array of documents */
  data: T[];
  /** Cursor for next page (null if no more pages) */
  nextCursor: string | null;
  /** Cursor for previous page (null if on first page) */
  prevCursor: string | null;
  /** Whether there are more items after this page */
  hasMore: boolean;
  /** Whether there are items before this page */
  hasPrev: boolean;
  /** Total count (only if requested) */
  totalCount?: number;
}

/**
 * Page info for GraphQL-style pagination
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

// ============================================
// Cursor Encoding/Decoding
// ============================================

/**
 * Encode a cursor value to a base64 string
 * @param value - The value to encode (typically _id or sort field value)
 * @returns Base64 encoded cursor string
 */
export function encodeCursor(value: unknown): string {
  const data = JSON.stringify({
    v: value,
    t: Date.now(),
  });
  return Buffer.from(data).toString('base64url');
}

/**
 * Decode a base64 cursor string to its original value
 * @param cursor - The base64 encoded cursor
 * @returns The decoded value or null if invalid
 */
export function decodeCursor(cursor: string): unknown | null {
  try {
    const data = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(data);
    return parsed.v;
  } catch {
    return null;
  }
}

/**
 * Validate a cursor string
 * @param cursor - The cursor to validate
 * @returns True if cursor is valid
 */
export function isValidCursor(cursor: string): boolean {
  return decodeCursor(cursor) !== null;
}

// ============================================
// Cursor Pagination Function
// ============================================

/**
 * Perform cursor-based pagination on a Mongoose model
 * @param model - Mongoose model to query
 * @param options - Pagination options
 * @returns Paginated result with cursors
 */
export async function paginateWithCursor<T>(
  model: Model<T>,
  options: CursorPaginationOptions<T> = {}
): Promise<CursorPaginationResult<T>> {
  const {
    query = {},
    cursor = null,
    limit = 20,
    sortField = '_id',
    sortOrder = -1,
    select,
    populate,
  } = options;

  // Ensure limit is within bounds
  const safeLimit = Math.min(Math.max(1, limit), 100);

  // Build the filter with cursor condition
  const filter: FilterQuery<T> = { ...query };

  if (cursor) {
    const cursorValue = decodeCursor(cursor);
    if (cursorValue !== null) {
      // For descending order, get items less than cursor
      // For ascending order, get items greater than cursor
      const operator = sortOrder === -1 ? '$lt' : '$gt';
      filter[sortField as keyof FilterQuery<T>] = { [operator]: cursorValue } as unknown as FilterQuery<T>[keyof FilterQuery<T>];
    }
  }

  // Build the query
  let queryBuilder = model
    .find(filter)
    .sort({ [sortField]: sortOrder })
    .limit(safeLimit + 1); // Fetch one extra to check for more

  // Apply select
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // Apply populate
  if (populate) {
    if (Array.isArray(populate)) {
      for (const pop of populate) {
        if (typeof pop === 'string') {
          queryBuilder = queryBuilder.populate(pop);
        } else {
          queryBuilder = queryBuilder.populate(pop as { path: string; select?: string });
        }
      }
    } else if (typeof populate === 'string') {
      queryBuilder = queryBuilder.populate(populate);
    } else {
      queryBuilder = queryBuilder.populate(populate as { path: string; select?: string });
    }
  }

  // Execute query
  const docs = await queryBuilder.lean<T[]>();

  // Check if there are more items
  const hasMore = docs.length > safeLimit;
  const data = hasMore ? docs.slice(0, -1) : docs;

  // Generate cursors
  let nextCursor: string | null = null;
  let prevCursor: string | null = cursor || null;

  if (hasMore && data.length > 0) {
    const lastDoc = data[data.length - 1] as Record<string, unknown>;
    nextCursor = encodeCursor(lastDoc[sortField]);
  }

  // For first page, there's no previous cursor
  const hasPrev = cursor !== null;

  return {
    data,
    nextCursor,
    prevCursor: hasPrev ? prevCursor : null,
    hasMore,
    hasPrev,
  };
}

/**
 * Perform cursor-based pagination with total count
 * Note: Total count adds an extra query, use sparingly on large collections
 */
export async function paginateWithCursorAndCount<T>(
  model: Model<T>,
  options: CursorPaginationOptions<T> = {}
): Promise<CursorPaginationResult<T>> {
  const { query = {} } = options;

  // Run pagination and count in parallel
  const [result, totalCount] = await Promise.all([
    paginateWithCursor(model, options),
    model.countDocuments(query),
  ]);

  return {
    ...result,
    totalCount,
  };
}

// ============================================
// Offset Pagination (for comparison/fallback)
// ============================================

/**
 * Offset pagination options
 */
export interface OffsetPaginationOptions<T> {
  query?: FilterQuery<T>;
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
  select?: string | string[];
  populate?: string | string[] | PopulateOption[];
}

/**
 * Offset pagination result
 */
export interface OffsetPaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Perform traditional offset-based pagination
 * Note: Cursor pagination is preferred for large datasets
 */
export async function paginateWithOffset<T>(
  model: Model<T>,
  options: OffsetPaginationOptions<T> = {}
): Promise<OffsetPaginationResult<T>> {
  const {
    query = {},
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    select,
    populate,
  } = options;

  // Ensure values are within bounds
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const skip = (safePage - 1) * safeLimit;

  // Build the query
  let queryBuilder = model.find(query).sort(sort).skip(skip).limit(safeLimit);

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      for (const pop of populate) {
        if (typeof pop === 'string') {
          queryBuilder = queryBuilder.populate(pop);
        } else {
          queryBuilder = queryBuilder.populate(pop as { path: string; select?: string });
        }
      }
    } else if (typeof populate === 'string') {
      queryBuilder = queryBuilder.populate(populate);
    } else {
      queryBuilder = queryBuilder.populate(populate as { path: string; select?: string });
    }
  }

  // Run query and count in parallel
  const [data, totalCount] = await Promise.all([
    queryBuilder.lean<T[]>(),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    data,
    page: safePage,
    limit: safeLimit,
    totalPages,
    totalCount,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

// ============================================
// GraphQL-style Pagination Helpers
// ============================================

/**
 * Convert cursor pagination result to GraphQL connection format
 */
export function toConnection<T>(
  result: CursorPaginationResult<T>,
  getCursor: (item: T) => string
): {
  edges: Array<{ node: T; cursor: string }>;
  pageInfo: PageInfo;
  totalCount?: number;
} {
  const edges = result.data.map((item) => ({
    node: item,
    cursor: getCursor(item),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: result.hasMore,
      hasPreviousPage: result.hasPrev,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount: result.totalCount,
  };
}

// ============================================
// Export
// ============================================

export default {
  encodeCursor,
  decodeCursor,
  isValidCursor,
  paginateWithCursor,
  paginateWithCursorAndCount,
  paginateWithOffset,
  toConnection,
};
