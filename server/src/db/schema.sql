CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'New Baneshwor',
  landmark TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'leaf',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id),
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  discount INT NOT NULL DEFAULT 0,
  stock TEXT NOT NULL DEFAULT 'in',
  stock_label TEXT NOT NULL DEFAULT 'In Stock',
  unit TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  image TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  popular INT NOT NULL DEFAULT 50,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  model TEXT,
  model_color TEXT DEFAULT '#c45d2c',
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  kicker TEXT,
  title TEXT NOT NULL,
  tag TEXT,
  detail TEXT,
  cta TEXT,
  to_path TEXT,
  theme TEXT DEFAULT 'leaf'
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address_line TEXT NOT NULL,
  landmark TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  eta TEXT,
  payment_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  image TEXT,
  brand TEXT,
  weight TEXT
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INT NOT NULL CHECK (qty > 0),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
