import { AppstoreOutlined, CompassOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Result, Space } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { iconSize, spacing, useColors } from '../../lib/theme';
import { CustomerLayout } from './layout/CustomerLayout';

/** Catch-all route. Uses an antd icon, not Result's built-in 404 illustration. */
export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const colors = useColors();

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: `${spacing[16]}px ${spacing[6]}px` }}>
        <Result
          icon={<CompassOutlined style={{ fontSize: iconSize.jumbo, color: colors.text.muted }} />}
          title="We couldn't find that page"
          subTitle={
            <>
              The link may be old or mistyped.
              <br />
              <span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>{pathname}</span>
            </>
          }
          extra={
            <Space wrap style={{ justifyContent: 'center' }}>
              <Button type="primary" icon={<AppstoreOutlined />} onClick={() => navigate('/catalogue')}>
                View the catalogue
              </Button>
              <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
                Back to home
              </Button>
            </Space>
          }
        />
      </div>
    </CustomerLayout>
  );
};
