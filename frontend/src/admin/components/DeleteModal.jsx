import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MdDeleteForever, MdClose } from 'react-icons/md';

const DeleteModal = ({ show, onHide, onConfirm, itemName, title = "Confirm Delete" }) => {
  return (
    <Modal show={show} onHide={onHide} centered className="d-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-section-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <MdDeleteForever size={60} color="var(--d-danger)" style={{ opacity: 0.2 }} />
        </div>
        <h5 className="mb-2">Are you sure?</h5>
        <p className="text-muted mb-0">
          You are about to delete <strong>{itemName}</strong>. This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 justify-content-center gap-2 pb-4">
        <button className="d-btn-outline" onClick={onHide}>
          <MdClose /> Cancel
        </button>
        <button className="d-btn-primary" style={{ background: 'var(--d-danger)' }} onClick={onConfirm}>
          <MdDeleteForever /> Delete Now
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
