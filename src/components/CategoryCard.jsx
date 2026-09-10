import { Link } from 'react-router-dom'
import { CategoryIcon } from './Icons'

export default function CategoryCard({ category }) {
  return (
    <Link className="cat-card" to={`/shop?category=${category.id}`} style={{ perspective: '600px' }}>
      <CategoryIcon id={category.id} />
      <div>
        <h3>{category.name}</h3>
        <small>{category.count} products</small>
      </div>
    </Link>
  )
}
