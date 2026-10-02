import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { MdSave, MdClose, MdAdd } from 'react-icons/md';

/* ─────────────────────────────────────────────
   STYLED FORM MODAL
   Drop-in replacement — same props API, new look.
   Supports both:
     • field-based:  <FormModal fields={[...]} initialData={...} />
     • children:     <FormModal><Row>...</Row></FormModal>
───────────────────────────────────────────── */

const S = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(11,25,21,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 1055,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    overflowY: 'auto',
  },
  dialog: {
    background: '#fff',
    borderRadius: '20px',
    width: '100%', maxWidth: '680px',
    maxHeight: '92vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 32px 80px rgba(11,25,21,0.18), 0 0 0 1px rgba(201,168,76,0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  // Decorative top bar
  topBar: {
    height: '4px',
    background: 'linear-gradient(90deg, var(--d-primary,#16302B) 0%, var(--d-gold,#C9A84C) 50%, var(--d-primary,#16302B) 100%)',
    flexShrink: 0,
  },
  header: {
    padding: '18px 24px 16px',
    borderBottom: '1px solid rgba(201,168,76,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
    background: 'linear-gradient(135deg, var(--d-primary,#16302B) 0%, #1f4238 100%)',
  },
  titleWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  titleIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(201,168,76,0.2)',
    border: '1px solid rgba(201,168,76,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--d-gold,#C9A84C)', fontSize: '1rem', flexShrink: 0,
  },
  titleText: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.25rem', fontWeight: 600,
    color: '#fff', letterSpacing: '0.3px', margin: 0,
  },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
    transition: 'all .18s', flexShrink: 0,
  },
  body: {
    flex: 1, overflowY: 'auto', padding: '22px 24px 8px',
  },
  footer: {
    padding: '14px 24px 18px',
    borderTop: '1px solid rgba(201,168,76,0.10)',
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    flexShrink: 0,
    background: 'var(--d-bg,#f5f4f0)',
  },
  // Field label
  label: {
    display: 'block',
    fontSize: '0.65rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '1.2px',
    color: 'var(--d-text-muted,#6b7280)', marginBottom: '5px',
  },
  // Input base
  input: {
    width: '100%',
    border: '1.5px solid var(--d-border,#e2e0da)',
    borderRadius: '10px', padding: '9px 13px',
    fontSize: '0.88rem', fontWeight: 500,
    color: 'var(--d-primary,#16302B)',
    background: '#fff', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color .18s, box-shadow .18s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: 'var(--d-gold,#C9A84C)',
    boxShadow: '0 0 0 3px rgba(201,168,76,0.12)',
  },
  // Disabled input
  inputDisabled: {
    background: 'var(--d-bg,#f5f4f0)',
    color: 'var(--d-text-muted,#6b7280)', cursor: 'not-allowed',
  },
  // File input wrapper
  fileWrap: {
    border: '1.5px dashed var(--d-border,#e2e0da)',
    borderRadius: '10px', padding: '12px 14px',
    background: 'var(--d-bg,#f5f4f0)',
    cursor: 'pointer', transition: 'border-color .18s',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  // Select
  select: {
    width: '100%',
    border: '1.5px solid var(--d-border,#e2e0da)',
    borderRadius: '10px', padding: '9px 13px',
    fontSize: '0.88rem', fontWeight: 500,
    color: 'var(--d-primary,#16302B)',
    background: '#fff', outline: 'none',
    fontFamily: 'inherit', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
    transition: 'border-color .18s, box-shadow .18s',
    boxSizing: 'border-box',
  },
  // Checkbox custom
  checkRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '10px',
    background: 'var(--d-bg,#f5f4f0)',
    border: '1.5px solid var(--d-border,#e2e0da)',
    cursor: 'pointer', transition: 'border-color .18s',
  },
  checkBox: (checked) => ({
    width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
    border: checked ? '2px solid var(--d-primary,#16302B)' : '2px solid var(--d-border,#e2e0da)',
    background: checked ? 'var(--d-primary,#16302B)' : '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .18s',
  }),
  // Image preview
  imgPreview: {
    width: '72px', height: '72px',
    borderRadius: '10px', objectFit: 'cover',
    border: '2px solid var(--d-border,#e2e0da)',
    marginTop: '8px',
  },
  btnGold: {
    background: 'linear-gradient(135deg, var(--d-gold,#C9A84C), #e4c47a)',
    color: 'var(--d-primary,#16302B)',
    border: 'none', borderRadius: '10px', padding: '10px 22px',
    fontWeight: 800, fontSize: '0.78rem',
    letterSpacing: '0.5px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'all .18s', whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(201,168,76,0.25)',
  },
  btnOutline: {
    background: 'transparent',
    color: 'var(--d-text-muted,#6b7280)',
    border: '1.5px solid var(--d-border,#e2e0da)',
    borderRadius: '10px', padding: '10px 22px',
    fontWeight: 700, fontSize: '0.78rem',
    letterSpacing: '0.3px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'all .18s', whiteSpace: 'nowrap',
  },
};

