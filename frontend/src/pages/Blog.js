import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import '../styles/x_pages.css';

const Blog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const blogPosts = [
    {
      id: 1,
      title: 'The Art of Single-Origin Coffee',
      category: 'coffee',
      author: 'Sarah Mitchell',
      date: '2024-05-15',
      readTime: 5,
      image: 'http://cdn.shopify.com/s/files/1/0017/8585/6070/files/Copy_of_Arabica_vs_robusta_beans_3_600x600.png?v=1683128142',
      excerpt: 'Discover the journey from bean to cup. Learn about different origins and how they affect flavor profiles.',
      content: 'Single-origin coffee represents the pinnacle of coffee craftsmanship...',
    },
    {
      id: 2,
      title: 'Cocktail Trends: What\'s Hot This Season',
      category: 'cocktails',
      author: 'James Chen',
      date: '2024-05-12',
      readTime: 7,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Explore the latest cocktail innovations and signature drinks taking the bar scene by storm.',
      content: 'The world of mixology is constantly evolving...',
    },
    // {
    //   id: 3,
    //   title: 'Brunch Essentials: What Makes Perfect Avocado Toast',
    //   category: 'food',
    //   author: 'Emma Rodriguez',
    //   date: '2024-05-08',
    //   readTime: 6,
    //   image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=800&q=80',
    //   excerpt: 'Master the simple yet perfect brunch classic with tips from our kitchen team.',
    //   content: 'Great avocado toast starts with quality ingredients...',
    // },
    {
      id: 4,
      title: 'Creating the Perfect Cafe Atmosphere',
      category: 'lifestyle',
      author: 'Michael Park',
      date: '2024-05-05',
      readTime: 8,
      image: 'https://images.unsplash.com/photo-1442512595331-e89e9b186f46?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Ambiance matters. Learn how we design spaces that inspire conversation and connection.',
      content: 'The atmosphere of a cafe is just as important as the coffee...',
    },
    {
      id: 5,
      title: 'Farm-to-Table: Our Sourcing Philosophy',
      category: 'food',
      author: 'Lisa Wong',
      date: '2024-04-28',
      readTime: 7,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Meet the local farmers and producers behind our seasonal menus.',
      content: 'Our commitment to quality starts with our suppliers...',
    },
    {
      id: 6,
      title: 'Espresso Fundamentals: A Beginner\'s Guide',
      category: 'coffee',
      author: 'David Johnson',
      date: '2024-04-22',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Understand the basics of espresso preparation and what makes a perfect shot.',
      content: 'Espresso is both art and science...',
    },
    {
      id: 7,
      title: 'Desserts That Tell a Story',
      category: 'food',
      author: 'Sophie Anderson',
      date: '2024-04-18',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Behind every dessert is inspiration. Meet our pastry chef and discover the stories behind our creations.',
      content: 'Every dessert at Zest has a purpose...',
    },
    {
      id: 8,
      title: 'The Science of Flavor Pairing',
      category: 'cocktails',
      author: 'Alex Kumar',
      date: '2024-04-12',
      readTime: 8,
      image: 'https://images.unsplash.com/photo-1536715088601-f84fd2c72ef4?auto=format&fit=crop&w=800&q=80',
      excerpt: 'How our mixologists craft perfectly balanced cocktails that complement your meal.',
      content: 'Flavor pairing is an ancient art form...',
    },
    {
      id: 9,
      title: 'Wellness Through Coffee Culture',
      category: 'coffee',
      author: 'Nina Patel',
      date: '2024-04-08',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1527980965255-ce3bdb47b447?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Beyond caffeine: exploring the mental and social benefits of coffee culture.',
      content: 'Coffee brings people together in meaningful ways...',
    },
  ];

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
        {paginatedPosts.length > 0 ? (
          <div className="x_blog_grid">
            {paginatedPosts.map((post) => (
              <article className="x_blog_card" key={post.id}>
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
                      {formatDate(post.date)}
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
                    onClick={() => handlePostClick(post.id)}
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
