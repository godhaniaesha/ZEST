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

  return (
    <div className="d-flex align-items-center justify-content-between py-3">
      <div className="text-muted small" style={{ fontFamily: 'Lato, sans-serif' }}>
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="d-flex gap-2">
        <button
          className="d-navbar-icon-btn"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          <MdChevronLeft />
        </button>
        <button
          className="d-navbar-icon-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          <MdChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
