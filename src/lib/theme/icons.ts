/**
 * Icons — @ant-design/icons only, no second icon library.
 *
 * Convention (same as City Parking hub):
 *  - Outlined everywhere by default.
 *  - Filled is reserved for status glyphs (CheckCircleFilled, WarningFilled,
 *    ExclamationCircleFilled, InfoCircleFilled, CloseCircleFilled) and rating
 *    stars (StarFilled), so a solid icon always means "this is a state".
 *  - Never TwoTone.
 *  - Size with these tokens, not ad-hoc fontSize values. Inline icons inside
 *    text or buttons need no size at all — they inherit the font size.
 */
export const iconSize = {
  sm: 14, // dense table / tag
  md: 16, // default standalone
  lg: 20, // card headers, stat tiles
  xl: 28, // feature tiles
  hero: 40, // empty states, success screens
  jumbo: 64, // full-page result
} as const;

export type IconSize = keyof typeof iconSize;
