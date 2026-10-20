import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { catalogueService } from '../../catalogue/services/catalogueService';
import { AdminLayout } from '../layout/AdminLayout';
import type { Product, ProductCategory } from '../../../shared/types';
import { useColors, radius, shadows, spacing } from '../../../lib/theme';

const { Title } = Typography;
const { TextArea } = Input;

export const AdminCataloguePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const colors = useColors();

  const fetchProducts = async () => {
    const { data } = await catalogueService.getProducts();
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    catalogueService.getProducts().then(({ data }) => { setProducts(data ?? []); setLoading(false); });
    catalogueService.getCategories().then(({ data }) => setCategories(data ?? []));
  }, []);

  const openDrawer = (product?: Product) => {
    setEditingProduct(product ?? null);
    form.setFieldsValue(product
      ? { ...product, category_id: product.category_id }
      : { is_active: true, is_quotable: false, is_purchasable: true, unit: 'per panel' }
    );
    setDrawerOpen(true);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editingProduct) {
        await catalogueService.updateProduct(editingProduct.id, values);
        message.success('Product updated');
      } else {
        await catalogueService.createProduct({ ...values, images: [] });
        message.success('Product created');
      }
      setDrawerOpen(false);
      fetchProducts();
    } catch {
      message.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await catalogueService.deleteProduct(id);
    message.success('Product deleted');
    fetchProducts();
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await catalogueService.uploadImage(file);
      const current = form.getFieldValue('images') ?? [];
      form.setFieldsValue({ images: [...current, url] });
      message.success('Image uploaded');
    } catch {
      message.error('Image upload failed');
    }
    return false;
  };

  return (
    <AdminLayout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Catalogue</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer()}
          style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
        >
          Add Product
        </Button>
      </Row>

      <div style={{
        background: colors.background.surface,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        padding: spacing[4],
      }}>
      <Table
        dataSource={products}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
        locale={{
          emptyText: (
            <Empty
              image={<AppstoreOutlined style={{ fontSize: 40, color: colors.brand.accent }} />}
              description="No products yet"
            />
          ),
        }}
        columns={[
          {
            title: 'Image',
            dataIndex: 'images',
            width: 60,
            render: (images: string[]) => images?.[0]
              ? <img src={images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
              : <span style={{ fontSize: 24 }}>🪟</span>,
          },
          { title: 'Name', dataIndex: 'name' },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (cat: ProductCategory) => cat?.name ?? '—',
          },
          {
            title: 'Price',
            dataIndex: 'starting_price',
            render: (v: number, r: Product) => `$${v} ${r.unit}`,
          },
          {
            title: 'Type',
            render: (_: unknown, r: Product) => (
              <Space>
                {r.is_purchasable && <Tag color="green">Buy</Tag>}
                {r.is_quotable && <Tag color="blue">Quote</Tag>}
              </Space>
            ),
          },
          {
            title: 'Active',
            dataIndex: 'is_active',
            render: (v: boolean, record: Product) => (
              <Switch
                checked={v}
                size="small"
                onChange={async checked => {
                  await catalogueService.updateProduct(record.id, { is_active: checked });
                  fetchProducts();
                }}
              />
            ),
          },
          {
            title: 'Actions',
            render: (_: unknown, record: Product) => (
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => openDrawer(record)} />
                <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record.id)}>
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      </div>

      <Drawer
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        footer={
          <Button
            type="primary"
            loading={saving}
            onClick={() => form.submit()}
            block
            style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}
          >
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="starting_price" label="Starting Price ($)" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Price Unit" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'per panel', label: 'per panel' },
                  { value: 'per metre', label: 'per metre' },
                  { value: 'per item', label: 'per item' },
                  { value: 'per curtain', label: 'per curtain' },
                  { value: 'per repair', label: 'per repair' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="is_purchasable" label="Can Buy Directly" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_quotable" label="Requires Quote" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Product Images">
            <Upload
              beforeUpload={handleImageUpload}
              accept="image/*"
              showUploadList={false}
              multiple
            >
              <Button icon={<UploadOutlined />}>Upload Images</Button>
            </Upload>
            <Form.Item name="images" noStyle>
              <Input type="hidden" />
            </Form.Item>
            {form.getFieldValue('images')?.length > 0 && (
              <Space wrap style={{ marginTop: spacing[2] }}>
                {(form.getFieldValue('images') as string[]).map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                ))}
              </Space>
            )}
          </Form.Item>
        </Form>
      </Drawer>
    </AdminLayout>
  );
};
