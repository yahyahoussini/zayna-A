-- supabase/migrations/YYYYMMDDHHMMSS_create_product_seo_table.sql

CREATE TABLE product_seo (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    product_id BIGINT NOT NULL,
    lang TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    slug TEXT,
    alt_text TEXT,
    focus_keyword TEXT,
    structured_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    UNIQUE (product_id, lang)
);

-- Optional: Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_seo_updated_at
BEFORE UPDATE ON product_seo
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS
ALTER TABLE product_seo ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (if needed, otherwise restrict to service_role)
-- For this e-commerce site, SEO data should be publicly readable.
CREATE POLICY "Allow public read access to product_seo"
ON product_seo
FOR SELECT
USING (true);

-- Allow admins (service_role) to insert, update, delete
CREATE POLICY "Allow full access for admins"
ON product_seo
FOR ALL
USING (auth.role() = 'service_role');
