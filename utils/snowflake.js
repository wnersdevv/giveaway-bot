function extractIds(raw) {
  if (!raw) return [];
  const matches = raw.match(/\d{17,20}/g);
  return matches ? [...new Set(matches)] : [];
}

module.exports = { extractIds };
