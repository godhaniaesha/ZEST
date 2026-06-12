import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, Search } from 'lucide-react';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import '../styles/x_pages.css';
import { blogAPI } from '../api';
import { BLOG_CATEGORIES, formatBlogDate, normalizeBlogPost } from '../utils/blogUtils';

const Blog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setBlogPosts(data.map(normalizeBlogPost).filter(Boolean));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  let filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((post) => post.category === activeCategory);

  // Search filter
  if (searchQuery.trim()) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  const handlePostClick = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setCurrentPage(1);
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="x_blog_page">
        <div className="x_blog_inner">
          <div className="menu_detail_state">
            <div className="menu_detail_loader" />
            <p>Loading stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="x_blog_page">
      <div className="x_blog_inner">
        {/* Hero Section */}
        <section className="x_blog_hero">
          <div className="x_blog_hero_left">
            <div className="x_blog_hero_label">
              <span className="x_blog_hero_label_line" />
              <span className="x_blog_hero_label_text">Stories & Insights</span>
            </div>
            <h1 className="x_blog_headline">
              Food, Coffee &<br />
              <em>Conversations.</em>
            </h1>
            <p className="x_blog_hero_sub">
              Read stories from our kitchen, bar, and community. Discover tips,
              trends, and inspiration for your next meal.
            </p>
            <div className="x_blog_stats" aria-label="Blog stats">
              <div className="x_blog_stats_item">
                <strong>{blogPosts.length}</strong>
                <span>Stories</span>
              </div>
              <div className="x_blog_stats_item">
                <strong>{BLOG_CATEGORIES.length - 1}</strong>
                <span>Categories</span>
              </div>
            </div>
          </div>
          <div className="x_blog_hero_right">
            <div className="x_blog_simple_showcase">
              <div className="x_simple_frame">
                <div 
                  className="x_simple_main_img" 
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=75)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                  role="img" 
                  aria-label="Featured story" 
                />
                <div className="x_simple_frame_border" />
              </div>
              <div className="x_simple_label">
                <span className="x_simple_tag">From Our Kitchen</span>
                <h3 className="x_simple_title">Latest Stories</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Section Head */}
        <div className="x_gallery_section_head">
          <div className="x_gallery_section_title_group">
            <span className="x_gallery_section_num">01</span>
            <h2 className="x_gallery_section_title">
              Our <em>Story</em> Archive
            </h2>
          </div>
        </div>

        {/* Controls Section */}
        <section className="x_blog_controls_section">
          <div className="x_blog_top_controls">
            <div className="x_blog_search_wrap">
              <Search size={18} />
              <input
                type="search"
                className="x_blog_search_input"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search stories..."
                aria-label="Search stories"
              />
            </div>
          </div>

          <div className="x_blog_filters_bar">
            <div className="x_blog_filter_buttons" role="group" aria-label="Blog categories">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`x_blog_filter_btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results bar */}
        <div className="x_blog_results_info">
          <span className="x_blog_results_count">Showing {paginatedPosts.length} of {filteredPosts.length} stories</span>
          <strong className="x_blog_active_cat">{activeCategory}</strong>
        </div>

        {/* Blog Grid */}
        {paginatedPosts.length > 0 ? (
          <section className="x_blog_grid" aria-label="Blog posts">
            {paginatedPosts.map((post) => (
              <article
                key={post._id}
                className="x_blog_card"
                onClick={() => handlePostClick(post._id)}
                role="button"
                tabIndex={0}
                aria-label={`View ${post.title}`}
              >
                <div className="x_blog_card_img_wrap">
                  {post.image ? (
                    <img src={post.image} alt={post.title} loading="lazy" />
                  ) : (
                    <div className="x_blog_card_img_placeholder" />
                  )}
                  <div className="x_blog_card_badge">{post.category}</div>
                </div>
                <div className="x_blog_card_content">
                  <div className="x_blog_card_category">{post.category}</div>
                  <h3 className="x_blog_card_title">{post.title}</h3>
                  <p className="x_blog_card_desc">{post.excerpt}</p>
                  <div className="x_blog_card_footer">
                    <div className="x_blog_card_author">
                      {post.authorImage ? (
                        <img src={post.authorImage} alt={post.author} className="x_blog_card_author_img" />
                      ) : (
                        <div className="x_blog_card_author_initials">{getInitials(post.author)}</div>
                      )}
                      <span className="x_blog_card_author_name">{post.author}</span>
                    </div>
                    <div className="x_blog_card_meta">
                      <span className="x_blog_meta_item">
                        <Calendar size={14} />
                        {formatBlogDate(post.createdAt)}
                      </span>
                      <span className="x_blog_meta_item">
                        <Clock size={14} />
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="x_blog_empty">
            <span className="x_blog_empty_icon" aria-hidden="true">📝</span>
            <h2>No stories found</h2>
            <p>Try a different category or search term.</p>
            <button type="button" className="x_blog_reset_btn" onClick={() => {
              handleCategoryChange('All');
              setSearchQuery('');
            }}>
              View All Stories
            </button>
          </section>
        )}

        {/* Pagination */}
        {filteredPosts.length > 0 && totalPages > 1 && (
          <nav className="menu_pagination" aria-label="Page navigation">
            <button
              type="button"
              className="pagination_btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <FaArrowLeftLong size={13} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`pagination_btn${currentPage === page ? ' active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination_btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <FaArrowRightLong size={13} />
            </button>
          </nav>
        )}

        {filteredPosts.length > 0 && (
          <span className="pagination_info">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
    </div>
  );
};

export default Blog;
