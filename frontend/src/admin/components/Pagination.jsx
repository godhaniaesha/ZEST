import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const firstVisiblePage = Math.max(1, currentPage - 2);
  const lastVisiblePage = Math.min(totalPages, currentPage + 2);
  const visiblePages = [];

  if (firstVisiblePage > 1) {
    visiblePages.push(1);
    if (firstVisiblePage > 2) visiblePages.push(null);
  }
  for (let page = firstVisiblePage; page <= lastVisiblePage; page += 1) {
    visiblePages.push(page);
  }
  if (lastVisiblePage < totalPages) {
    if (lastVisiblePage < totalPages - 1) visiblePages.push(null);
    visiblePages.push(totalPages);
  }

  return (
    <nav className="d-pagination" aria-label="Table pagination">
      <div className="d-pagination-info">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="d-pagination-controls">
        <button
          type="button"
          className="d-pagination-btn d-pagination-arrow"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>
        {visiblePages.map((page, index) => (
          page === null ? (
            <span className="d-pagination-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">…</span>
          ) : (
            <button
              type="button"
              key={page}
              className={`d-pagination-btn${currentPage === page ? ' active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
        <button
          type="button"
          className="d-pagination-btn d-pagination-arrow"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <MdChevronRight />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
