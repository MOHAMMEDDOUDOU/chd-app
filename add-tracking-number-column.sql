-- Add tracking_number column to orders table
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(50);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'tracking_number';
