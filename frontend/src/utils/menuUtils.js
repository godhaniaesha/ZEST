export const normalizeMenuItem = (item) => ({
  id: item._id || item.id,
  name: item.name,
  category: item.category || 'General',
  categoryKey: (item.category || 'general').toLowerCase().replace(/\s+/g, '-'),
  price: Number(item.price) || 0,
  originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
  description:
    item.description ||
    `${item.name}${item.cuisine ? ` — ${item.cuisine}` : ''} from the Zest kitchen.`,
  image: item.img || item.image || '',
  status: item.status,
  cuisine: item.cuisine,
  color: item.color,
  type: item.type,
  rating: Number(item.rating) || 4.8,
  reviews: Number(item.reviews) || 120,
});

export const buildCategoryFilters = (items) => {
  const unique = [...new Set(items.map((item) => item.category).filter(Boolean))];
  return [
    { id: 'all', label: 'All Items' },
    ...unique.map((cat) => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      label: cat,
      value: cat,
    })),
  ];
};
