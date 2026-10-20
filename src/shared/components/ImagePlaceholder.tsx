import { PictureOutlined } from '@ant-design/icons';
import { iconSize, useColors, type IconSize } from '../../lib/theme';

interface Props {
  size?: IconSize;
  style?: React.CSSProperties;
}

/** Stand-in for a product with no photo yet. Fills its parent. */
export const ImagePlaceholder = ({ size = 'hero', style }: Props) => {
  const colors = useColors();
  return (
    <div
      role="img"
      aria-label="No image yet"
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colors.background.muted,
        color: colors.text.muted,
        ...style,
      }}
    >
      <PictureOutlined style={{ fontSize: iconSize[size] }} />
    </div>
  );
};
