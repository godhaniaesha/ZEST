const BAR_CATEGORIES = ['Cocktails', 'Beer', 'Wine', 'Spirits'];

const inferMenuType = (category) => {
  if (!category) return 'Cafe';
  return BAR_CATEGORIES.includes(category) ? 'Bar' : 'Cafe';
};

const parseTypeValue = (value) => {
  if (value === 'Cafe' || value === 'Bar') return [value];
  if (typeof value !== 'string' || !value.trim()) return [];

  let trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }

  if (!trimmed.startsWith('[')) {
    return trimmed === 'Cafe' || trimmed === 'Bar' ? [trimmed] : [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => parseTypeValue(String(entry)));
  } catch {
    return [];
  }
};

const toMenuTypeArray = (type, category) => {
  let values = [];

  if (Array.isArray(type)) {
    values = type.flatMap((entry) => parseTypeValue(entry));
  } else if (type !== undefined && type !== null) {
    values = parseTypeValue(String(type));
  }

  const filtered = values.filter((t) => t === 'Cafe' || t === 'Bar');
  if (!filtered.length) return [inferMenuType(category)];
  return [...new Set(filtered)];
};

const itemHasMenuType = (type, target, category) =>
  toMenuTypeArray(type, category).includes(target);

module.exports = {
  BAR_CATEGORIES,
  inferMenuType,
  toMenuTypeArray,
  itemHasMenuType,
};
