-- Extend resell_links to support offers too
ALTER TABLE resell_links
  ADD COLUMN IF NOT EXISTS offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS item_type text CHECK (item_type IN ('product','offer')) DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS reseller_price decimal(10,2);

-- Add helpful composite index
CREATE INDEX IF NOT EXISTS idx_resell_item ON resell_links (item_type, user_id);

-- Make product_id nullable to allow offers
ALTER TABLE resell_links 
  ALTER COLUMN product_id DROP NOT NULL;

-- Add constraint to ensure either product_id or offer_id is set
ALTER TABLE resell_links 
  ADD CONSTRAINT check_product_or_offer 
  CHECK ((product_id IS NOT NULL AND offer_id IS NULL) OR (product_id IS NULL AND offer_id IS NOT NULL));


