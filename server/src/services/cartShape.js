export function toCartShape(product, qty) {
  const safeQty = Math.max(1, Number(qty) || 1)
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    weight: product.weight || product.unit,
    price: Number(product.price),
    originalPrice: product.originalPrice || null,
    discount: product.discount || 0,
    stock: product.stock,
    stockLabel: product.stockLabel,
    category: product.category,
    qty: safeQty,
    subtotal: Number(product.price) * safeQty,
  }
}
