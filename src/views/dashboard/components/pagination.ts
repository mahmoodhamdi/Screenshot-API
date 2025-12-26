/**
 * Pagination Component
 * Page navigation with page numbers, prev/next, and items per page
 */

export interface PaginationProps {
  id: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
}

export function generatePagination(props: PaginationProps): string {
  const {
    id,
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    itemsPerPageOptions = [10, 25, 50],
  } = props;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const optionsHtml = itemsPerPageOptions
    .map(
      (option) => `
      <option value="${option}" ${option === itemsPerPage ? 'selected' : ''}>${option}</option>
    `
    )
    .join('');

  return `
    <div class="pagination" id="${id}">
      <div class="pagination-info">
        <span class="pagination-showing" id="${id}-showing">
          Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong>
        </span>
      </div>

      <div class="pagination-controls">
        <div class="pagination-per-page">
          <label for="${id}-per-page">Show:</label>
          <select
            id="${id}-per-page"
            class="pagination-select"
            onchange="handlePerPageChange('${id}', this.value)"
          >
            ${optionsHtml}
          </select>
        </div>

        <div class="pagination-nav">
          <button
            class="pagination-btn pagination-prev"
            id="${id}-prev"
            onclick="handlePageChange('${id}', 'prev')"
            ${currentPage <= 1 ? 'disabled' : ''}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div class="pagination-pages" id="${id}-pages">
            ${generatePageNumbers(currentPage, totalPages, id)}
          </div>

          <button
            class="pagination-btn pagination-next"
            id="${id}-next"
            onclick="handlePageChange('${id}', 'next')"
            ${currentPage >= totalPages ? 'disabled' : ''}
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function generatePageNumbers(current: number, total: number, id: string): string {
  if (total <= 1) {
    return `<button class="pagination-page active" disabled>1</button>`;
  }

  const pages: (number | string)[] = [];
  const showEllipsis = total > 7;

  if (showEllipsis) {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Always show last page
    if (!pages.includes(total)) {
      pages.push(total);
    }
  } else {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  }

  return pages
    .map((page) => {
      if (page === '...') {
        return `<span class="pagination-ellipsis">...</span>`;
      }
      const isActive = page === current;
      return `
        <button
          class="pagination-page ${isActive ? 'active' : ''}"
          onclick="handlePageChange('${id}', ${page})"
          ${isActive ? 'aria-current="page"' : ''}
        >
          ${page}
        </button>
      `;
    })
    .join('');
}

export function getPaginationStyles(): string {
  return `
    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .pagination-showing strong {
      color: var(--text-primary);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    /* Per Page Selector */
    .pagination-per-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .pagination-select {
      padding: 0.375rem 0.75rem;
      padding-right: 2rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.8125rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      background-size: 16px;
      transition: all var(--transition-fast);
    }

    .pagination-select:hover {
      border-color: var(--border-hover);
    }

    .pagination-select:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    /* Navigation */
    .pagination-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pagination-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Page Numbers */
    .pagination-pages {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pagination-page {
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .pagination-page:hover:not(.active):not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .pagination-page.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
      cursor: default;
    }

    .pagination-ellipsis {
      padding: 0 0.5rem;
      color: var(--text-muted);
    }

    /* Responsive */
    @media (max-width: 640px) {
      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-controls {
        justify-content: space-between;
      }

      .pagination-per-page {
        display: none;
      }
    }
  `;
}

export function getPaginationScripts(): string {
  return `
    // Pagination state
    const paginationState = {};

    function initPaginationState(paginationId) {
      if (!paginationState[paginationId]) {
        paginationState[paginationId] = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        };
      }
      return paginationState[paginationId];
    }

    function handlePageChange(paginationId, page) {
      const state = initPaginationState(paginationId);

      if (page === 'prev') {
        if (state.currentPage > 1) {
          state.currentPage--;
        }
      } else if (page === 'next') {
        if (state.currentPage < state.totalPages) {
          state.currentPage++;
        }
      } else {
        state.currentPage = parseInt(page, 10);
      }

      // Trigger custom event
      document.dispatchEvent(new CustomEvent('pageChange', {
        detail: {
          paginationId,
          page: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }
      }));
    }

    function handlePerPageChange(paginationId, value) {
      const state = initPaginationState(paginationId);
      state.itemsPerPage = parseInt(value, 10);
      state.currentPage = 1; // Reset to first page

      // Trigger custom event
      document.dispatchEvent(new CustomEvent('pageChange', {
        detail: {
          paginationId,
          page: 1,
          itemsPerPage: state.itemsPerPage,
        }
      }));
    }

    function updatePagination(paginationId, options) {
      const state = initPaginationState(paginationId);
      Object.assign(state, options);

      // Update showing text
      const showingEl = document.getElementById(paginationId + '-showing');
      if (showingEl) {
        const start = state.totalItems === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
        const end = Math.min(state.currentPage * state.itemsPerPage, state.totalItems);
        showingEl.innerHTML = 'Showing <strong>' + start + '</strong> to <strong>' + end + '</strong> of <strong>' + state.totalItems + '</strong>';
      }

      // Update prev/next buttons
      const prevBtn = document.getElementById(paginationId + '-prev');
      const nextBtn = document.getElementById(paginationId + '-next');
      if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
      if (nextBtn) nextBtn.disabled = state.currentPage >= state.totalPages;

      // Update page numbers
      const pagesEl = document.getElementById(paginationId + '-pages');
      if (pagesEl) {
        pagesEl.innerHTML = generatePageNumbersHtml(state.currentPage, state.totalPages, paginationId);
      }
    }

    function generatePageNumbersHtml(current, total, id) {
      if (total <= 1) {
        return '<button class="pagination-page active" disabled>1</button>';
      }

      const pages = [];
      const showEllipsis = total > 7;

      if (showEllipsis) {
        pages.push(1);
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (current < total - 2) pages.push('...');
        if (!pages.includes(total)) pages.push(total);
      } else {
        for (let i = 1; i <= total; i++) pages.push(i);
      }

      return pages.map(page => {
        if (page === '...') {
          return '<span class="pagination-ellipsis">...</span>';
        }
        const isActive = page === current;
        return '<button class="pagination-page ' + (isActive ? 'active' : '') + '" onclick="handlePageChange(\\'' + id + '\\', ' + page + ')" ' + (isActive ? 'aria-current="page"' : '') + '>' + page + '</button>';
      }).join('');
    }
  `;
}
