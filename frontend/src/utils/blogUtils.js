const API_BASE = 'http://localhost:5000';

export const BLOG_CATEGORIES = [
  { id: 'All', label: 'All Posts' },
  { id: 'Coffee', label: 'Coffee' },
  { id: 'Food', label: 'Food' },
  { id: 'Cocktails', label: 'Cocktails' },
  { id: 'Lifestyle', label: 'Lifestyle' },
];

const decodeHtmlEntities = (str) => {
  if (!str || typeof document === 'undefined') return str;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

export const decodeBlogContent = (html) => {
  if (!html) return '';

  let content = html;

  for (let i = 0; i < 3; i += 1) {
    const decoded = decodeHtmlEntities(content);
    if (decoded === content) break;
    content = decoded;
  }

  content = content
    .replace(/```html\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '$1')
    .replace(/<p>\s*html\s+/gi, '<p>')
    .trim();

  return content;
};

export const normalizeBlogImage = (image) => {
  if (!image) return '';
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  return `${API_BASE}${image.startsWith('/') ? '' : '/'}${image}`;
};

export const normalizeBlogPost = (post) => {
  if (!post) return null;

  return {
    ...post,
    _id: post._id || post.id,
    image: normalizeBlogImage(post.image),
    authorImage: post.authorImage ? normalizeBlogImage(post.authorImage) : '',
    content: decodeBlogContent(post.content),
    readTime: Number(post.readTime) || 5,
    excerpt: post.excerpt || '',
    category: post.category || 'Lifestyle',
    author: post.author || 'Admin',
  };
};

export const formatBlogDate = (dateString, style = 'long') => {
  if (!dateString) return '';
  const options = style === 'short'
    ? { year: 'numeric', month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
