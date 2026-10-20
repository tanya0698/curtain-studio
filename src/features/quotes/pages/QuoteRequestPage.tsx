import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  App,
  Alert,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Steps,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { catalogueService } from '../../catalogue/services/catalogueService';
import { quotesService } from '../services/quotesService';
import type { Product } from '../../../shared/types';
import { useColors, spacing } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';
import { useSupabaseQuery } from '../../../shared/hooks/useSupabaseQuery';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const FABRIC_OPTIONS = ['Sheer/Voile', 'Linen', 'Velvet', 'Blackout', 'Printed', 'Poly-Cotton', 'Other'];

export const QuoteRequestPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const colors = useColors();

  const preselectedProductId = (location.state as { productId?: string } | null)?.productId;

  const productsQuery = useSupabaseQuery<Product[]>(() => catalogueService.getProducts(), []);
  const products = (productsQuery.data ?? []).filter(p => p.is_quotable);

  useEffect(() => {
    if (productsQuery.data && preselectedProductId) {
      form.setFieldsValue({ product_id: preselectedProductId });
    }
  }, [productsQuery.data, preselectedProductId, form]);

  const onFinish = async (values: {
    product_id: string;
    quantity: number;
    width?: number;
    drop?: number;
    fabric_choice?: string;
    notes: string;
  }) => {
    setError('');
    setLoading(true);
    try {
      const quote = await quotesService.createQuote({
        notes: values.notes,
        items: [{
          product_id: values.product_id,
          quantity: values.quantity ?? 1,
          measurements: values.width && values.drop ? { width: values.width, drop: values.drop, unit: 'cm' } : undefined,
          fabric_choice: values.fabric_choice,
        }],
      });

      // Upload any attached photos now that we have a quote id to file them
      // under. A photo failing to upload shouldn't lose the quote request
      // itself — the customer's notes/measurements already made it through.
      const filesToUpload = fileList
        .map(f => f.originFileObj)
        .filter((f): f is NonNullable<typeof f> => !!f);
      if (filesToUpload.length > 0) {
        try {
          const paths = await Promise.all(
            filesToUpload.map(file => quotesService.uploadAttachment(quote.id, file)),
          );
          await quotesService.attachImages(quote.id, paths);
        } catch {
          message.warning('Quote submitted, but your photos failed to upload. You can share them via WhatsApp instead.');
        }
      }

      message.success('Quote request submitted! We\'ll get back to you soon.');
      navigate('/account/quotes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Product' },
    { title: 'Details' },
    { title: 'Confirm' },
  ];

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: `${spacing[8]}px ${spacing[6]}px` }}>
        <Title level={2} style={{ color: colors.brand.primary }}>Request a Quote</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: spacing[6] }}>
          Tell us what you need and we'll send you a personalised price.
        </Text>

        <Steps current={step} items={steps} style={{ marginBottom: spacing[8] }} />

        {error && <Alert type="error" message={error} style={{ marginBottom: spacing[4] }} showIcon />}
        {productsQuery.error && (
          <Alert
            type="warning"
            showIcon
            title="We couldn't load our list of services"
            description="This is usually a brief connection problem on our side."
            action={<Button size="small" icon={<ReloadOutlined />} onClick={productsQuery.retry}>Try again</Button>}
            style={{ marginBottom: spacing[4] }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          {step === 0 && (
            <Space direction="vertical" style={{ width: '100%' }} size={spacing[4]}>
              <Form.Item name="product_id" label="What service are you interested in?" rules={[{ required: true, message: 'Please select a product/service' }]}>
                <Select placeholder="Select a product or service" showSearch optionFilterProp="label"
                  loading={productsQuery.loading}
                  options={products.map(p => ({ value: p.id, label: `${p.name} — From $${p.starting_price} ${p.unit}` }))}
                />
              </Form.Item>
              <Form.Item name="quantity" label="Quantity" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" block onClick={() => {
                form.validateFields(['product_id']).then(() => setStep(1));
              }} style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                Next
              </Button>
            </Space>
          )}

          {step === 1 && (
            <Space direction="vertical" style={{ width: '100%' }} size={spacing[4]}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="width" label="Width (cm)">
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 200" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="drop" label="Drop / Length (cm)">
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 260" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="fabric_choice" label="Preferred Fabric (optional)">
                <Select placeholder="Select a fabric" options={FABRIC_OPTIONS.map(f => ({ value: f, label: f }))} allowClear />
              </Form.Item>

              <Form.Item name="notes" label="Describe your requirements" rules={[{ required: true, message: 'Please describe what you need' }]}>
                <TextArea
                  rows={5}
                  placeholder="Tell us about the room, window style, colours you like, any special requirements..."
                />
              </Form.Item>

              <Form.Item label="Photos (optional)">
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  accept="image/*"
                  fileList={fileList}
                  onChange={({ fileList: newList }) => setFileList(newList)}
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p>Click or drag photos of your window/curtains here</p>
                </Dragger>
              </Form.Item>

              <Space style={{ width: '100%' }} direction="vertical">
                <Button type="primary" block onClick={() => setStep(2)} style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                  Review & Submit
                </Button>
                <Button block onClick={() => setStep(0)}>Back</Button>
              </Space>
            </Space>
          )}

          {step === 2 && (
            <Space direction="vertical" style={{ width: '100%' }} size={spacing[4]}>
              <Alert
                type="info"
                message="Review your quote request"
                description="We'll review your request and respond with a personalised quote within 24–48 hours."
                showIcon
              />
              <div style={{ background: colors.background.muted, borderRadius: 8, padding: spacing[4] }}>
                <Text strong>Service: </Text>
                <Text>{products.find(p => p.id === form.getFieldValue('product_id'))?.name}</Text>
                <br />
                <Text strong>Quantity: </Text><Text>{form.getFieldValue('quantity') ?? 1}</Text>
                {form.getFieldValue('width') && (
                  <><br /><Text strong>Width: </Text><Text>{form.getFieldValue('width')} cm</Text></>
                )}
                {form.getFieldValue('drop') && (
                  <><br /><Text strong>Drop: </Text><Text>{form.getFieldValue('drop')} cm</Text></>
                )}
                {form.getFieldValue('fabric_choice') && (
                  <><br /><Text strong>Fabric: </Text><Text>{form.getFieldValue('fabric_choice')}</Text></>
                )}
                {form.getFieldValue('notes') && (
                  <><br /><Text strong>Notes: </Text><Text>{form.getFieldValue('notes')}</Text></>
                )}
                {fileList.length > 0 && (
                  <><br /><Text strong>Photos: </Text><Text>{fileList.length} attached</Text></>
                )}
              </div>
              <Button type="primary" htmlType="submit" block loading={loading}
                style={{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }}>
                Submit Quote Request
              </Button>
              <Button block onClick={() => setStep(1)}>Back</Button>
            </Space>
          )}
        </Form>
      </div>
    </CustomerLayout>
  );
};
