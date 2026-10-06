import React from "react";
import { Modal } from "react-bootstrap";
import { MdClose, MdLogout } from "react-icons/md";
import "../styles/logout-confirm-modal.css";

export default function LogoutConfirmModal({ show, onCancel, onConfirm }) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      className="logout-confirm-modal"
      aria-labelledby="logout-confirm-title"
    >
      <Modal.Body className="logout-confirm-body">
        <div className="logout-confirm-icon" aria-hidden="true">
          <MdLogout size={30} />
        </div>
        <span className="logout-confirm-eyebrow">ZÉST ACCOUNT</span>
        <h2 id="logout-confirm-title">Sign out?</h2>
        <p>Are you sure you want to end your current session?</p>
        <div className="logout-confirm-actions">
          <button
            type="button"
            className="logout-confirm-cancel"
            onClick={onCancel}
          >
            <MdClose aria-hidden="true" />
            Stay signed in
          </button>
          <button
            type="button"
            className="logout-confirm-submit"
            onClick={onConfirm}
          >
            <MdLogout aria-hidden="true" />
            Sign out
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
