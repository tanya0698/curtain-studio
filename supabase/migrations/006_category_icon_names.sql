-- Category icons were emoji; store @ant-design/icons component names instead.
-- The frontend maps slug → icon in src/shared/config/categoryIcons.tsx.
update product_categories set icon = 'ScissorOutlined'  where slug = 'custom-curtains';
update product_categories set icon = 'ShoppingOutlined' where slug = 'ready-made';
update product_categories set icon = 'BgColorsOutlined' where slug = 'fabrics';
update product_categories set icon = 'ToolOutlined'     where slug = 'alterations';
