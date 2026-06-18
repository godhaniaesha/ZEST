import React, { useState } from 'react';
import '../styles/RatingModal.css';

const RatingModal = ({ isOpen, onClose, onSubmit, cafeOrBarName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Rate Your Experience</h2>
        <p>How was your visit to {cafeOrBarName}?</p>
        
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hover || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>
        
        <p className="rating-text">{rating > 0 ? `${rating} Star${rating !== 1 ? 's' : ''}` : 'Select a rating'}</p>
        
        <textarea
          placeholder="Share your feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength="500"
        />
        
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;