/* ── Focus / Blur handlers ── */
const focusStyle  = (e) => { Object.assign(e.target.style, { borderColor: 'var(--d-gold,#C9A84C)', boxShadow: '0 0 0 3px rgba(201,168,76,0.12)' }); };
const blurStyle   = (e) => { Object.assign(e.target.style, { borderColor: 'var(--d-border,#e2e0da)', boxShadow: 'none' }); };

/* ── Single field renderer (used in field-based mode) ── */
function FieldRenderer({ field, value, onChange, onFileChange }) {
  const sharedInputProps = {
    style: { ...S.input, ...(field.disabled ? S.inputDisabled : {}) },
    onFocus: focusStyle,
    onBlur: blurStyle,
  };

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        required={field.required}
        disabled={field.disabled}
        style={{ ...S.select, ...(field.disabled ? S.inputDisabled : {}) }}
        onFocus={focusStyle}
        onBlur={blurStyle}
      >
        <option value="">Select…</option>
        {field.options?.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea' || field.type === 'textarea-html') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        disabled={field.disabled}
        rows={field.rows || (field.type === 'textarea-html' ? 12 : 3)}
        style={{
          ...S.input,
          resize: 'vertical', lineHeight: '1.6', minHeight: field.type === 'textarea-html' ? '240px' : '80px',
          ...(field.type === 'textarea-html' ? { fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre', overflowX: 'auto', overflowWrap: 'normal' } : {}),
          ...(field.disabled ? S.inputDisabled : {}),
        }}
        onFocus={focusStyle}
        onBlur={blurStyle}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        min={field.min}
        max={field.max}
        value={value === undefined || value === null ? '' : value}
        onChange={(e) => onChange(field.name, Number(e.target.value))}
        placeholder={field.placeholder}
        required={field.required}
        disabled={field.disabled}
        {...sharedInputProps}
      />
    );
  }

  if (field.type === 'file') {
    return (
      <div>
        <label
          style={{ ...S.fileWrap, ...(field.disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
          onMouseEnter={(e) => { if (!field.disabled) e.currentTarget.style.borderColor = 'var(--d-gold,#C9A84C)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border,#e2e0da)'; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--d-gold,#C9A84C)', flexShrink: 0 }}>
            <MdAdd size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--d-primary,#16302B)' }}>Choose image</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted,#6b7280)' }}>PNG, JPG, WEBP up to 10MB</div>
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => onFileChange(field.name, e.target.files[0])} />
        </label>
        {value && (
          <img src={value} alt="Preview" style={S.imgPreview} />
        )}
      </div>
    );
  }

  if (field.type === 'checkbox') {
    const checked = Boolean(value);
    return (
      <div
        style={{ ...S.checkRow, borderColor: checked ? 'var(--d-primary,#16302B)' : 'var(--d-border,#e2e0da)' }}
        onClick={() => !field.disabled && onChange(field.name, !checked)}
      >
        <input type="checkbox" id={field.name} checked={checked}
          onChange={(e) => onChange(field.name, e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <div style={S.checkBox(checked)}>
          {checked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <label htmlFor={field.name} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--d-primary,#16302B)', cursor: 'pointer', margin: 0 }}>
          {field.label}
        </label>
      </div>
    );
  }

  // Default: text, email, password, date, tel, etc.
  return (
    <input
      type={field.type || 'text'}
      value={value || ''}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
      disabled={field.disabled}
      autoComplete={field.type === 'password' ? 'new-password' : undefined}
      {...sharedInputProps}
    />
  );
}

/* ── Section divider for grouping related fields ── */
function FieldSection({ label, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--d-gold,#C9A84C)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.2)' }} />
        {label}
        <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.2)' }} />
      </div>
      {children}
    </div>
  );
}

/* ── Main FormModal ── */
const FormModal = ({
  show,
  onHide,
  title,
  initialData,
  fields,
  onSave,
  onSubmit,
  loading,
  children,
  submitLabel,
  icon,
}) => {
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    if (show) {
      setFormData(initialData || {});
      setFileData(null);
    } else {
      setFormData({});
      setFileData(null);
    }
  }, [show, initialData]);

  const handleChange = (name, value, field) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (field?.onChange) field.onChange(value);
  };

  const handleFileChange = (name, file) => {
    setFileData({ name, file });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const handler = onSubmit || onSave;
    if (handler) handler(formData, fileData);
  };

  if (!show) return null;

  // Determine title icon letter
  const iconLetter = icon || (title ? title.trim()[0].toUpperCase() : '✦');

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onHide()}>
      <div style={S.dialog}>

        {/* Gold top bar */}
        <div style={S.topBar} />

        {/* Header */}
        <div style={S.header}>
          <div style={S.titleWrap}>
            <div style={S.titleIcon}>{iconLetter}</div>
            <h5 style={S.titleText}>{title}</h5>
          </div>
          <button
            type="button"
            style={S.closeBtn}
            onClick={onHide}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>
          <Form onSubmit={handleSubmit} id="d-form-modal-form">
            {children
              /* ── CHILDREN MODE: page provides its own JSX ── */
              ? children

              /* ── FIELD-BASED MODE: auto-render from fields array ── */
              : (
                <Row className="g-3">
                  {fields?.map((field, index) => {
                    if (field.type === 'checkbox') {
                      return (
                        <Col key={index} xs={12} md={field.col || 12}>
                          <FieldRenderer
                            field={field}
                            value={formData[field.name]}
                            onChange={handleChange}
                            onFileChange={handleFileChange}
                          />
                        </Col>
                      );
                    }
                    return (
                      <Col key={index} xs={12} md={field.col || 6}>
                        <div>
                          {field.type !== 'checkbox' && (
                            <label style={S.label}>
                              {field.label}
                              {field.required && <span style={{ color: 'var(--d-gold,#C9A84C)', marginLeft: '2px' }}>*</span>}
                            </label>
                          )}
                          <FieldRenderer
                            field={field}
                            value={formData[field.name]}
                            onChange={handleChange}
                            onFileChange={handleFileChange}
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}
          </Form>
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button
            type="button"
            style={S.btnOutline}
            onClick={onHide}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-text-muted,#6b7280)'; e.currentTarget.style.color = 'var(--d-primary,#16302B)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border,#e2e0da)'; e.currentTarget.style.color = 'var(--d-text-muted,#6b7280)'; }}
          >
            <MdClose size={14} /> Cancel
          </button>
          <button
            type="submit"
            form="d-form-modal-form"
            style={{ ...S.btnGold, ...(loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}) }}
            disabled={loading}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <MdSave size={14} /> {loading ? 'Saving…' : (submitLabel || (initialData?._id ? 'Save Changes' : 'Add'))}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FormModal;
