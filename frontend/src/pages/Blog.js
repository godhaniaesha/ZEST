import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import '../styles/x_pages.css';
import { blogAPI } from '../api';

const Blog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogPosts(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'food', label: 'Food' },
    { id: 'cocktails', label: 'Cocktails' },
    { id: 'lifestyle', label: 'Lifestyle' },
  ];

  // Filter posts
  let filteredPosts = activeCategory === 'all'
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="x_blog_page">
      {/* Hero Section */}
      <section className="x_blog_hero container">
        <div className="x_blog_hero_content">
          <span className="x_blog_eyebrow">
            <Search size={16} />
            Stories & Insights
          </span>
          <h1 className="x_blog_headline">Food, Coffee & Conversations</h1>
          <p>Read stories from our kitchen, bar, and community. Discover tips, trends, and inspiration.</p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="x_blog_controls container">
        <div className="x_blog_search_box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearch}
            className="x_blog_search_input"
          />
        </div>

        <div className="x_blog_categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`x_blog_category_btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentPage(1);
              }}
            >
              <Filter size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="x_blog_posts_section container">
        {loading ? (
          <div className="text-center py-5">
            <p>Loading articles...</p>
          </div>
        ) : paginatedPosts.length > 0 ? (
          <div className="x_blog_grid">
            {paginatedPosts.map((post) => (
              <article className="x_blog_card" key={post._id}>
                <div className="x_blog_card_image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <div className="x_blog_card_category">{post.category}</div>
                </div>
                <div className="x_blog_card_content">
                  <h3>{post.title}</h3>
                  <p className="x_blog_card_excerpt">{post.excerpt}</p>
                  <div className="x_blog_card_meta">
                    <span className="x_blog_meta_item">
                      <Calendar size={14} />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="x_blog_meta_item">
                      <Clock size={14} />
                      {post.readTime} min read
                    </span>
                  </div>
                  <div className="x_blog_card_author">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <button
                    className="x_blog_read_more"
                    onClick={() => handlePostClick(post._id)}
                  >
                    Read More
                    <ChevronRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="x_blog_no_results">
            <p>No articles found. Try adjusting your search.</p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="x_blog_pagination container">
          <div className="x_blog_pagination_controls">
            <button
              className="x_blog_page_btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="x_blog_page_numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`x_blog_page_num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="x_blog_page_btn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Blog;
