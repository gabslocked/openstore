-- Migration: Add cost price to products and platform fee tracking
-- Created: 2025-10-03
-- Description: Adds cost price for profit calculation and platform fee tracking

-- ============================================
-- ADD COST PRICE TO PRODUCTS
-- ============================================

-- Add cost_price to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;

-- Add cost_price to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN products.cost_price IS 'Preço de custo do produto (para cálculo de lucro)';
COMMENT ON COLUMN product_variants.cost_price IS 'Preço de custo da variação (para cálculo de lucro)';

-- ============================================
-- PLATFORM FEE TRACKING
-- ============================================

-- Table for monthly platform fees
CREATE TABLE IF NOT EXISTS platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL, -- Primeiro dia do mês (ex: 2025-10-01)
  
  -- Valores do mês
  total_revenue DECIMAL(10,2) DEFAULT 0, -- Faturamento total
  total_cost DECIMAL(10,2) DEFAULT 0, -- Custo total dos produtos
  gross_profit DECIMAL(10,2) DEFAULT 0, -- Lucro bruto (revenue - cost)
  
  -- Taxa de plataforma (5% do faturamento)
  platform_fee_rate DECIMAL(5,2) DEFAULT 5.00, -- Percentual (5%)
  platform_fee_amount DECIMAL(10,2) DEFAULT 0, -- Valor da taxa
  
  -- Lucro líquido (após taxa de plataforma)
  net_profit DECIMAL(10,2) DEFAULT 0, -- gross_profit - platform_fee
  
  -- Estatísticas
  total_orders INTEGER DEFAULT 0,
  paid_orders INTEGER DEFAULT 0,
  
  -- Timestamps
  calculated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(month)
);

CREATE INDEX IF NOT EXISTS idx_platform_fees_month ON platform_fees(month DESC);

COMMENT ON TABLE platform_fees IS 'Taxas de plataforma e lucros mensais';

-- ============================================
-- ORDER ITEMS - ADD COST PRICE
-- ============================================

-- Add cost_price to order_items (snapshot at purchase time)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN order_items.cost_price IS 'Preço de custo no momento da compra (para cálculo de lucro)';

-- ============================================
-- FUNCTION TO CALCULATE MONTHLY FEES
-- ============================================

CREATE OR REPLACE FUNCTION calculate_monthly_platform_fee(target_month DATE)
RETURNS void AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_total_cost DECIMAL(10,2);
  v_gross_profit DECIMAL(10,2);
  v_platform_fee DECIMAL(10,2);
  v_net_profit DECIMAL(10,2);
  v_total_orders INTEGER;
  v_paid_orders INTEGER;
  v_month_start DATE;
  v_month_end DATE;
BEGIN
  -- Primeiro dia do mês
  v_month_start := DATE_TRUNC('month', target_month);
  v_month_end := v_month_start + INTERVAL '1 month';
  
  -- Calcula receita total (pedidos pagos)
  SELECT 
    COALESCE(SUM(o.total), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered'))
  INTO v_total_revenue, v_total_orders, v_paid_orders
  FROM orders o
  WHERE o.created_at >= v_month_start 
    AND o.created_at < v_month_end
    AND o.status IN ('paid', 'processing', 'shipped', 'delivered');
  
  -- Calcula custo total dos produtos vendidos
  SELECT COALESCE(SUM(oi.cost_price * oi.quantity), 0)
  INTO v_total_cost
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.created_at >= v_month_start 
    AND o.created_at < v_month_end
    AND o.status IN ('paid', 'processing', 'shipped', 'delivered');
  
  -- Calcula lucro bruto
  v_gross_profit := v_total_revenue - v_total_cost;
  
  -- Calcula taxa de plataforma (5% do faturamento)
  v_platform_fee := v_total_revenue * 0.05;
  
  -- Calcula lucro líquido
  v_net_profit := v_gross_profit - v_platform_fee;
  
  -- Insere ou atualiza registro
  INSERT INTO platform_fees (
    month, total_revenue, total_cost, gross_profit,
    platform_fee_amount, net_profit,
    total_orders, paid_orders
  ) VALUES (
    v_month_start, v_total_revenue, v_total_cost, v_gross_profit,
    v_platform_fee, v_net_profit,
    v_total_orders, v_paid_orders
  )
  ON CONFLICT (month) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_cost = EXCLUDED.total_cost,
    gross_profit = EXCLUDED.gross_profit,
    platform_fee_amount = EXCLUDED.platform_fee_amount,
    net_profit = EXCLUDED.net_profit,
    total_orders = EXCLUDED.total_orders,
    paid_orders = EXCLUDED.paid_orders,
    updated_at = NOW();
  
  RAISE NOTICE 'Cálculo concluído para %: Receita=%, Custo=%, Lucro Bruto=%, Taxa=%, Lucro Líquido=%',
    v_month_start, v_total_revenue, v_total_cost, v_gross_profit, v_platform_fee, v_net_profit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_monthly_platform_fee IS 'Calcula taxas de plataforma e lucros para um mês específico';

-- ============================================
-- TRIGGER TO UPDATE FEES AUTOMATICALLY
-- ============================================

-- Trigger para recalcular fees quando um pedido for atualizado
CREATE OR REPLACE FUNCTION trigger_recalculate_platform_fees()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcula para o mês do pedido
  PERFORM calculate_monthly_platform_fee(DATE_TRUNC('month', NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_fees_on_order_update ON orders;
CREATE TRIGGER recalculate_fees_on_order_update
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status IN ('paid', 'processing', 'shipped', 'delivered'))
  EXECUTE FUNCTION trigger_recalculate_platform_fees();

COMMENT ON TRIGGER recalculate_fees_on_order_update ON orders IS 'Recalcula taxas de plataforma quando pedido é pago';
