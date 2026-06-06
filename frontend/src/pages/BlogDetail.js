import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, ChevronLeft, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import '../styles/x_pages.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: 'The Art of Single-Origin Coffee',
      category: 'coffee',
      author: 'Sarah Mitchell',
      authorImage: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHVzZXJ8ZW58MHx8MHx8fDA%3D',
      date: '2024-05-15',
      readTime: 5,
      image: 'http://cdn.shopify.com/s/files/1/0017/8585/6070/files/Copy_of_Arabica_vs_robusta_beans_3_600x600.png?v=1683128142',
      excerpt: 'Discover the journey from bean to cup. Learn about different origins and how they affect flavor profiles.',
      content: `
        <p>Single-origin coffee represents the pinnacle of coffee craftsmanship. Each bean tells a story of the land where it was grown, the farmers who cultivated it, and the traditions that shaped its development.</p>
        
        <h3>Understanding Origin</h3>
        <p>Coffee sourced from a single geographical location offers unique characteristics shaped by altitude, climate, and soil composition. These factors create distinct flavor notes that make each origin special.</p>
        
        <h3>Popular Single-Origin Regions</h3>
        <ul>
          <li><strong>Ethiopian Yirgacheffe:</strong> Floral notes with bright acidity</li>
          <li><strong>Colombian Geisha:</strong> Complex with jasmine and berry notes</li>
          <li><strong>Kenyan AA:</strong> Bold with blackberry and wine undertones</li>
          <li><strong>Indonesian Sumatra:</strong> Full-bodied with earthy characteristics</li>
        </ul>
        
        <h3>The Perfect Brew</h3>
        <p>To experience single-origin coffee at its best, use proper brewing techniques. Whether pour-over, French press, or espresso, the method matters as much as the bean.</p>
        
        <p>Visit us at Zest to explore our rotating selection of single-origin coffees and discover your favorite origin.</p>
      `,
    },
    {
      id: 2,
      title: 'Cocktail Trends: What\'s Hot This Season',
      category: 'cocktails',
      author: 'James Chen',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      date: '2024-05-12',
      readTime: 7,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Explore the latest cocktail innovations and signature drinks taking the bar scene by storm.',
      content: `
        <p>The world of mixology is constantly evolving, with bartenders pushing boundaries and creating innovative drinks that challenge traditional notions of cocktails.</p>
        
        <h3>2024 Cocktail Trends</h3>
        <p>This season, we're seeing a return to classics with modern twists, sustainable practices in spirit production, and an emphasis on local ingredients.</p>
        
        <h3>Our Signature Creations</h3>
        <p>At Zest, our bartenders are crafting unique drinks that celebrate both tradition and innovation. Each cocktail is built with intention and served with care.</p>
        
        <h3>The Art of Balance</h3>
        <p>Great cocktails are about balance—balancing spirit, citrus, sweetness, and bitters to create harmony in a glass. This philosophy guides everything we pour at Zest.</p>
      `,
    },
    {
      id: 3,
      title: 'Brunch Essentials: What Makes Perfect Avocado Toast',
      category: 'food',
      author: 'Emma Rodriguez',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
      date: '2024-05-08',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1557804506-669714126472?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Master the simple yet perfect brunch classic with tips from our kitchen team.',
      content: `
        <p>Avocado toast might seem simple, but mastering it requires attention to detail and quality ingredients.</p>
        
        <h3>The Foundation: Quality Bread</h3>
        <p>Start with excellent sourdough or artisan bread. Toast it until golden and crispy on the outside, with a slight give on the inside.</p>
        
        <h3>The Star: Ripe Avocado</h3>
        <p>Choose avocados that are perfectly ripe—not too firm, not too soft. Cut and scoop gently, then mash with a fork while preserving some texture.</p>
        
        <h3>The Finishing Touches</h3>
        <ul>
          <li>Fresh lemon juice for brightness</li>
          <li>Sea salt and cracked pepper</li>
          <li>Quality olive oil</li>
          <li>Poached or fried egg on top</li>
          <li>Microgreens and red pepper flakes</li>
        </ul>
        
        <p>Try our version at Zest—we use locally-sourced avocados and house-made sourdough for the ultimate brunch experience.</p>
      `,
    },
    {
      id: 4,
      title: 'Creating the Perfect Cafe Atmosphere',
      category: 'lifestyle',
      author: 'Michael Park',
      authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      date: '2024-05-05',
      readTime: 8,
      image: 'https://images.unsplash.com/photo-1442512595331-e89e9b186f46?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Ambiance matters. Learn how we design spaces that inspire conversation and connection.',
      content: `
        <p>The atmosphere of a cafe extends far beyond decoration. It's about creating an environment where people feel welcome, inspired, and connected.</p>
        
        <h3>Lighting & Warmth</h3>
        <p>Warm, soft lighting is essential. It creates intimacy and makes people want to linger. Natural light during the day transitions to ambient lighting in the evening.</p>
        
        <h3>Sound Design</h3>
        <p>Carefully curated playlists set the mood without overwhelming conversation. The gentle sound of espresso machines and water running adds to the authentic cafe experience.</p>
        
        <h3>Spatial Design</h3>
        <p>From cozy corner nooks to communal tables, every seating area serves a purpose. We've designed Zest to accommodate solo coffee drinkers, business meetings, and friend groups alike.</p>
        
        <h3>The Human Element</h3>
        <p>Ultimately, the best cafe atmosphere comes from genuine hospitality and friendly staff who remember names and favorite drinks.</p>
      `,
    },
    {
      id: 5,
      title: 'Farm-to-Table: Our Sourcing Philosophy',
      category: 'food',
      author: 'Lisa Wong',
      authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      date: '2024-04-28',
      readTime: 7,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Meet the local farmers and producers behind our seasonal menus.',
      content: `
        <p>At Zest, our commitment to quality begins long before food reaches your plate. We work directly with local farmers and producers who share our values.</p>
        
        <h3>Seasonal Ingredients</h3>
        <p>Our menus change with the seasons to highlight the freshest available ingredients. This approach supports local agriculture and delivers better flavor.</p>
        
        <h3>Our Farmers</h3>
        <p>We're proud to partner with farms within 50 miles of our location. These relationships ensure quality, freshness, and support for our local community.</p>
        
        <h3>Sustainability in Every Bite</h3>
        <p>By sourcing locally, we reduce transportation emissions and support sustainable farming practices. Every meal at Zest is a small act of environmental responsibility.</p>
      `,
    },
    {
      id: 6,
      title: 'Espresso Fundamentals: A Beginner\'s Guide',
      category: 'coffee',
      author: 'David Johnson',
      authorImage: 'https://images.unsplash.com/photo-1516738901601-6fb3d1c70c1f?auto=format&fit=crop&w=100&q=80',
      date: '2024-04-22',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Understand the basics of espresso preparation and what makes a perfect shot.',
      content: `
        <p>Espresso is both art and science. Understanding the fundamentals will help you appreciate every shot.</p>
        
        <h3>The Bean</h3>
        <p>Espresso is made from finely ground coffee, typically a blend designed to handle the high pressure of espresso machines.</p>
        
        <h3>Grinding & Tamping</h3>
        <p>Consistency in grind size and tamping pressure are crucial. Too fine and the shot chokes; too coarse and it runs too quickly.</p>
        
        <h3>The Perfect Shot</h3>
        <p>A quality espresso shot should take 25-30 seconds to pull, yielding about 1-2 ounces of dark, aromatic liquid with a rich crema on top.</p>
        
        <h3>Learn From the Pros</h3>
        <p>Our baristas at Zest are always happy to explain the process and help you understand what makes a perfect espresso.</p>
      `,
    },
    {
      id: 7,
      title: 'Desserts That Tell a Story',
      category: 'food',
      author: 'Sophie Anderson',
      authorImage: 'https://images.unsplash.com/photo-1494231646652-7e0673b92941?auto=format&fit=crop&w=100&q=80',
      date: '2024-04-18',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Behind every dessert is inspiration. Meet our pastry chef and discover the stories behind our creations.',
      content: `
        <p>Every dessert at Zest has a story. Our pastry team draws inspiration from travels, family recipes, and seasonal ingredients to create memorable sweets.</p>
        
        <h3>The Chocolate Lava Cake</h3>
        <p>This signature dessert was inspired by a tiny bistro in Paris. The molten center symbolizes the liquid gold of perfectly melted chocolate.</p>
        
        <h3>Seasonal Specials</h3>
        <p>Our menu rotates to celebrate each season's unique flavors. Summer brings berry tarts, autumn features spiced preparations, and winter brings warming chocolate creations.</p>
        
        <h3>Quality Ingredients Matter</h3>
        <p>We source premium chocolate, fresh fruit, and quality dairy to ensure every dessert is special. No shortcuts, no artificial ingredients.</p>
      `,
    },
    {
      id: 8,
      title: 'The Science of Flavor Pairing',
      category: 'cocktails',
      author: 'Alex Kumar',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      date: '2024-04-12',
      readTime: 8,
      image: 'https://images.unsplash.com/photo-1536715088601-f84fd2c72ef4?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'How our mixologists craft perfectly balanced cocktails that complement your meal.',
      content: `
        <p>Flavor pairing is an ancient art form, now supported by modern food science. At Zest, our mixologists use these principles to craft complementary drinks.</p>
        
        <h3>Understanding Flavor Profiles</h3>
        <p>Each spirit, fruit, and bitters brings unique flavor compounds. Successful cocktails balance these elements in harmony.</p>
        
        <h3>Complementary vs. Contrasting</h3>
        <p>Sometimes flavors work best together (complementary), while other times contrast creates interest. Our bartenders understand both approaches.</p>
        
        <h3>Cocktails That Match Your Meal</h3>
        <p>Whether you're enjoying a light breakfast or a hearty dinner, we have cocktails designed to enhance your culinary experience.</p>
      `,
    },
    {
      id: 9,
      title: 'Wellness Through Coffee Culture',
      category: 'coffee',
      author: 'Nina Patel',
      authorImage: 'https://images.unsplash.com/photo-1517746712202-7d88fb2ce338?auto=format&fit=crop&w=100&q=80',
      date: '2024-04-08',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1527980965255-ce3bdb47b447?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Beyond caffeine: exploring the mental and social benefits of coffee culture.',
      content: `
        <p>Coffee brings people together in meaningful ways. Beyond the caffeine boost, coffee culture offers genuine wellness benefits.</p>
        
        <h3>The Ritual of Slowing Down</h3>
        <p>Taking time to enjoy a quality cup of coffee encourages mindfulness and a break from our hectic schedules.</p>
        
        <h3>Community Connection</h3>
        <p>Cafes serve as gathering places where connections happen. Regular faces become friends, conversations spark ideas, and isolation melts away.</p>
        
        <h3>Mental Clarity</h3>
        <p>The ritual of coffee preparation and consumption can help focus your mind and prepare you for the day ahead.</p>
        
        <h3>Join Us</h3>
        <p>Visit Zest not just for great coffee, but for the wellness benefits of community, ritual, and connection.</p>
      `,
    },
  ];

  const post = blogPosts.find((p) => p.id === parseInt(id));

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

  const currentPostIndex = blogPosts.findIndex((p) => p.id === parseInt(id));
  const prevPost = currentPostIndex > 0 ? blogPosts[currentPostIndex - 1] : null;
  const nextPost = currentPostIndex < blogPosts.length - 1 ? blogPosts[currentPostIndex + 1] : null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
                <img src={post.authorImage} alt={post.author} className="x_author_avatar" />
                <div>
                  <p className="x_author_name">{post.author}</p>
                  <div className="x_blogdetail_date_time">
                    <Calendar size={14} />
                    <span>{formatDate(post.date)}</span>
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
              <div className="x_blogdetail_nav_card" onClick={() => navigate(`/blog/${prevPost.id}`)}>
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
              <div className="x_blogdetail_nav_card" onClick={() => navigate(`/blog/${nextPost.id}`)}>
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
