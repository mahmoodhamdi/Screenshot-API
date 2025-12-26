/**
 * Data Table Component
 * Reusable table with sorting, selection, and actions
 */

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface DataTableProps {
  id: string;
  columns: DataTableColumn[];
  selectable?: boolean;
  emptyMessage?: string;
  loadingRows?: number;
}

export function generateDataTable(props: DataTableProps): string {
  const { id, columns, selectable = false, loadingRows = 5 } = props;

  const headerCells = columns
    .map(
      (col) => `
      <th
        class="data-table-th ${col.sortable ? 'sortable' : ''}"
        style="${col.width ? `width: ${col.width};` : ''} ${col.align ? `text-align: ${col.align};` : ''}"
        ${col.sortable ? `onclick="handleSort('${id}', '${col.key}')"` : ''}
        data-key="${col.key}"
      >
        <span class="data-table-th-content">
          ${col.label}
          ${
            col.sortable
              ? `
            <span class="data-table-sort-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 15l5 5 5-5"/>
                <path d="M7 9l5-5 5 5"/>
              </svg>
            </span>
          `
              : ''
          }
        </span>
      </th>
    `
    )
    .join('');

  const loadingRowsHtml = Array.from({ length: loadingRows })
    .map(
      () => `
      <tr class="data-table-row loading">
        ${selectable ? '<td class="data-table-td"><div class="skeleton skeleton-checkbox"></div></td>' : ''}
        ${columns.map((col) => `<td class="data-table-td" style="${col.align ? `text-align: ${col.align};` : ''}"><div class="skeleton skeleton-text"></div></td>`).join('')}
      </tr>
    `
    )
    .join('');

  return `
    <div class="data-table-container" id="${id}-container">
      <table class="data-table" id="${id}">
        <thead class="data-table-thead">
          <tr>
            ${
              selectable
                ? `
              <th class="data-table-th data-table-th-checkbox">
                <input
                  type="checkbox"
                  class="data-table-checkbox"
                  id="${id}-select-all"
                  onchange="handleSelectAll('${id}')"
                  aria-label="Select all rows"
                />
              </th>
            `
                : ''
            }
            ${headerCells}
          </tr>
        </thead>
        <tbody class="data-table-tbody" id="${id}-body">
          ${loadingRowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

export function getDataTableStyles(): string {
  return `
    /* Data Table Container */
    .data-table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    /* Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    /* Table Header */
    .data-table-thead {
      background: var(--bg-tertiary);
    }

    .data-table-th {
      padding: 0.875rem 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }

    .data-table-th.sortable {
      cursor: pointer;
      user-select: none;
      transition: color var(--transition-fast);
    }

    .data-table-th.sortable:hover {
      color: var(--text-primary);
    }

    .data-table-th.sorted {
      color: var(--accent-primary);
    }

    .data-table-th-content {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .data-table-sort-icon {
      display: inline-flex;
      opacity: 0.3;
      transition: opacity var(--transition-fast);
    }

    .data-table-th.sortable:hover .data-table-sort-icon,
    .data-table-th.sorted .data-table-sort-icon {
      opacity: 1;
    }

    .data-table-sort-icon svg {
      width: 14px;
      height: 14px;
    }

    .data-table-th.sorted.asc .data-table-sort-icon svg path:last-child {
      opacity: 0.3;
    }

    .data-table-th.sorted.desc .data-table-sort-icon svg path:first-child {
      opacity: 0.3;
    }

    .data-table-th-checkbox {
      width: 48px;
      text-align: center;
    }

    /* Table Body */
    .data-table-tbody {
      background: var(--bg-card);
    }

    .data-table-row {
      border-bottom: 1px solid var(--border-color);
      transition: background-color var(--transition-fast);
    }

    .data-table-row:last-child {
      border-bottom: none;
    }

    .data-table-row:hover {
      background: var(--bg-hover);
    }

    .data-table-row.selected {
      background: rgba(99, 102, 241, 0.08);
    }

    .data-table-row.clickable {
      cursor: pointer;
    }

    .data-table-td {
      padding: 0.875rem 1rem;
      color: var(--text-primary);
      vertical-align: middle;
    }

    /* Checkbox */
    .data-table-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-input);
      cursor: pointer;
      appearance: none;
      transition: all var(--transition-fast);
    }

    .data-table-checkbox:checked {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .data-table-checkbox:checked::after {
      content: '';
      display: block;
      width: 5px;
      height: 9px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
      margin: 1px auto;
    }

    .data-table-checkbox:focus {
      box-shadow: var(--focus-ring);
      outline: none;
    }

    /* Cell Types */
    .data-table-cell-thumbnail {
      width: 64px;
      height: 48px;
      border-radius: 6px;
      background: var(--bg-tertiary);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .data-table-cell-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .data-table-cell-thumbnail svg {
      width: 24px;
      height: 24px;
      color: var(--text-muted);
    }

    .data-table-cell-url {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .data-table-cell-url a {
      color: var(--text-primary);
      transition: color var(--transition-fast);
    }

    .data-table-cell-url a:hover {
      color: var(--accent-primary);
    }

    .data-table-cell-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .data-table-cell-badge.badge-png { background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); }
    .data-table-cell-badge.badge-jpeg { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
    .data-table-cell-badge.badge-webp { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .data-table-cell-badge.badge-pdf { background: rgba(239, 68, 68, 0.15); color: var(--error); }

    .data-table-cell-status {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .data-table-cell-status.status-completed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .data-table-cell-status.status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .data-table-cell-status.status-failed {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .data-table-cell-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .data-table-cell-date {
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    .data-table-cell-dimensions {
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-family: monospace;
    }

    /* Actions */
    .data-table-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .data-table-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .data-table-action-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .data-table-action-btn.danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    .data-table-action-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Loading Skeleton */
    .data-table-row.loading .data-table-td {
      padding: 1rem;
    }

    .skeleton {
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-text {
      height: 16px;
      width: 100%;
    }

    .skeleton-checkbox {
      width: 18px;
      height: 18px;
      margin: 0 auto;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Empty State */
    .data-table-empty {
      padding: 3rem;
      text-align: center;
    }

    /* Bulk Actions */
    .data-table-bulk-actions {
      display: none;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border-bottom: 1px solid var(--border-color);
    }

    .data-table-bulk-actions.visible {
      display: flex;
    }

    .data-table-bulk-count {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--accent-primary);
    }

    .data-table-bulk-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .data-table-bulk-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .data-table-bulk-btn.danger:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--error);
      color: var(--error);
    }

    .data-table-bulk-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .data-table-container {
        overflow-x: auto;
      }

      .data-table {
        min-width: 800px;
      }
    }

    @media (max-width: 640px) {
      .data-table-th,
      .data-table-td {
        padding: 0.75rem;
      }
    }
  `;
}

export function getDataTableScripts(): string {
  return `
    // Data table state
    const tableState = {};

    function initTableState(tableId) {
      if (!tableState[tableId]) {
        tableState[tableId] = {
          selected: new Set(),
          sortKey: null,
          sortDir: 'asc',
        };
      }
      return tableState[tableId];
    }

    // Handle select all
    function handleSelectAll(tableId) {
      const state = initTableState(tableId);
      const selectAll = document.getElementById(tableId + '-select-all');
      const rows = document.querySelectorAll('#' + tableId + '-body .data-table-row:not(.loading)');
      const checkboxes = document.querySelectorAll('#' + tableId + '-body .data-table-checkbox');

      if (selectAll.checked) {
        rows.forEach(row => {
          row.classList.add('selected');
          const id = row.dataset.id;
          if (id) state.selected.add(id);
        });
        checkboxes.forEach(cb => cb.checked = true);
      } else {
        rows.forEach(row => row.classList.remove('selected'));
        checkboxes.forEach(cb => cb.checked = false);
        state.selected.clear();
      }

      updateBulkActions(tableId);
    }

    // Handle row select
    function handleRowSelect(tableId, rowId) {
      const state = initTableState(tableId);
      const row = document.querySelector('#' + tableId + '-body [data-id="' + rowId + '"]');
      const checkbox = row?.querySelector('.data-table-checkbox');

      if (state.selected.has(rowId)) {
        state.selected.delete(rowId);
        row?.classList.remove('selected');
        if (checkbox) checkbox.checked = false;
      } else {
        state.selected.add(rowId);
        row?.classList.add('selected');
        if (checkbox) checkbox.checked = true;
      }

      // Update select all checkbox
      const selectAll = document.getElementById(tableId + '-select-all');
      const allCheckboxes = document.querySelectorAll('#' + tableId + '-body .data-table-checkbox');
      const checkedCount = document.querySelectorAll('#' + tableId + '-body .data-table-checkbox:checked').length;

      if (selectAll) {
        selectAll.checked = checkedCount === allCheckboxes.length && allCheckboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
      }

      updateBulkActions(tableId);
    }

    // Handle sort
    function handleSort(tableId, key) {
      const state = initTableState(tableId);
      const headers = document.querySelectorAll('#' + tableId + ' .data-table-th.sortable');

      headers.forEach(th => {
        th.classList.remove('sorted', 'asc', 'desc');
      });

      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = 'asc';
      }

      const currentHeader = document.querySelector('#' + tableId + ' .data-table-th[data-key="' + key + '"]');
      if (currentHeader) {
        currentHeader.classList.add('sorted', state.sortDir);
      }

      // Trigger custom event for handling sort
      document.dispatchEvent(new CustomEvent('tableSort', {
        detail: { tableId, key, dir: state.sortDir }
      }));
    }

    // Update bulk actions visibility
    function updateBulkActions(tableId) {
      const state = initTableState(tableId);
      const bulkActions = document.getElementById(tableId + '-bulk-actions');
      const countEl = document.getElementById(tableId + '-bulk-count');

      if (bulkActions) {
        if (state.selected.size > 0) {
          bulkActions.classList.add('visible');
          if (countEl) {
            countEl.textContent = state.selected.size + ' selected';
          }
        } else {
          bulkActions.classList.remove('visible');
        }
      }
    }

    // Get selected items
    function getSelectedItems(tableId) {
      const state = initTableState(tableId);
      return Array.from(state.selected);
    }

    // Clear selection
    function clearSelection(tableId) {
      const state = initTableState(tableId);
      state.selected.clear();

      const selectAll = document.getElementById(tableId + '-select-all');
      if (selectAll) selectAll.checked = false;

      document.querySelectorAll('#' + tableId + '-body .data-table-row').forEach(row => {
        row.classList.remove('selected');
      });

      document.querySelectorAll('#' + tableId + '-body .data-table-checkbox').forEach(cb => {
        cb.checked = false;
      });

      updateBulkActions(tableId);
    }
  `;
}
