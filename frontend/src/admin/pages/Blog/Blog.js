import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdFilterList,
  MdArticle, MdLocalCafe, MdRestaurant, MdLocalBar, MdFavorite,
  MdSave, MdClose, MdVisibility, MdCode,
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import { blogAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

/* ─────────────────────────────────────────────
   PLAIN-TEXT → HTML  (used at save time)
───────────────────────────────────────────── */
const decodeHtmlEntities = (str) => {
  if (!str) return '';
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
};

const convertPlainTextToHTML = (text) => {
  if (!text) return '';
  let raw = text.trim();

  if (raw.includes('&lt;') || raw.includes('&gt;') || raw.includes('&amp;')) {
    raw = decodeHtmlEntities(raw);
  }
  raw = raw.replace(/```html\s*/gi, '').replace(/```\s*/g, '').trim();

  // Already HTML → return as-is
  if (/<(h[1-6]|p|div|ul|ol|table|blockquote|img|pre|code)\b/i.test(raw)) {
    return raw;
  }

  const lines  = raw.split('\n');
  const output = [];
  let   list   = [];

  const flush = () => {
    if (list.length) {
      output.push(`<ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  const fmt = (s) =>
    s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
     .replace(/\*(.+?)\*/g,     '<em>$1</em>')
     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }

    if      (/^###\s/.test(line)) { flush(); output.push(`<h2>${fmt(line.slice(4))}</h2>`); }
    else if (/^##\s/.test(line))  { flush(); output.push(`<h3>${fmt(line.slice(3))}</h3>`); }
    else if (/^#\s/.test(line))   { flush(); output.push(`<h4>${fmt(line.slice(2))}</h4>`); }
    else if (/^>\s/.test(line))   { flush(); output.push(`<blockquote>${fmt(line.slice(2))}</blockquote>`); }
    else if (/^-\s/.test(line))   { list.push(fmt(line.slice(2))); }
    else if (/^!\[/.test(line)) {
      flush();
      const m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) output.push(`<img src="${m[2]}" alt="${m[1]}" style="width:100%;max-width:600px;border-radius:10px;margin:20px 0;" />`);
    }
    else { flush(); output.push(`<p>${fmt(line)}</p>`); }
  }
  flush();
  return output.join('\n');
};

/* ─────────────────────────────────────────────
   HTML → PLAIN-TEXT MARKDOWN  (used at edit load)
───────────────────────────────────────────── */
const convertHTMLToPlainText = (html) => {
  if (!html) return '';
  return html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n### ${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n## ${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n# ${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, t) => `\n## ${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) => `\n> ${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${t.replace(/<[^>]+>/g,'').trim()}`)
    .replace(/<\/?ul[^>]*>/gi, '\n')
    .replace(/<\/?ol[^>]*>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${t.replace(/<[^>]+>/g,'').trim()}\n`)
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/* ─────────────────────────────────────────────
   BLOG CONTENT EDITOR MODAL
   Left: markdown textarea   Right: live preview
───────────────────────────────────────────── */
const SYNTAX_HELP = [
  { syntax: '# Title',        result: 'Large heading (h4)' },
  { syntax: '## Section',     result: 'Sub-heading (h3)'  },
  { syntax: '### Sub',        result: 'Smaller heading (h2)' },
  { syntax: '- item',         result: 'Bullet list item'  },
  { syntax: '**bold**',       result: 'Bold text'         },
  { syntax: '*italic*',       result: 'Italic text'       },
  { syntax: '> quote',        result: 'Block quote'       },
  { syntax: '![alt](url)',    result: 'Image'             },
  { syntax: '[text](url)',    result: 'Link'              },
];

function BlogEditorModal({ show, onHide, title, initialData, onSubmit, loading: saving }) {
  const [form,        setForm]        = useState({});
  const [fileData,    setFileData]    = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showHelp,    setShowHelp]    = useState(false);

  useEffect(() => {
    if (show) { setForm(initialData || {}); setFileData(null); setPreviewMode(false); }
  }, [show, initialData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const previewHTML = useCallback(
    () => convertPlainTextToHTML(form.content || ''),
    [form.content]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, fileData);
  };

  const insertSnippet = (snippet) => {
    const ta = document.getElementById('blog-content-editor');
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const val   = form.content || '';
    const next  = val.slice(0, start) + snippet + val.slice(end);
    set('content', next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  /* ── styles ── */
  const S = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '12px',
    },
    dialog: {
      background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '1100px',
      maxHeight: '95vh', display: 'flex', flexDirection: 'column',
      boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
      overflow: 'hidden',
    },
    header: {
      padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    },
    body: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
    footer: {
      padding: '14px 24px', borderTop: '1px solid #e5e7eb',
      display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0,
    },
    metaGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px',
    },
    label: {
      display: 'block', fontSize: '0.72rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: '#6b7280', marginBottom: '5px',
    },
    input: {
      width: '100%', border: '1px solid #d1d5db', borderRadius: '8px',
      padding: '9px 13px', fontSize: '0.9rem', outline: 'none',
      fontFamily: 'inherit', background: '#fff',
      transition: 'border-color .18s',
    },
    select: {
      width: '100%', border: '1px solid #d1d5db', borderRadius: '8px',
      padding: '9px 13px', fontSize: '0.9rem', outline: 'none',
      fontFamily: 'inherit', background: '#fff', appearance: 'none',
    },
    editorWrap: {
      border: '1px solid #d1d5db', borderRadius: '12px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    },
    toolbar: {
      background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
      padding: '8px 12px', display: 'flex', gap: '6px',
      alignItems: 'center', flexWrap: 'wrap',
    },
    toolBtn: {
      padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db',
      background: '#fff', fontSize: '0.72rem', fontWeight: 700,
      cursor: 'pointer', fontFamily: 'monospace', color: '#374151',
      transition: 'background .15s',
    },
    editorBody: { display: 'flex', minHeight: '320px' },
    textarea: {
      flex: 1, border: 'none', outline: 'none', resize: 'none',
      padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem',
      lineHeight: '1.7', color: '#111827', background: '#fff',
      minHeight: '320px',
    },
    preview: {
      flex: 1, padding: '16px 20px', overflowY: 'auto',
      borderLeft: '1px solid #e5e7eb', minHeight: '320px',
      fontSize: '0.9rem', lineHeight: '1.75',
    },
    tabBar: {
      display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb',
    },
    tab: (active) => ({
      padding: '8px 18px', fontSize: '0.78rem', fontWeight: 700,
      border: 'none', background: active ? '#fff' : '#f3f4f6',
      borderBottom: active ? '2px solid var(--d-primary, #16302B)' : '2px solid transparent',
      color: active ? 'var(--d-primary, #16302B)' : '#6b7280',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
    }),
    helpBox: {
      marginTop: '10px', background: '#f9fafb', border: '1px solid #e5e7eb',
      borderRadius: '10px', padding: '12px 16px',
    },
    helpGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '6px', marginTop: '8px',
    },
    helpItem: {
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px',
      padding: '6px 10px', fontSize: '0.75rem', display: 'flex', gap: '8px',
    },
    btnGold: {
      background: 'var(--d-gold, #C9A84C)', color: '#0e1f1c',
      border: 'none', borderRadius: '8px', padding: '9px 20px',
      fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '6px',
    },
    btnOutline: {
      background: 'transparent', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: '8px', padding: '9px 20px',
      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '6px',
    },
  };

  if (!show) return null;

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onHide()}>
      <div style={S.dialog}>

        {/* ── HEADER ── */}
        <div style={S.header}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{title}</span>
          <button style={{ ...S.btnOutline, padding: '6px 10px' }} onClick={onHide}><MdClose size={18} /></button>
        </div>

        {/* ── BODY ── */}
        <div style={S.body}>
          <form id="blog-editor-form" onSubmit={handleSubmit}>

            {/* ── META FIELDS ── */}
            <div style={S.metaGrid}>
              {/* Title — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Article Title *</label>
                <input style={S.input} value={form.title || ''} required
                  placeholder="e.g. The Art of Single-Origin Coffee"
                  onChange={e => set('title', e.target.value)} />
              </div>

              <div>
                <label style={S.label}>Category *</label>
                <select style={S.select} value={form.category || 'Coffee'} required
                  onChange={e => set('category', e.target.value)}>
                  {['Coffee','Food','Cocktails','Lifestyle'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.label}>Author *</label>
                <input style={S.input} value={form.author || ''} required
                  placeholder="Author name"
                  onChange={e => set('author', e.target.value)} />
              </div>

              <div>
                <label style={S.label}>Author Image URL</label>
                <input style={S.input} value={form.authorImage || ''}
                  placeholder="https://example.com/author.jpg"
                  onChange={e => set('authorImage', e.target.value)} />
              </div>

              <div>
                <label style={S.label}>Read Time (minutes) *</label>
                <input style={S.input} type="number" min={1} max={120}
                  value={form.readTime || 5} required
                  onChange={e => set('readTime', Number(e.target.value))} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Featured Image</label>
                <input type="file" accept="image/*" style={{ ...S.input, padding: '6px 10px' }}
                  onChange={e => setFileData({ name: 'image', file: e.target.files[0] })} />
                {form.image && (
                  <img src={form.image} alt="preview"
                    style={{ marginTop: 8, height: 72, borderRadius: 8, objectFit: 'cover' }} />
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Excerpt * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(shown on blog card, 20–300 chars)</span></label>
                <textarea style={{ ...S.input, minHeight: 72, resize: 'vertical', lineHeight: '1.5' }}
                  value={form.excerpt || ''} required minLength={20} maxLength={300}
                  placeholder="Brief summary of the article…"
                  onChange={e => set('excerpt', e.target.value)} />
              </div>
            </div>

            {/* ── CONTENT EDITOR ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ ...S.label, marginBottom: 0 }}>Content *</label>
                <button type="button"
                  style={{ ...S.btnOutline, padding: '4px 10px', fontSize: '0.72rem' }}
                  onClick={() => setShowHelp(h => !h)}>
                  {showHelp ? 'Hide' : 'Show'} syntax guide
                </button>
              </div>

              {showHelp && (
                <div style={S.helpBox}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>Markdown Syntax</div>
                  <div style={S.helpGrid}>
                    {SYNTAX_HELP.map(h => (
                      <div key={h.syntax} style={S.helpItem}>
                        <code style={{ color: 'var(--d-gold, #C9A84C)', whiteSpace: 'nowrap' }}>{h.syntax}</code>
                        <span style={{ color: '#6b7280' }}>→ {h.result}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
                    Use a blank line to separate paragraphs. Each <code>- item</code> must be on its own line.
                  </div>
                </div>
              )}

              <div style={{ ...S.editorWrap, marginTop: 8 }}>
                {/* Tab bar */}
                <div style={S.tabBar}>
                  <button type="button" style={S.tab(!previewMode)}
                    onClick={() => setPreviewMode(false)}>
                    <MdCode size={14} /> Write
                  </button>
                  <button type="button" style={S.tab(previewMode)}
                    onClick={() => setPreviewMode(true)}>
                    <MdVisibility size={14} /> Preview
                  </button>
                  {/* Quick-insert toolbar */}
                  {!previewMode && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, padding: '4px 8px', flexWrap: 'wrap' }}>
                      {[
                        ['H1', '# '],
                        ['H2', '## '],
                        ['H3', '### '],
                        ['• List', '- '],
                        ['**B**', '**bold**'],
                        ['*I*', '*italic*'],
                        ['> Quote', '> '],
                      ].map(([label, snippet]) => (
                        <button key={label} type="button" style={S.toolBtn}
                          onClick={() => insertSnippet(snippet)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={S.editorBody}>
                  {!previewMode ? (
                    <textarea
                      id="blog-content-editor"
                      style={S.textarea}
                      value={form.content || ''}
                      required
                      placeholder={`# Article Title\n\nIntroduction paragraph here.\n\n## Section Heading\n\n- List item one\n- List item two\n- List item three\n\nClosing paragraph with **bold** and *italic* text.`}
                      onChange={e => set('content', e.target.value)}
                    />
                  ) : (
                    <div style={S.preview}>
                      {form.content?.trim() ? (
                        <div
                          className="x_blogdetail_article"
                          style={{ boxShadow: 'none', border: 'none', padding: 0 }}
                          dangerouslySetInnerHTML={{ __html: previewHTML() }}
                        />
                      ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          Nothing to preview yet — write something in the Write tab.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* ── FOOTER ── */}
        <div style={S.footer}>
          <button type="button" style={S.btnOutline} onClick={onHide}>
            <MdClose size={16} /> Cancel
          </button>
          <button type="submit" form="blog-editor-form" style={S.btnGold} disabled={saving}>
            <MdSave size={16} /> {saving ? 'Saving…' : 'Save Article'}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'All',       icon: <MdFilterList /> },
  { name: 'Coffee',    icon: <MdLocalCafe /> },
  { name: 'Food',      icon: <MdRestaurant /> },
  { name: 'Cocktails', icon: <MdLocalBar /> },
  { name: 'Lifestyle', icon: <MdFavorite /> },
];

const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt'];





export default function BlogManagement() {
  const [items, setItems]       = useState([]);
  const [active, setActive]     = useState('All');
  const [searchTerm]            = useState('');
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Coffee', author: '', authorImage: '',
    excerpt: '', content: '', readTime: 5,
  });
  const { user } = useAuth();
  const userRole = user?.role || 'chef';
  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';


  const loadData = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  const filtered = items.filter(item => {
    const matchesCategory = active === 'All' || item.category === active;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({
      title: '', category: 'Coffee', author: user?.name || '', authorImage: '',
      excerpt: '', content: '', readTime: 5,
    });
    setShowForm(true);
  };


  const handleEdit = (item) => {
    setCurrentItem(item);
    const plainTextContent = convertHTMLToPlainText(item.content);
    setFormData({
      title: item.title,
      category: item.category,
      author: item.author,
      authorImage: item.authorImage || '',
      image: item.image,
      excerpt: item.excerpt,
      content: plainTextContent,
      readTime: item.readTime || 5,
    });
    setShowForm(true);
  };


  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async (data, fileData) => {
    try {
      // Convert markdown content → HTML before saving
      if (data.content) {
        data.content = convertPlainTextToHTML(data.content);
      }

      // ── Validations ──
      if (!data.title?.trim() || data.title.length < 5 || data.title.length > 200) {
        alert('Title must be between 5 and 200 characters.'); return;
      }
      if (!/^[a-zA-Z0-9\s\-.,'&!?():]+$/.test(data.title)) {
        alert('Title contains invalid characters.'); return;
      }
      if (!data.category) {
        alert('Please select a category.'); return;
      }
      if (!data.author?.trim() || data.author.length < 2 || data.author.length > 50) {
        alert('Author name must be between 2 and 50 characters.'); return;
      }
      if (!/^[a-zA-Z\s\-']+$/.test(data.author)) {
        alert('Author name can only contain letters, spaces, hyphens, and apostrophes.'); return;
      }
      if (data.authorImage?.trim()) {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(data.authorImage)) {
          alert('Please enter a valid URL for author image.'); return;
        }
      }
      if (!data.readTime || data.readTime <= 0 || data.readTime > 120) {
        alert('Read time must be between 1 and 120 minutes.'); return;
      }
      if (!data.excerpt?.trim() || data.excerpt.length < 20 || data.excerpt.length > 300) {
        alert('Excerpt must be between 20 and 300 characters.'); return;
      }
      if (!data.content?.trim() || data.content.length < 50) {
        alert('Content must be at least 50 characters.'); return;
      }

      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;
        const value = data[key];
        if (value === null || value === undefined || typeof value === 'object') return;
        formDataToSend.append(key, value);
      });
      if (fileData?.file) {
        formDataToSend.append(fileData.name, fileData.file);
      }

      if (currentItem) {
        await blogAPI.update(currentItem._id, formDataToSend);
      } else {
        await blogAPI.create(formDataToSend);
      }

      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post.');
    }
  };


  const confirmDelete = async () => {
    try {
      await blogAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };


  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdArticle /> Blog Management
          </div>
          <div className="d-page-sub">Create and manage your blog articles</div>
        </div>
        <div className="d-flex gap-2">
          {canAddEditDelete && (
            <button className="d-btn-gold" onClick={handleAdd}>
              <MdAdd /> Add New Article
            </button>
          )}
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={12}>
          <div className="x_menu_filters_bar" style={{
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '12px 0',
            width: '100%'
          }}>
            <div className="x_menu_filter_buttons" role="group" aria-label="Blog categories" style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              width: '100%'
            }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className={`x_menu_filter_btn${active === cat.name ? ' active' : ''}`}
                  onClick={() => setActive(cat.name)}
                  aria-pressed={active === cat.name}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div className="x_menu_results_info" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 0', fontFamily: '"Playfair Display", serif'}}>
        <span className="x_menu_results_count" style={{fontSize: '0.9rem', color: 'var(--d-text-muted)', fontStyle: 'italic'}}>
          {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found
        </span>
        <strong className="x_menu_active_cat" style={{fontSize: '1.4rem', fontWeight: 700, color: 'var(--d-primary-dark)', textTransform: 'capitalize'}}>
          {active}
        </strong>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <p style={{ color: 'var(--d-text-muted)' }}>Loading articles...</p>
        </div>
      ) : (
        <div className="d-blog-grid">
          {filtered.map(item => (
            <div key={item._id} className="d-blog-card">
              <div className="d-blog-card-image-wrap">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="d-blog-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(135deg, var(--d-primary), var(--d-gold))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MdArticle style={{ fontSize: '3rem', color: 'white', opacity: 0.5 }} />
                  </div>
                )}
                <div className="d-blog-card-category-badge">
                  {item.category}
                </div>
              </div>

              <div className="d-blog-card-content">
                <h3 className="d-blog-card-title">{item.title}</h3>
                <p className="d-blog-card-excerpt">{item.excerpt}</p>
                
                <div className="d-blog-card-meta" style={{
                  alignItems: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div className="d-blog-card-author" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {item.authorImage ? (
                      <img 
                        src={item.authorImage} 
                        alt={item.author} 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div className="d-blog-card-author-avatar" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--d-gold), var(--d-gold-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--d-white)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        fontFamily: '"Lato", sans-serif'
                      }}>
                        {getInitials(item.author)}
                      </div>
                    )}
                    <span className="d-blog-card-author-name" style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--d-primary-dark)'
                    }}>{item.author}</span>
                  </div>
                  <div className="d-blog-card-date" style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '0.9rem',
                    color: 'var(--d-text-muted)'
                  }}>
                    {formatDate(item.createdAt)} • {item.readTime} min read
                  </div>
                </div>

                {canAddEditDelete && (
                  <div className="d-blog-card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="d-blog-card-action-btn"
                      onClick={() => handleEdit(item)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--d-bg)',
                        color: 'var(--d-text-muted)',
                        cursor: 'pointer',
                        transition: 'var(--d-transition)',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--d-primary)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--d-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--d-bg)';
                        e.currentTarget.style.color = 'var(--d-text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <MdEdit />
                    </button>
                    <button 
                      className="d-blog-card-action-btn d-danger"
                      onClick={() => handleDeleteClick(item)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--d-bg)',
                        color: 'var(--d-text-muted)',
                        cursor: 'pointer',
                        transition: 'var(--d-transition)',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--d-danger)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--d-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--d-bg)';
                        e.currentTarget.style.color = 'var(--d-text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BlogEditorModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? 'Edit Blog Article' : 'Add New Blog Article'}
        initialData={formData}
        onSubmit={handleSave}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={confirmDelete}
        itemName={currentItem?.title}
      />
    </>
  );
}
