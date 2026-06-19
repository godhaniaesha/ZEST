
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { MdSave, MdClose } from 'react-icons/md';

const FormModal = ({
  show,
  onHide,
  title,
  initialData,
  fields,
  onSave,
  onSubmit,
  loading,
  children
}) => {
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    if (show) {
      setFormData(initialData || {});
    } else {
      setFormData({});
      setFileData(null);
    }
  }, [show, initialData]);

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
        <Modal.Title className="d-section-title">
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4">
        <Form onSubmit={handleSubmit}>
          {children || (
            <Row className="g-3">
              {fields?.map((field, index) => (
                <Col key={index} xs={12} md={field.col || 6}>
                  <Form.Group>
                    {field.type !== 'checkbox' && (
                      <Form.Label className="small fw-bold">
                        {field.label}
                      </Form.Label>
                    )}

                    {field.type === 'select' ? (
                      <Form.Select
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        required={field.required}
                      >
                        <option value="">Select...</option>

                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : field.type === 'textarea' ? (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : field.type === 'number' ? (
                      <Form.Control
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleChange(field.name, Number(e.target.value))
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : field.type === 'file' ? (
                      <>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(field.name, e.target.files[0])
                          }
                        />

                        {formData[field.name] && (
                          <div className="mt-2">
                            <img
                              src={formData[field.name]}
                              alt="Preview"
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : field.type === 'checkbox' ? (
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            position: 'relative',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleChange(field.name, !formData[field.name])}
                        >
                          <input
                            type="checkbox"
                            id={field.name}
                            checked={formData[field.name] || false}
                            onChange={(e) => handleChange(field.name, e.target.checked)}
                            style={{
                              position: 'absolute',
                              opacity: 0,
                              width: '100%',
                              height: '100%',
                              cursor: 'pointer',
                              zIndex: 1
                            }}
                          />
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              border: formData[field.name] ? '2px solid var(--d-primary)' : '2px solid var(--d-border)',
                              borderRadius: '4px',
                              backgroundColor: formData[field.name] ? 'var(--d-primary)' : 'var(--d-white)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--d-transition)'
                            }}
                          >
                            {formData[field.name] && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </div>
                        <label
                          htmlFor={field.name}
                          className="small mb-0"
                          style={{
                            cursor: 'pointer',
                            fontWeight: '500',
                            color: 'var(--d-text)'
                          }}
                        >
                          {field.label}
                        </label>
                      </div>
                    ) : (
                      <Form.Control
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
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
            <button
              type="button"
              className="d-btn-outline"
              onClick={onHide}
            >
              <MdClose /> Cancel
            </button>

            <button
              type="submit"
              className="d-btn-gold"
              disabled={loading}
            >
              <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;

