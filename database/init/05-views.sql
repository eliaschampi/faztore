-- =====================================================
-- Faztore Database Views
-- =====================================================

-- Products Overview View
-- Combines products with brand and category information for efficient querying
CREATE OR REPLACE VIEW products_overview AS
SELECT
    p.code,
    p.name,
    p.description,
    p.brand_code,
    p.category_code,
    p.price,
    p.sku,
    p.images,
    p.is_active,
    p.created_at,
    p.updated_at,
    b.name AS brand_name,
    c.name AS category_name,
    -- Additional computed fields for better UX
    CASE
        WHEN p.images::text = '[]' THEN false
        ELSE true
    END AS has_images,
    jsonb_array_length(p.images) AS images_count,
    -- Extract primary image URL for quick access
    CASE
        WHEN jsonb_array_length(p.images) > 0 THEN
            COALESCE(
                (SELECT img->>'url' FROM jsonb_array_elements(p.images) AS img WHERE (img->>'isPrimary')::boolean = true LIMIT 1),
                p.images->0->>'url'
            )
        ELSE NULL
    END AS primary_image_url
FROM products p
LEFT JOIN brands b ON p.brand_code = b.code
LEFT JOIN categories c ON p.category_code = c.code;

-- Create index on the view for better performance
CREATE INDEX IF NOT EXISTS idx_products_overview_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_overview_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_overview_brand ON products (brand_code);
CREATE INDEX IF NOT EXISTS idx_products_overview_category ON products (category_code);
