import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { MdSave, MdClose } from 'react-icons/md';

const FormModal = ({ show, onHide, title, initialData = {}, fields, onSave, onSubmit, loading, children }) => {
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    // Reset file data when modal closes
    if (!show) {
      setFileData(null);
    }
  }, [initialData, show]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (name, file) => {
    setFileData({ name, file });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitHandler = onSubmit || onSave;
    if (submitHandler) {
      submitHandler(formData, fileData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="d-modal">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="d-section-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Form onSubmit={handleSubmit}>
          {children || (
          <Row className="g-3">
            {fields?.map((field, index) => (
              <Col key={index} xs={12} md={field.col || 6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">{field.label}</Form.Label>
                  {field.type === 'select' ? (
                    <Form.Select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>
                  ) : field.type === 'textarea' ? (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <Form.Control
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, Number(e.target.value))}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : field.type === 'file' ? (
                    <>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(field.name, e.target.files[0])}
                      />
                      {formData[field.name] && (
                        <div className="mt-2">
                          <img 
                            src={formData[field.name]} 
                            alt="Preview" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <Form.Control
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
          </Row>
          )}

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
