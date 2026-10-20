import { Button, Col, Grid, Rate, Row, Space, Typography } from 'antd';
const { useBreakpoint } = Grid;
import {
  ArrowRightOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../catalogue/components/ProductCard';
import { catalogueService } from '../../catalogue/services/catalogueService';
import type { Product } from '../../../shared/types';
import { useColors, radius, shadows, spacing, typography } from '../../../lib/theme';
import { CustomerLayout } from '../../../shared/components/layout/CustomerLayout';

const { Title, Text, Paragraph } = Typography;

// ── Scroll-triggered visibility ─────────────────────────────
const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
};

// ── Animated counter ────────────────────────────────────────
const AnimCounter = ({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const steps = Math.ceil(1800 / 16);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setVal(Math.round((target * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <>{val.toLocaleString()}{suffix}</>;
};

// ── Floating badge overlay ──────────────────────────────────
const FloatBadge = ({
  children, style, dark,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  dark?: boolean;
}) => {
  const colors = useColors();
  return (
    <div className="panel-badge" style={{
      position: 'absolute',
      background: dark ? colors.brand.dark : colors.background.surface,
      border: `1px solid ${colors.border.strong}`,
      borderRadius: radius.md,
      padding: '10px 16px',
      boxShadow: shadows.lg,
      color: dark ? colors.text.onDark : colors.text.primary,
      fontSize: 13,
      fontWeight: 600,
      alignItems: 'center',
      gap: 8,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ── Image panels ────────────────────────────────────────────

// Rhythm of pleated curtain folds in the studio's palette (styles in index.css)
const HeroPleats = () => (
  <div className="pleats" role="img" aria-label="Rhythm of pleated curtain folds in the studio's palette">
    {[...Array(11)].map((_, i) => <div key={i} className="pleat" />)}
  </div>
);

// Section divider — a row of pressed pleat lines
const FoldRule = () => (
  <div className="fold-rule" aria-hidden>
    {[...Array(16)].map((_, i) => <span key={i} />)}
  </div>
);

type ServiceTone = 'dark' | 'primary' | 'accent' | 'secondary';
const toneColor = (colors: ReturnType<typeof useColors>, tone: ServiceTone) => ({
  dark: colors.text.primary,
  primary: colors.brand.primary,
  accent: colors.brand.accent,
  secondary: colors.text.secondary,
}[tone]);

const SERVICE_TILES: { icon: React.ReactNode; label: string; tone: ServiceTone }[] = [
  { icon: <ScissorOutlined />, label: 'Custom', tone: 'primary' },
  { icon: <ShoppingOutlined />, label: 'Ready-Made', tone: 'dark' },
  { icon: <BgColorsOutlined />, label: 'Fabrics', tone: 'accent' },
  { icon: <ToolOutlined />, label: 'Alterations', tone: 'secondary' },
];

const ServicesPanel = () => {
  const colors = useColors();
  return (
    <div style={{
      position: 'relative',
      borderRadius: radius.lg,
      background: colors.background.surface,
      border: `1px solid ${colors.border.strong}`,
      padding: spacing[8],
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      boxShadow: shadows.md,
    }}>
      {SERVICE_TILES.map((t, i) => (
        <div key={t.label} style={{
          borderRight: i % 2 === 0 ? `1px solid ${colors.border.subtle}` : 'none',
          borderBottom: i < 2 ? `1px solid ${colors.border.subtle}` : 'none',
          padding: `${spacing[6]}px ${spacing[4]}px`,
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ fontSize: 28, color: toneColor(colors, t.tone) }}>{t.icon}</div>
          <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.secondary }}>{t.label}</Text>
        </div>
      ))}

      <FloatBadge style={{ bottom: -16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
        <StarFilled style={{ color: colors.brand.primary }} />
        <span>15+ Years of Excellence</span>
      </FloatBadge>
    </div>
  );
};

const PROCESS_STEPS = ['Choose Your Style', 'We Measure & Craft', 'Enjoy the Result'];

const ProcessPanel = () => {
  const colors = useColors();
  return (
    <div style={{
      position: 'relative',
      borderRadius: radius.lg,
      background: colors.brand.dark,
      padding: `${spacing[8]}px ${spacing[6]}px`,
      boxShadow: shadows.xl,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: spacing[1],
      minHeight: 280,
    }}>
      {PROCESS_STEPS.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div className="mono" style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `1px solid ${colors.brand.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.brand.peach, fontSize: 13,
            }}>
              0{i + 1}
            </div>
            {i < 2 && (
              <div style={{ width: 2, height: spacing[6], background: 'rgba(255,255,255,0.15)', marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingTop: 10 }}>
            <Text style={{ color: colors.text.onDark, fontSize: 14, fontWeight: 600 }}>{step}</Text>
          </div>
        </div>
      ))}

      <FloatBadge style={{ top: -14, right: spacing[6] }}>
        <CheckCircleOutlined />
        Simple Process
      </FloatBadge>
    </div>
  );
};

const QualityPanel = () => {
  const colors = useColors();
  return (
    <div style={{
      position: 'relative',
      borderRadius: radius.lg,
      background: colors.brand.deep,
      padding: spacing[8],
      boxShadow: shadows.xl,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: spacing[4],
      minHeight: 280,
    }}>
      {/* Shield */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40,
      }}>
        <CheckCircleOutlined style={{ color: '#fff' }} />
      </div>
      <div style={{ color: '#fff', fontFamily: typography.displayFamily, fontSize: 24, lineHeight: 1.15 }}>
        J&amp;M Quality<br />Guarantee
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[...Array(5)].map((_, i) => (
          <StarFilled key={i} style={{ color: colors.brand.peach, fontSize: 16 }} />
        ))}
      </div>
      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
        Rated 5 stars by 200+ verified customers
      </Text>

      <FloatBadge style={{ bottom: -14, left: spacing[6] }}>
        <CheckOutlined />
        100% Satisfaction
      </FloatBadge>
    </div>
  );
};

// ── Page data ───────────────────────────────────────────────
const STATS = [
  { value: 500, suffix: '+', label: 'Happy Customers' },
  { value: 15, suffix: '+', label: 'Years of Experience' },
  { value: 1200, suffix: '+', label: 'Curtains Crafted' },
  { value: 100, suffix: '%', label: 'Satisfaction Rate' },
];

const SERVICES: { icon: React.ReactNode; name: string; desc: string; tone: ServiceTone }[] = [
  { icon: <ScissorOutlined />, name: 'Custom Curtains', desc: 'Designed and crafted from scratch to your exact measurements and specifications.', tone: 'primary' },
  { icon: <ShoppingOutlined />, name: 'Ready-Made', desc: 'Premium quality curtains available off the shelf, ready to hang the same day.', tone: 'dark' },
  { icon: <BgColorsOutlined />, name: 'Premium Fabrics', desc: 'Source exquisite fabric by the metre from our curated collection of fine textiles.', tone: 'accent' },
  { icon: <ToolOutlined />, name: 'Alterations', desc: 'Expert repairs, re-lining, shortening, and fitting adjustments for any curtain.', tone: 'secondary' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Your Style', desc: 'Browse our catalogue or describe your vision. Pick fabric, colour, and finish with guidance from our team.' },
  { step: '02', title: 'We Measure & Craft', desc: 'We take precise measurements and hand-craft every curtain using premium materials for a flawless result.' },
  { step: '03', title: 'Enjoy the Result', desc: 'Your finished curtains arrive ready to hang. Step back and watch your space transform instantly.' },
];

const WHY_US = [
  { icon: <CheckCircleOutlined />, title: 'Premium Quality', desc: 'Fabrics sourced from the finest mills, inspected by hand before every delivery.' },
  { icon: <ScissorOutlined />, title: 'Perfect Custom Fit', desc: 'Cut to your exact measurements. No trimming, no guesswork — just a flawless finish.' },
  { icon: <TeamOutlined />, title: 'Skilled Craftspeople', desc: '15+ years of experience in every stitch. We take pride in details others overlook.' },
  { icon: <ThunderboltOutlined />, title: 'Fast & Reliable', desc: 'Quality results delivered on schedule, with clear updates throughout the process.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', initials: 'SM', rating: 5, text: 'The curtains are absolutely stunning. The quality exceeded every expectation and my living room feels completely transformed.' },
  { name: 'James K.', initials: 'JK', rating: 5, text: "Professional, fast, and the fit was perfect. I've recommended J&M to everyone — I won't go anywhere else for curtains." },
  { name: 'Linda T.', initials: 'LT', rating: 5, text: 'They transformed my bedroom completely. The fabric choice was spot-on and the finish is immaculate. Worth every penny.' },
];

// ── Component ────────────────────────────────────────────────
export const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const colors = useColors();

  const statsSection = useInView(0.3);
  const servicesSection = useInView();
  const processSection = useInView();
  const productsSection = useInView();
  const whyUsSection = useInView();
  const testimonialsSection = useInView();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    catalogueService.getProducts().then(({ data }) => setFeatured((data ?? []).slice(0, 3)));
  }, []);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const vis = (v: boolean) => v ? 'is-visible' : '';
  const td = (ms: number) => ({ transitionDelay: `${ms}ms` });

  const vPad = isMobile ? 48 : spacing[16];
  const sectionPad = { padding: `${vPad}px ${spacing[6]}px` } as const;

  // Outlined ink button — the artifact's secondary CTA
  const ghostInk: React.CSSProperties = {
    background: 'transparent', borderColor: colors.text.primary, color: colors.text.primary,
  };

  return (
    <CustomerLayout>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-glow" style={{ ...sectionPad, background: colors.background.page, paddingTop: isMobile ? 48 : 88 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Row gutter={[56, 48]} align="middle">
            {/* Content */}
            <Col xs={{ span: 24, order: 1 }} md={{ span: 13, order: 1 }}>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(0)}>
                <span className="eyebrow">Harare — made to measure</span>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(120)}>
                <Title className="hero-title" style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4rem)', lineHeight: 1.04, margin: `${spacing[3]}px 0 ${spacing[5]}px` }}>
                  Every pleat,<br />cut and hung<br />by hand.
                </Title>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(240)}>
                <Paragraph style={{ fontSize: 17, lineHeight: 1.65, color: colors.text.secondary, maxWidth: '46ch', marginBottom: spacing[8] }}>
                  Custom curtains, ready-made panels, fabric by the metre, and alterations — from a
                  workroom that still measures twice before it cuts.
                </Paragraph>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(360)}>
                <Space size="middle" wrap>
                  <Button
                    size="large"
                    type="primary"
                    style={{ height: 48, paddingInline: spacing[6] }}
                    onClick={() => navigate('/catalogue')}
                  >
                    View the catalogue <ArrowRightOutlined />
                  </Button>
                  <Button
                    size="large"
                    style={{ height: 48, paddingInline: spacing[6], ...ghostInk }}
                    onClick={() => navigate('/quotes/new')}
                  >
                    Request a quote
                  </Button>
                </Space>
              </div>
            </Col>

            {/* Hero graphic */}
            <Col xs={{ span: 24, order: 2 }} md={{ span: 11, order: 2 }}>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(200)}>
                <HeroPleats />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <FoldRule />

      {/* ── Stats Bar ────────────────────────────────────── */}
      <section style={{ background: colors.background.surface, borderBlock: `1px solid ${colors.border.subtle}` }}>
        <div ref={statsSection.ref} style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Row>
            {STATS.map((s, i) => (
              <Col key={i} xs={12} sm={6}>
                <div className="stat-cell" style={{
                  textAlign: 'center',
                  padding: `${spacing[6]}px ${spacing[4]}px`,
                  borderRight: i < 3 ? `1px solid ${colors.border.subtle}` : 'none',
                }}>
                  <div className="mono" style={{ fontSize: 34, color: colors.text.primary, lineHeight: 1 }}>
                    <AnimCounter target={s.value} suffix={s.suffix} inView={statsSection.inView} />
                  </div>
                  <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: spacing[2], display: 'block' }}>
                    {s.label}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ── Services — panel LEFT, list RIGHT ────────────── */}
      <section ref={servicesSection.ref} style={{ ...sectionPad, background: colors.background.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[64, 48]} align="middle">
            {/* Panel */}
            <Col xs={{ span: 24, order: 2 }} md={{ span: 11, order: 1 }}>
              <div className={`anim-fade-up ${vis(servicesSection.inView)}`} style={{ paddingBottom: spacing[4] }}>
                <ServicesPanel />
              </div>
            </Col>

            {/* Content */}
            <Col xs={{ span: 24, order: 1 }} md={{ span: 13, order: 2 }}>
              <div className={`anim-fade-up ${vis(servicesSection.inView)}`} style={{ marginBottom: spacing[8] }}>
                <span className="eyebrow">Our Services</span>
                <Title level={2} style={{ margin: `${spacing[2]}px 0 ${spacing[3]}px` }}>
                  Everything Your Windows Need
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 15 }}>
                  From bespoke custom designs to quick expert fixes — we cover every aspect of your curtain needs with care and precision.
                </Paragraph>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
                {SERVICES.map((s, i) => (
                  <div
                    key={s.name}
                    className={`anim-fade-up two-col-list-item ${vis(servicesSection.inView)}`}
                    style={{ display: 'flex', gap: spacing[4], alignItems: 'flex-start', ...td(i * 80) }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: radius.md, flexShrink: 0,
                      border: `1px solid ${colors.border.strong}`,
                      background: colors.background.page,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, color: toneColor(colors, s.tone),
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 15 }}>{s.name}</Text>
                      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ── How It Works — content LEFT, panel RIGHT ──────── */}
      <section ref={processSection.ref} style={{ ...sectionPad, background: colors.background.page }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[64, 48]} align="middle">
            {/* Content */}
            <Col xs={{ span: 24, order: 1 }} md={{ span: 13, order: 1 }}>
              <div className={`anim-fade-up ${vis(processSection.inView)}`} style={{ marginBottom: spacing[8] }}>
                <span className="eyebrow">The Process</span>
                <Title level={2} style={{ margin: `${spacing[2]}px 0 ${spacing[3]}px` }}>
                  How It Works
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 15 }}>
                  Getting your perfect curtains is straightforward. Here's what happens from your first message to the final hang.
                </Paragraph>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[7] }}>
                {HOW_IT_WORKS.map((item, i) => (
                  <div
                    key={i}
                    className={`anim-fade-up process-step ${vis(processSection.inView)}`}
                    style={{ display: 'flex', gap: spacing[5], alignItems: 'flex-start', ...td(i * 120) }}
                  >
                    <div className="mono" style={{
                      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                      border: `1px solid ${colors.text.primary}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: colors.text.primary, fontSize: 15,
                    }}>
                      {item.step}
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <Text strong style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{item.desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`anim-fade-up ${vis(processSection.inView)}`} style={{ marginTop: spacing[8], ...td(400) }}>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => navigate('/quotes/new')}
                >
                  Start Your Order <ArrowRightOutlined />
                </Button>
              </div>
            </Col>

            {/* Panel */}
            <Col xs={{ span: 24, order: 2 }} md={{ span: 11, order: 2 }}>
              <div className={`anim-fade-up ${vis(processSection.inView)}`} style={td(200)}>
                <ProcessPanel />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <FoldRule />

      {/* ── Featured Products ─────────────────────────────── */}
      {featured.length > 0 && (
        <section ref={productsSection.ref} style={{ ...sectionPad, background: colors.background.page }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className={`anim-fade-up ${vis(productsSection.inView)}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing[10] }}>
              <div>
                <span className="eyebrow">On the shelf this week</span>
                <Title level={2} style={{ margin: `${spacing[1]}px 0 0` }}>From the workroom</Title>
              </div>
              <Button type="link" onClick={() => navigate('/catalogue')} style={{ color: colors.brand.deep, fontWeight: 600, padding: 0 }}>
                View All <ArrowRightOutlined />
              </Button>
            </div>
            <Row gutter={[24, 24]}>
              {featured.map((p, i) => (
                <Col key={p.id} xs={24} sm={12} lg={8}>
                  <div className={`anim-fade-up ${vis(productsSection.inView)}`} style={td(i * 120)}>
                    <ProductCard product={p} />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>
      )}

      {/* ── Why Choose Us — panel LEFT, list RIGHT ────────── */}
      <section ref={whyUsSection.ref} style={{ ...sectionPad, background: colors.background.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[64, 48]} align="middle">
            {/* Panel */}
            <Col xs={{ span: 24, order: 2 }} md={{ span: 11, order: 1 }}>
              <div className={`anim-fade-up ${vis(whyUsSection.inView)}`} style={{ paddingBottom: spacing[4] }}>
                <QualityPanel />
              </div>
            </Col>

            {/* Content */}
            <Col xs={{ span: 24, order: 1 }} md={{ span: 13, order: 2 }}>
              <div className={`anim-fade-up ${vis(whyUsSection.inView)}`} style={{ marginBottom: spacing[8] }}>
                <span className="eyebrow">Why J&amp;M</span>
                <Title level={2} style={{ margin: `${spacing[2]}px 0 ${spacing[3]}px` }}>
                  Crafted With Care, Every Time
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 15 }}>
                  We don't just make curtains. Every project is personal — we take the time to understand your space and your taste before a single cut is made.
                </Paragraph>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
                {WHY_US.map((item, i) => (
                  <div
                    key={item.title}
                    className={`anim-fade-up two-col-list-item ${vis(whyUsSection.inView)}`}
                    style={{ display: 'flex', gap: spacing[4], alignItems: 'flex-start', ...td(i * 80) }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: radius.md, flexShrink: 0,
                      background: colors.brand.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: colors.brand.primary,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 15, marginBottom: 4 }}>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>{item.desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section ref={testimonialsSection.ref} style={{ ...sectionPad, background: colors.background.page }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className={`anim-fade-up ${vis(testimonialsSection.inView)}`} style={{ textAlign: 'center', marginBottom: spacing[12] }}>
            <span className="eyebrow">Testimonials</span>
            <Title level={2} style={{ margin: `${spacing[2]}px 0 0` }}>What Our Customers Say</Title>
          </div>
          <Row gutter={[24, 24]}>
            {TESTIMONIALS.map((t, i) => (
              <Col key={i} xs={24} md={8}>
                <div className={`anim-fade-up ${vis(testimonialsSection.inView)}`} style={{ ...td(i * 120), height: '100%' }}>
                  <div style={{
                    background: colors.background.surface, borderRadius: radius.lg,
                    padding: spacing[6], height: '100%',
                    border: `1px solid ${colors.border.strong}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <Rate disabled defaultValue={t.rating} style={{ color: colors.brand.primary, fontSize: 14, marginBottom: spacing[3] }} />
                    <Paragraph style={{ fontFamily: typography.displayFamily, fontSize: 17, lineHeight: 1.6, color: colors.text.primary, fontStyle: 'italic', flex: 1, marginBottom: spacing[4] }}>
                      "{t.text}"
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: colors.brand.dark,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: colors.text.onDark, fontWeight: 600, fontSize: 13, flexShrink: 0,
                      }}>
                        {t.initials}
                      </div>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{t.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>Verified Customer</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section style={{
        background: colors.brand.dark,
        padding: `${spacing[16]}px ${spacing[6]}px`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Faint vertical pleat lines */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)' }} />
          ))}
        </div>
        <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing[2],
            marginBottom: spacing[4],
            color: colors.brand.peach, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            <CheckOutlined /> Free quotes — no obligation
          </div>
          <Title className="cta-title" style={{ color: colors.text.onDark, fontSize: 44, lineHeight: 1.1, marginBottom: spacing[4] }}>
            Bring us your window.
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, lineHeight: 1.7, marginBottom: spacing[8] }}>
            Final price is based on your measurements and fabric choice. Tell us both and we'll send a personalised
            quote within 24 hours — and confirm everything before any cutting begins.
          </Paragraph>
          <Space size="large" wrap style={{ justifyContent: 'center' }}>
            <Button
              size="large"
              type="primary"
              style={{ height: 48, paddingInline: spacing[8] }}
              onClick={() => navigate('/quotes/new')}
            >
              Request a quote
            </Button>
            <Button size="large" ghost style={{ height: 48, paddingInline: spacing[8], borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/catalogue')}>
              View the catalogue
            </Button>
          </Space>
        </div>
      </section>

    </CustomerLayout>
  );
};
