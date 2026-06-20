import React, { useState } from 'react';
import '../styles/RatingModal.css';

const RatingModal = ({ isOpen, onClose, onSubmit, cafeOrBarName, reservation }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, review });
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.response?.data?.message || 'Could not submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-rating-title">
        <h2 id="reservation-rating-title">Rate Your Experience</h2>
        <p>How was your visit to {cafeOrBarName}?</p>
        {reservation && (
          <p className="reservation-rating-context">
            Reservation RES-{reservation._id?.slice(-6)}
          </p>
        )}

        <div className="star-rating" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`star ${star <= (hover || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        <p className="rating-text">
          {rating > 0 ? `${rating} Star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
        </p>

        <textarea
          placeholder="Share your feedback (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength="500"
        />

        <div className="rating-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
