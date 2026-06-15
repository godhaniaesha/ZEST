import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronLeft, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import '../styles/x_pages.css';
import { blogAPI } from '../api';
import { formatBlogDate, normalizeBlogPost } from '../utils/blogUtils';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostAndAll();
  }, [id]);

  const fetchPostAndAll = async () => {
    try {
      setLoading(true);
      const [postResponse, allResponse] = await Promise.all([
        blogAPI.getById(id),
        blogAPI.getAll(),
      ]);
      setPost(normalizeBlogPost(postResponse.data));
      const data = Array.isArray(allResponse.data) ? allResponse.data : [];
      setAllPosts(data.map(normalizeBlogPost).filter(Boolean));
    } catch (error) {
      console.error('Error fetching blog:', error);
      setPost(null);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
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
        <div className="x_blogdetail_header_container">
          <button className="x_blog_back_btn" onClick={() => navigate('/blog')}>
            <ChevronLeft size={18} />
            Back to Blog
          </button>
          
          <div className="x_blogdetail_header_grid">
            <div className="x_blogdetail_header_left">
              <div className="x_blogdetail_hero_label">
                <span className="x_blogdetail_hero_label_line"></span>
                <span className="x_blogdetail_hero_label_text">Stories &amp; Insights</span>
              </div>
              
              <div className="x_blogdetail_category">{post.category}</div>
              <h1 className="x_blogdetail_title">{post.title}</h1>
              <p className="x_blogdetail_excerpt">{post.excerpt}</p>
              
              <div className="x_blogdetail_meta">
                <div className="x_blogdetail_author">
                  {post.authorImage ? (
                    <img src={post.authorImage} alt={post.author} className="x_author_avatar" />
                  ) : (
                    <div className="x_author_avatar_fallback">
                      <User size={20} />
                    </div>
                  )}
                  <div className="x_author_info">
                    <p className="x_author_name">{post.author}</p>
                    <div className="x_blogdetail_date_time">
                      <Calendar size={14} />
                      <span>{formatBlogDate(post.createdAt)}</span>
                      <span className="x_dot">•</span>
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
            
            {post.image && (
              <div className="x_blogdetail_header_right">
                <div className="x_blogdetail_image_frame">
                  <img src={post.image} alt={post.title} className="x_blogdetail_hero_image" />
                  <div className="x_blogdetail_image_border"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image (if not in header) */}
      {!post.image && (
        <section className="x_blogdetail_image"></section>
      )}



      {/* Article Content */}
      <article className="x_blogdetail_content container">
        <div className="x_blogdetail_article">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      {/* Navigation */}
      {(prevPost || nextPost) && (
        <section className="x_blogdetail_nav ">
          <div className="x_blogdetail_nav_grid">
            {prevPost ? (
              <div className="x_blogdetail_nav_card" onClick={() => navigate(`/blog/${prevPost._id}`)}>
                <ChevronLeft size={24} />
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
                <ChevronRight size={24} />
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