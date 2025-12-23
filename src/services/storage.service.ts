/**
 * Storage Service
 * Handles screenshot file storage (local and S3)
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '@config/index';
import logger from '@utils/logger';
import { ScreenshotFormat } from '@/types';

// ============================================
// Types
// ============================================

export interface StorageResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageOptions {
  contentType?: string;
  expiresIn?: number; // URL expiration in seconds
}

// ============================================
// S3 Client
// ============================================

let s3Client: S3Client | null = null;

/**
 * Get S3 client instance
 */
function getS3Client(): S3Client {
  if (!s3Client && config.storage.type === 's3') {
    if (!config.storage.s3AccessKey || !config.storage.s3SecretKey) {
      throw new Error('S3 credentials not configured');
    }

    s3Client = new S3Client({
      region: config.storage.s3Region,
      credentials: {
        accessKeyId: config.storage.s3AccessKey,
        secretAccessKey: config.storage.s3SecretKey,
      },
    });
  }

  if (!s3Client) {
    throw new Error('S3 client not configured');
  }

  return s3Client;
}

// ============================================
// Content Type Mapping
// ============================================

const CONTENT_TYPES: Record<ScreenshotFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

/**
 * Get content type from format
 */
export function getContentType(format: ScreenshotFormat): string {
  return CONTENT_TYPES[format] || 'application/octet-stream';
}

/**
 * Get file extension from format
 */
export function getFileExtension(format: ScreenshotFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

// ============================================
// Key Generation
// ============================================

/**
 * Generate a unique storage key for a screenshot
 */
export function generateStorageKey(
  userId: string,
  format: ScreenshotFormat,
  screenshotId?: string
): string {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(8).toString('hex');
  const id = screenshotId || randomPart;
  const extension = getFileExtension(format);

  // Organize by date for easier management
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `screenshots/${year}/${month}/${day}/${userId}/${id}-${timestamp}.${extension}`;
}

// ============================================
// Local Storage Functions
// ============================================

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save file to local storage
 */
async function saveToLocal(
  key: string,
  data: Buffer,
  options: StorageOptions = {}
): Promise<StorageResult> {
  const localPath = config.storage.localPath;
  const filePath = path.join(localPath, key);
  const dirPath = path.dirname(filePath);

  await ensureDirectory(dirPath);
  await fs.writeFile(filePath, data);

  const stats = await fs.stat(filePath);

  // Generate URL based on configuration
  const baseUrl = config.storage.publicUrl || `http://localhost:${config.port}/screenshots`;
  const url = `${baseUrl}/${key}`;

  logger.debug('File saved to local storage', { key, size: stats.size });

  return {
    key,
    url,
    size: stats.size,
    contentType: options.contentType || 'application/octet-stream',
  };
}

/**
 * Get file from local storage
 */
async function getFromLocal(key: string): Promise<Buffer> {
  const localPath = config.storage.localPath;
  const filePath = path.join(localPath, key);

  return fs.readFile(filePath);
}

/**
 * Delete file from local storage
 */
async function deleteFromLocal(key: string): Promise<void> {
  const localPath = config.storage.localPath;
  const filePath = path.join(localPath, key);

  try {
    await fs.unlink(filePath);
    logger.debug('File deleted from local storage', { key });
  } catch (error) {
    // Ignore if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Check if file exists in local storage
 */
async function existsInLocal(key: string): Promise<boolean> {
  const localPath = config.storage.localPath;
  const filePath = path.join(localPath, key);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from local storage
 */
async function getLocalMetadata(key: string): Promise<{ size: number; modifiedAt: Date } | null> {
  const localPath = config.storage.localPath;
  const filePath = path.join(localPath, key);

  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      modifiedAt: stats.mtime,
    };
  } catch {
    return null;
  }
}

// ============================================
// S3 Storage Functions
// ============================================

/**
 * Save file to S3 storage
 */
async function saveToS3(
  key: string,
  data: Buffer,
  options: StorageOptions = {}
): Promise<StorageResult> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: options.contentType,
  });

  await client.send(command);

  // Generate signed URL if configured, otherwise use public URL
  let url: string;
  if (config.storage.s3SignedUrls) {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    url = await getSignedUrl(client, getCommand, {
      expiresIn: options.expiresIn || 3600, // 1 hour default
    });
  } else {
    url = `https://${bucket}.s3.${config.storage.s3Region}.amazonaws.com/${key}`;
  }

  logger.debug('File saved to S3', { key, bucket, size: data.length });

  return {
    key,
    url,
    size: data.length,
    contentType: options.contentType || 'application/octet-stream',
  };
}

/**
 * Get file from S3 storage
 */
async function getFromS3(key: string): Promise<Buffer> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await client.send(command);
  const chunks: Uint8Array[] = [];

  if (response.Body) {
    // @ts-expect-error - Body is a readable stream
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
  }

  return Buffer.concat(chunks);
}

/**
 * Delete file from S3 storage
 */
async function deleteFromS3(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
  logger.debug('File deleted from S3', { key, bucket });
}

/**
 * Check if file exists in S3 storage
 */
async function existsInS3(key: string): Promise<boolean> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from S3 storage
 */
async function getS3Metadata(key: string): Promise<{ size: number; modifiedAt: Date } | null> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(command);
    return {
      size: response.ContentLength || 0,
      modifiedAt: response.LastModified || new Date(),
    };
  } catch {
    return null;
  }
}

/**
 * Generate a signed URL for S3 object
 */
async function getS3SignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const client = getS3Client();
  const bucket = config.storage.s3Bucket;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

// ============================================
// Public API
// ============================================

/**
 * Save screenshot to storage
 */
export async function saveScreenshot(
  key: string,
  data: Buffer,
  format: ScreenshotFormat,
  options: StorageOptions = {}
): Promise<StorageResult> {
  const storageOptions: StorageOptions = {
    ...options,
    contentType: options.contentType || getContentType(format),
  };

  if (config.storage.type === 's3') {
    return saveToS3(key, data, storageOptions);
  }

  return saveToLocal(key, data, storageOptions);
}

/**
 * Get screenshot from storage
 */
export async function getScreenshot(key: string): Promise<Buffer> {
  if (config.storage.type === 's3') {
    return getFromS3(key);
  }

  return getFromLocal(key);
}

/**
 * Delete screenshot from storage
 */
export async function deleteScreenshot(key: string): Promise<void> {
  if (config.storage.type === 's3') {
    return deleteFromS3(key);
  }

  return deleteFromLocal(key);
}

/**
 * Check if screenshot exists in storage
 */
export async function screenshotExists(key: string): Promise<boolean> {
  if (config.storage.type === 's3') {
    return existsInS3(key);
  }

  return existsInLocal(key);
}

/**
 * Get screenshot metadata
 */
export async function getScreenshotMetadata(
  key: string
): Promise<{ size: number; modifiedAt: Date } | null> {
  if (config.storage.type === 's3') {
    return getS3Metadata(key);
  }

  return getLocalMetadata(key);
}

/**
 * Get a signed URL for accessing a screenshot
 */
export async function getSignedScreenshotUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (config.storage.type === 's3') {
    return getS3SignedUrl(key, expiresIn);
  }

  // For local storage, return the public URL
  const baseUrl = config.storage.publicUrl || `http://localhost:${config.port}/screenshots`;
  return `${baseUrl}/${key}`;
}

/**
 * Clean up expired screenshots
 * This should be run as a scheduled job
 */
export async function cleanupExpiredScreenshots(olderThanDays: number = 7): Promise<number> {
  if (config.storage.type === 's3') {
    // S3 lifecycle policies should handle this
    logger.warn('S3 cleanup should be handled by lifecycle policies');
    return 0;
  }

  // Local storage cleanup
  const localPath = config.storage.localPath;
  const screenshotsDir = path.join(localPath, 'screenshots');

  try {
    await fs.access(screenshotsDir);
  } catch {
    // Directory doesn't exist
    return 0;
  }

  let deletedCount = 0;
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  async function cleanDirectory(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await cleanDirectory(fullPath);
        // Remove empty directories
        const remaining = await fs.readdir(fullPath);
        if (remaining.length === 0) {
          await fs.rmdir(fullPath);
        }
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        if (stats.mtimeMs < cutoffTime) {
          await fs.unlink(fullPath);
          deletedCount++;
        }
      }
    }
  }

  await cleanDirectory(screenshotsDir);

  logger.info('Cleaned up expired screenshots', { deletedCount, olderThanDays });
  return deletedCount;
}

// ============================================
// Export
// ============================================

export default {
  generateStorageKey,
  getContentType,
  getFileExtension,
  saveScreenshot,
  getScreenshot,
  deleteScreenshot,
  screenshotExists,
  getScreenshotMetadata,
  getSignedScreenshotUrl,
  cleanupExpiredScreenshots,
};
