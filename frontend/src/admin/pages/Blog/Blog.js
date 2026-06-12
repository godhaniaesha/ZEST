import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
  MdArticle, MdLocalCafe, MdRestaurant, MdLocalBar, MdFavorite
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { blogAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';


const CATEGORIES = [
  { name: 'All', icon: <MdFilterList /> },
  { name: 'Coffee', icon: <MdLocalCafe /> },
  { name: 'Food', icon: <MdRestaurant /> },
  { name: 'Cocktails', icon: <MdLocalBar /> },
  { name: 'Lifestyle', icon: <MdFavorite /> },
];


const FORM_SKIP_KEYS = ['_id', '__v', 'createdAt', 'updatedAt'];


const BLOG_FORM_FIELDS = [
  { name: 'title', label: 'Article Title *', type: 'text', required: true, col: 12, placeholder: 'e.g. The Art of Single-Origin Coffee' },
  { name: 'category', label: 'Category *', type: 'select', required: true, col: 6, options: CATEGORIES.filter(c => c.name !== 'All').map(c => ({ label: c.name, value: c.name })) },
  { name: 'author', label: 'Author *', type: 'text', required: true, col: 6, placeholder: 'Author name' },
  { name: 'authorImage', label: 'Author Image URL', type: 'text', col: 6, placeholder: 'https://example.com/author.jpg' },
  { name: 'readTime', label: 'Read Time (minutes) *', type: 'number', required: true, col: 6, placeholder: '5' },
  { name: 'image', label: 'Featured Image', type: 'file', col: 12 },
  { name: 'excerpt', label: 'Excerpt *', type: 'textarea', required: true, col: 12, placeholder: 'Brief excerpt of the article...' },
  { 
    name: 'content', 
    label: 'Content * (Write normally, will auto-format to HTML)', 
    type: 'textarea-html', 
    required: true, 
    col: 12, 
    placeholder: 'Write your article here. Lines will become paragraphs, **text** becomes bold, etc.',
    rows: 10
  },
];


export default function BlogManagement() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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

const decodeHtmlEntities = (str) => {
  if (!str) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const convertPlainTextToHTML = (text) => {
  if (!text) return '';

  let html = text.trim();

  if (html.includes('&lt;') || html.includes('&gt;') || html.includes('&amp;')) {
    html = decodeHtmlEntities(html);
  }

  html = html.replace(/```html\s*/gi, '').replace(/```\s*/g, '').trim();

  if (/<(h[1-6]|p|div|ul|ol|table|blockquote|img|pre|code)\b/i.test(html)) {
    return html;
  }

  if (!html.trim().startsWith('<')) {
    html = html
      .split(/\n\s*\n/)
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        return `<p>${paragraph.trim()}</p>`;
      })
      .join('\n');
  }
  
  html = html.replace(/^### (.+)$/g, '<h2>$1</h2>');
  html = html.replace(/^## (.+)$/g, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/g, '<h4>$1</h4>');
  
  if (!html.includes('<strong>')) {
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  
  if (!html.includes('<em>')) {
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  }
  
  html = html.replace(/^- (.+)$/g, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$1</ul>');
  
  html = html.replace(/^> (.+)$/g, '<blockquote>$1</blockquote>');
  
  html = html.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" style="width:100%; max-width:600px; border-radius:10px; margin:20px 0;" />');
  
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  
  return html;
};


  const convertHTMLToPlainText = (html) => {
    if (!html) return '';
    
    let text = html
      .replace(/<\/?h[1-6][^>]*>/g, '\n')
      .replace(/<\/?p[^>]*>/g, '\n\n')
      .replace(/<\/?ul[^>]*>/g, '\n')
      .replace(/<\/?ol[^>]*>/g, '\n')
      .replace(/<\/?li[^>]*>/g, '\n- ')
      .replace(/<\/?blockquote[^>]*>/g, '\n> ')
      .replace(/<\/?pre[^>]*>/g, '\n')
      .replace(/<\/?code[^>]*>/g, '')
      .replace(/<\/?strong[^>]*>/g, '')
      .replace(/<\/?em[^>]*>/g, '')
      .replace(/<\/?a[^>]*>/g, '')
      .replace(/<\/?img[^>]*>/g, '')
      .replace(/<\/?tr[^>]*>/g, '\n')
      .replace(/<\/?th[^>]*>/g, '|')
      .replace(/<\/?td[^>]*>/g, '|')
      .replace(/<\/?table[^>]*>/g, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return text;
  };


  const handleSave = async (data, fileData) => {
    try {
      if (data.content) {
        data.content = convertPlainTextToHTML(data.content);
      }
      
      if (!data.title || !data.category || !data.author || !data.excerpt || !data.content) {
        alert('Please fill in all required fields (Title, Category, Author, Excerpt, Content)');
        return;
      }


      if (data.readTime <= 0) {
        alert('Read time must be greater than 0');
        return;
      }


      const formDataToSend = new FormData();


      Object.keys(data).forEach(key => {
        if (FORM_SKIP_KEYS.includes(key)) return;


        const value = data[key];


        if (
          value === null ||
          value === undefined ||
          typeof value === 'object'
        ) {
          return;
        }


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
      alert('Failed to save blog post');
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '20px',
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

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Blog Article" : "Add New Blog Article"}
        initialData={formData}
        fields={BLOG_FORM_FIELDS}
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
