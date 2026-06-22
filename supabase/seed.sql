-- Seed product categories
insert into product_categories (id, name, slug, icon) values
  ('11111111-0000-0000-0000-000000000001', 'Custom Curtains', 'custom-curtains', '🎨'),
  ('11111111-0000-0000-0000-000000000002', 'Ready-Made', 'ready-made', '🛍️'),
  ('11111111-0000-0000-0000-000000000003', 'Fabrics', 'fabrics', '🧵'),
  ('11111111-0000-0000-0000-000000000004', 'Alterations', 'alterations', '✂️');

-- Seed products (from catalogue)
insert into products (category_id, name, description, starting_price, unit, is_quotable, is_purchasable) values
-- Custom Curtains
('11111111-0000-0000-0000-000000000001', 'Eyelet Curtains',
 'Clean, modern rings along the top for a contemporary look. Made to your exact measurements and fabric choice.',
 90.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Pencil Pleat Curtains',
 'Classic gathered style, full and elegant. Works beautifully with both traditional and modern interiors.',
 85.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Pinch Pleat Curtains',
 'Structured pleats that hang in neat, defined folds. A timeless, tailored finish for any room.',
 95.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Wave / S-Fold Curtains',
 'Soft, continuous S-shaped folds for a relaxed, luxurious feel. Perfect for living rooms and bedrooms.',
 100.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Sheer / Voile Curtains',
 'Lightweight, airy curtains that let in natural light while maintaining privacy. Made to size.',
 60.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Lined Curtains',
 'Any style with an added lining for extra weight, insulation, and light blocking.',
 15.00, 'per panel', true, false),

('11111111-0000-0000-0000-000000000001', 'Blackout Curtains',
 'Thick, light-blocking curtains ideal for bedrooms, nurseries, and home theatres.',
 95.00, 'per panel', true, false),

-- Ready-Made
('11111111-0000-0000-0000-000000000002', 'Eyelet Ready-Made Curtains',
 'Modern ring-top curtains available in standard sizes. Hang straight out of the bag.',
 30.00, 'per panel', false, true),

('11111111-0000-0000-0000-000000000002', 'Pencil Pleat Ready-Made Curtains',
 'Classic gathered curtains in a range of colours and patterns. Available in standard drop lengths.',
 25.00, 'per panel', false, true),

('11111111-0000-0000-0000-000000000002', 'Sheer / Net Curtains',
 'Ready-to-hang lightweight sheers for privacy without blocking light. Various widths available.',
 20.00, 'per panel', false, true),

('11111111-0000-0000-0000-000000000002', 'Blackout Ready-Made Curtains',
 'Stock blackout curtains in popular sizes and neutral colours. Great for quick bedroom solutions.',
 35.00, 'per panel', false, true),

('11111111-0000-0000-0000-000000000002', 'Kids / Patterned Curtains',
 'Fun prints and bright colours in standard sizes, perfect for children''s rooms.',
 28.00, 'per panel', false, true),

-- Fabrics
('11111111-0000-0000-0000-000000000003', 'Sheer / Voile Fabric',
 'Lightweight, translucent fabric in white, cream, and soft tones. Elegant and airy.',
 5.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Linen & Linen-Look Fabric',
 'Natural texture with a relaxed, sophisticated feel. Available in neutral and earthy tones.',
 8.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Velvet Fabric',
 'Rich, heavyweight velvet for dramatic, luxurious curtains. Excellent for insulation too.',
 12.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Blackout Fabric',
 'Dense, light-blocking fabric with a smooth finish. Available in various colours.',
 9.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Printed / Patterned Fabric',
 'Bold and decorative prints — florals, geometrics, abstracts, and more. Stock changes regularly.',
 7.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Plain Poly-Cotton Fabric',
 'Versatile, easy-care fabric in a wide range of colours. Great all-rounder for any room.',
 6.00, 'per metre', false, true),

('11111111-0000-0000-0000-000000000003', 'Lining Fabric',
 'Standard white/cream curtain lining to add body, weight, and protection to your curtains.',
 4.00, 'per metre', false, true),

-- Alterations
('11111111-0000-0000-0000-000000000004', 'Curtain Hem Shortening',
 'Curtains too long? We''ll take them up neatly to your exact required length.',
 10.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'Curtain Hem Lengthening',
 'Need more drop? We let down and re-hem to give you extra length where possible.',
 12.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'Width Adjustment',
 'Too wide or too narrow? We take in or add fabric panels to get the right fit.',
 15.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'Header Tape Replacement',
 'Old or damaged header tape replaced with fresh tape — pencil pleat, eyelet, or pinch pleat.',
 14.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'Re-Lining',
 'Faded or torn lining replaced with fresh lining fabric. Extends the life of your curtains.',
 20.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'General Repairs',
 'Torn seams, fraying edges, broken rings or hooks — we fix it all up neatly.',
 10.00, 'per repair', true, false),

('11111111-0000-0000-0000-000000000004', 'Full Curtain Refresh',
 'Hem adjustment + re-lining + header tape replacement all in one. Best value for older curtains.',
 40.00, 'per curtain', true, false),

('11111111-0000-0000-0000-000000000004', 'Dress / Skirt Hemming',
 'Shorten or lengthen dresses and skirts to your perfect length. Neat, invisible finish.',
 10.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Trouser / Jeans Hemming',
 'Taking up or letting down trousers and jeans, preserving the original hem style if needed.',
 8.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Taking In / Letting Out Seams',
 'Adjust the fit of tops, dresses, trousers, or jackets — slimming down or adding room.',
 12.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Zipper Replacement',
 'Broken or faulty zippers replaced on dresses, trousers, jackets, and bags.',
 12.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Button Replacement / Repositioning',
 'Missing or damaged buttons replaced, or buttons moved for a better fit.',
 5.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Waistband Adjustment',
 'Tighten or loosen waistbands on trousers, skirts, and shorts for a comfortable fit.',
 12.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Dress Taken In / Reshaped',
 'Full reshaping of a dress — bust, waist, and hips adjusted for a flattering, fitted look.',
 25.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Sleeve Shortening / Lengthening',
 'Adjust sleeve length on shirts, jackets, blouses, and dresses with clean, matched cuffs.',
 12.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Lining Repair / Replacement',
 'Torn or worn lining in jackets, coats, or dresses repaired or fully replaced.',
 18.00, 'per item', true, false),

('11111111-0000-0000-0000-000000000004', 'Wedding / Formal Dress Alterations',
 'Specialist alterations for bridal gowns, bridesmaid dresses, and formal wear. Fittings available.',
 40.00, 'per item', true, false);
