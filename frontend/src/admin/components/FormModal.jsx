import React from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { MdSave, MdClose } from 'react-icons/md';

const FormModal = ({ show, onHide, title, children, onSubmit, loading }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="d-modal">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="d-section-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {children}
          <div className="d-flex justify-content-end gap-2 mt-4 mb-2">
            <button type="button" className="d-btn-outline" onClick={onHide}>
              <MdClose /> Cancel
            </button>
            <button type="submit" className="d-btn-gold" disabled={loading}>
              <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;
