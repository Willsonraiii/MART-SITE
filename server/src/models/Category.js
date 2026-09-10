export function normalizeCategory(input, count = 0) {
  return {
    id: String(input.id),
    name: input.name,
    tone: input.tone || 'leaf',
    count,
  }
}
