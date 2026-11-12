import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNext = false,
  hasPrevious = false,
  className,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-2 py-4 ${className || ''}`}>
      <div className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious && currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext && currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
