export function normalizeOffer(input) {
  return {
    id: String(input.id),
    kicker: input.kicker,
    title: input.title,
    tag: input.tag,
    detail: input.detail,
    cta: input.cta,
    to: input.to,
    theme: input.theme || 'leaf',
  }
}
