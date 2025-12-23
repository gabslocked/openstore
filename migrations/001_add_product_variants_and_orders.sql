-- Migration: Add product variants, orders, and shipping tables
-- Created: 2025-10-03
-- Description: Adds support for product variations (colors/flavors), order management, and shipping

-- ============================================
-- FIX EXISTING TABLES
-- ============================================

-- Add visible column to products if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='visible') THEN
    ALTER TABLE products ADD COLUMN visible BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

-- Table for product variants (colors, flavors, sizes)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Azul", "Morango", "500 Puffs"
  sku VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  weight_kg DECIMAL(10,3) DEFAULT 0.1, -- Peso para cálculo de frete
  color_hex VARCHAR(7), -- Ex: "#FF0000" para cores
  flavor VARCHAR(100), -- Para sabores
  size VARCHAR(50), -- Para tamanhos
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock);

-- Imagens específicas para variações
CREATE TABLE IF NOT EXISTS product_variant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variant_images_variant_id ON product_variant_images(variant_id);

-- ============================================
-- ORDERS & SHIPPING
-- ============================================

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Dados do cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_document VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Endereço de entrega
  customer_cep VARCHAR(10) NOT NULL,
  customer_address TEXT,
  customer_number VARCHAR(20),
  customer_complement VARCHAR(255),
  customer_neighborhood VARCHAR(255),
  customer_city VARCHAR(255),
  customer_state VARCHAR(2),
  
  -- Informações de entrega
  shipping_distance_km DECIMAL(10,2),
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  shipping_time_minutes INTEGER,
  delivery_notes TEXT,
  
  -- Valores
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Status do pedido
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, processing, shipped, delivered, cancelled, failed
  payment_method VARCHAR(50) DEFAULT 'pix',
  
  -- Timestamps
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_document ON orders(customer_document);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Referências aos produtos
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- Dados do item (snapshot no momento da compra)
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  sku VARCHAR(100),
  
  -- Valores
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Metadados
  product_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- ============================================
-- STOCK HISTORY (Opcional - para auditoria)
-- ============================================

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  
  movement_type VARCHAR(50) NOT NULL, -- sale, restock, adjustment, return
  quantity_change INTEGER NOT NULL, -- Positivo para entrada, negativo para saída
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  
  notes TEXT,
  created_by UUID, -- ID do admin que fez a mudança
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplica trigger nas tabelas relevantes
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE product_variants IS 'Variações de produtos (cores, sabores, tamanhos)';
COMMENT ON TABLE product_variant_images IS 'Imagens específicas para cada variação';
COMMENT ON TABLE orders IS 'Pedidos dos clientes';
COMMENT ON TABLE order_items IS 'Itens de cada pedido';
COMMENT ON TABLE stock_movements IS 'Histórico de movimentações de estoque';
