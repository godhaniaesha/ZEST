const API_BASE = 'http://localhost:5000';

export const normalizeMenuItem = (item) => {
  if (!item) return null;

  const id = item.id || item._id;
  const rawImage = item.image || item.img || '';
  const image = rawImage && !rawImage.startsWith('http')
    ? `${API_BASE}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
    : rawImage;

  const type = Array.isArray(item.type)
    ? item.type
    : item.type
      ? [item.type]
      : [];

  return {
    ...item,
    id,
    image,
    type,
    description: item.description || '',
    rating: item.rating || null,
  };
};
