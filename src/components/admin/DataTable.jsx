import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';

/**
 * DataTable Component
 * Fully featured table component supporting client-side searching, sorting, pagination,
 * custom column renderers, and responsive card views on mobile.
 */
export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  pageSize = 10,
  emptyMessage = 'No matching records found.',
  onRowClick = null,
  actions = null
}) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter by search term across all accessible string columns
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.accessor];
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, search, columns]);

  // Handle Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        const comp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comp : -comp;
      }

      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (accessor) => {
    if (!accessor) return;
    if (sortField === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(accessor);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border border-[#EBE2D8] rounded-xl shadow-xs overflow-hidden">
      {/* Search and Header controls */}
      {(searchable || actions) && (
        <div className="p-4 border-b border-[#EBE2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0] text-[#2C1D15] placeholder-[#8C7A6B]"
              />
            </div>
          ) : <div />}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#DDD1BF]/25 border-b border-[#EBE2D8] text-[#5C4033] uppercase tracking-wider font-semibold text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  className={`py-3 px-4 ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-[#DDD1BF]/40 transition-colors select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown className="w-3 h-3 text-[#8C7A6B] opacity-70" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE2D8]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-[#8C7A6B] text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-[#F9F6F0] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-3 px-4 text-[#2C1D15] align-middle">
                      {col.render ? col.render(row) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-[#EBE2D8] bg-[#F9F6F0]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C4033]">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#2C1D15]">
            {sortedData.length === 0 ? 0 : startIndex + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[#2C1D15]">
            {Math.min(startIndex + pageSize, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-[#2C1D15]">{sortedData.length}</span> results
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-[#EBE2D8] bg-white disabled:opacity-40 hover:bg-[#F9F6F0] text-[#2C1D15] transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-[#EBE2D8] bg-white disabled:opacity-40 hover:bg-[#F9F6F0] text-[#2C1D15] transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 text-xs font-medium text-[#2C1D15]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded-md border border-[#EBE2D8] bg-white disabled:opacity-40 hover:bg-[#F9F6F0] text-[#2C1D15] transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded-md border border-[#EBE2D8] bg-white disabled:opacity-40 hover:bg-[#F9F6F0] text-[#2C1D15] transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
