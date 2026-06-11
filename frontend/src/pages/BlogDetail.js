import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronLeft, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import '../styles/x_pages.css';
import { blogAPI } from '../api';

const BlogDetail = () => {
  const { id, _id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostAndAll();
  }, [id]);

  const fetchPostAndAll = async () => {
    try {
      const [postResponse, allResponse] = await Promise.all([
        blogAPI.getById(id),
        blogAPI.getAll(),
      ]);
      setPost(postResponse.data);
      setAllPosts(allResponse.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="x_blogdetail_page">
        <section className="container text-center py-5">
          <p>Loading article...</p>
        </section>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="x_blogdetail_page">
        <section className="x_blogdetail_notfound container">
          <h1>Article Not Found</h1>
          <p>Sorry, we couldn't find the article you're looking for.</p>
          <button className="x_blog_back_btn" onClick={() => navigate('/blog')}>
            <ChevronLeft size={18} />
            Back to Blog
          </button>
        </section>
      </main>
    );
  }

  const currentPostIndex = allPosts.findIndex((p) => p._id === id);
  const prevPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;
  const nextPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null;

  return (
    <main className="x_blogdetail_page">
      {/* Article Header */}
      <section className="x_blogdetail_header">
        <div className="container">
          <button className="x_blog_back_btn" onClick={() => navigate('/blog')}>
            <ChevronLeft size={18} />
            Back to Blog
          </button>
          <div className="x_blogdetail_header_content">
            <div className="x_blogdetail_category">{post.category}</div>
            <h1 className="x_blogdetail_title">{post.title}</h1>
            <div className="x_blogdetail_meta">
              <div className="x_blogdetail_author">
                <img src={post.authorImage || 'https://via.placeholder.com/50'} alt={post.author} className="x_author_avatar" />
                <div>
                  <p className="x_author_name">{post.author}</p>
                  <div className="x_blogdetail_date_time">
                    <Calendar size={14} />
                    <span>{formatDate(post.createdAt)}</span>
                    <Clock size={14} />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </div>
              <div className="x_blogdetail_share">
                <button className="x_share_btn" title="Share">
                  <Share2 size={18} />
                </button>
                <button className="x_comment_btn" title="Comments">
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="x_blogdetail_image">
        <img src={post.image} alt={post.title} />
      </section>

      {/* Article Content */}
      <article className="x_blogdetail_content container">
        <div className="x_blogdetail_article">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      {/* Navigation */}
      {(prevPost || nextPost) && (
        <section className="x_blogdetail_nav container">
          <div className="x_blogdetail_nav_grid">
            {prevPost ? (
              <div className="x_blogdetail_nav_card" onClick={() => navigate(`/blog/${prevPost._id}`)}>
                <ChevronLeft size={20} />
                <div>
                  <p className="x_nav_label">Previous Article</p>
                  <p className="x_nav_title">{prevPost.title}</p>
                </div>
              </div>
            ) : (
              <div />
            )}
            {nextPost ? (
              <div className="x_blogdetail_nav_card" onClick={() => navigate(`/blog/${nextPost._id}`)}>
                <div>
                  <p className="x_nav_label">Next Article</p>
                  <p className="x_nav_title">{nextPost.title}</p>
                </div>
                <ChevronRight size={20} />
              </div>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogDetail;