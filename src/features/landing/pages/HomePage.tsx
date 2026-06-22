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
import { useColors, radius, shadows, spacing } from '../../../lib/theme';
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
      background: dark ? colors.brand.primary : '#fff',
      borderRadius: 14,
      padding: '10px 16px',
      boxShadow: shadows.lg,
      color: dark ? '#fff' : colors.brand.primary,
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

const HeroPanel = () => {
  const colors = useColors();
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBlock: spacing[8] }}>
      {/* Soft glow ring */}
      <div style={{
        width: '90%', maxWidth: 440, aspectRatio: '1',
        borderRadius: '50%',
        background: `${colors.brand.primary}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Inner circle */}
        <div style={{
          width: '82%', aspectRatio: '1', borderRadius: '50%',
          background: `linear-gradient(145deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 65%, ${colors.brand.accent}90 100%)`,
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 28px 64px ${colors.brand.primary}50`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {/* Curtain strips */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{
                flex: 1,
                background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
              }} />
            ))}
          </div>
          {/* Center art */}
          <ScissorOutlined style={{ fontSize: 52, color: 'rgba(255,255,255,0.75)', position: 'relative', zIndex: 1 }} />
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 26, fontWeight: 800, letterSpacing: 3, position: 'relative', zIndex: 1 }}>
            J&amp;M
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
            Curtain Studio
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <FloatBadge style={{ bottom: '12%', right: 0 }}>
        <span style={{ fontSize: 18 }}>⭐</span>
        <div>
          <div style={{ lineHeight: 1.2 }}>500+ Customers</div>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>Across Harare</div>
        </div>
      </FloatBadge>
      <FloatBadge dark style={{ top: '12%', left: 0 }}>
        <ScissorOutlined />
        <div>
          <div style={{ lineHeight: 1.2 }}>Custom Made</div>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>Since 2009</div>
        </div>
      </FloatBadge>
    </div>
  );
};

const SERVICE_TILES = [
  { icon: <ScissorOutlined />, label: 'Custom', color: '#6C5CE7', bg: '#6C5CE720' },
  { icon: <ShoppingOutlined />, label: 'Ready-Made', color: '#00CEC9', bg: '#00CEC920' },
  { icon: <BgColorsOutlined />, label: 'Fabrics', color: '#FDCB6E', bg: '#FDCB6E20' },
  { icon: <ToolOutlined />, label: 'Alterations', color: '#A78BFA', bg: '#A78BFA20' },
];

const ServicesPanel = () => {
  const colors = useColors();
  return (
    <div style={{
      position: 'relative',
      borderRadius: radius.xxl,
      background: `linear-gradient(135deg, ${colors.brand.light} 0%, #ffffff 100%)`,
      border: `1px solid ${colors.border.subtle}`,
      padding: spacing[8],
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: spacing[4],
      boxShadow: shadows.md,
    }}>
      {SERVICE_TILES.map((t) => (
        <div key={t.label} style={{
          background: t.bg,
          borderRadius: radius.lg,
          padding: `${spacing[5]}px ${spacing[4]}px`,
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ fontSize: 28, color: t.color }}>{t.icon}</div>
          <Text style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.label}</Text>
        </div>
      ))}

      <FloatBadge style={{ bottom: -16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
        <StarFilled style={{ color: '#FDCB6E' }} />
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
      borderRadius: radius.xxl,
      background: `linear-gradient(145deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 100%)`,
      padding: `${spacing[8]}px ${spacing[6]}px`,
      boxShadow: shadows.xl,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: spacing[1],
      minHeight: 280,
    }}>
      {PROCESS_STEPS.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 800,
            }}>
              0{i + 1}
            </div>
            {i < 2 && (
              <div style={{ width: 2, height: spacing[6], background: 'rgba(255,255,255,0.15)', marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingTop: 10 }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 600 }}>{step}</Text>
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
      borderRadius: radius.xxl,
      background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.accent} 100%)`,
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
      <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
        J&amp;M Quality<br />Guarantee
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[...Array(5)].map((_, i) => (
          <StarFilled key={i} style={{ color: '#FDCB6E', fontSize: 16 }} />
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

const SERVICES = [
  { icon: <ScissorOutlined />, name: 'Custom Curtains', desc: 'Designed and crafted from scratch to your exact measurements and specifications.', accent: '#6C5CE7' },
  { icon: <ShoppingOutlined />, name: 'Ready-Made', desc: 'Premium quality curtains available off the shelf, ready to hang the same day.', accent: '#00CEC9' },
  { icon: <BgColorsOutlined />, name: 'Premium Fabrics', desc: 'Source exquisite fabric by the metre from our curated collection of fine textiles.', accent: '#FDCB6E' },
  { icon: <ToolOutlined />, name: 'Alterations', desc: 'Expert repairs, re-lining, shortening, and fitting adjustments for any curtain.', accent: '#A78BFA' },
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

  const sectionLabel: React.CSSProperties = {
    color: colors.brand.primary, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12,
  };

  const vPad = isMobile ? 48 : spacing[16];
  const sectionPad = { padding: `${vPad}px ${spacing[6]}px` } as const;

  return (
    <CustomerLayout>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ ...sectionPad, background: colors.background.page, paddingTop: spacing[10] }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[64, 48]} align="middle">
            {/* Content */}
            <Col xs={{ span: 24, order: 1 }} md={{ span: 12, order: 1 }}>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(0)}>
                <div style={{
                  display: 'inline-block', background: colors.brand.light,
                  borderRadius: radius.pill, padding: `5px ${spacing[4]}px`,
                  marginBottom: spacing[4], fontSize: 12, fontWeight: 600,
                  letterSpacing: 1.5, textTransform: 'uppercase', color: colors.brand.primary,
                }}>
                  Harare's Premier Curtain Studio
                </div>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(120)}>
                <Title className="hero-title" style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: spacing[4] }}>
                  Transform Your Space With Perfect Curtains
                </Title>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(240)}>
                <Paragraph style={{ fontSize: 17, lineHeight: 1.75, color: colors.text.secondary, marginBottom: spacing[8] }}>
                  Custom-made designs, ready-made options, premium fabrics and expert alterations.
                  Your dream window treatment is just one step away.
                </Paragraph>
              </div>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(360)}>
                <Space size="middle" wrap>
                  <Button
                    size="large"
                    type="primary"
                    style={{ height: 52, paddingInline: spacing[8], fontWeight: 600 }}
                    onClick={() => navigate('/catalogue')}
                  >
                    Browse Catalogue <ArrowRightOutlined />
                  </Button>
                  <Button
                    size="large"
                    style={{ height: 52, paddingInline: spacing[8] }}
                    onClick={() => navigate('/quotes/new')}
                  >
                    Get a Free Quote
                  </Button>
                </Space>
              </div>
            </Col>

            {/* Hero panel */}
            <Col xs={{ span: 24, order: 2 }} md={{ span: 12, order: 2 }}>
              <div className={`anim-fade-up ${vis(mounted)}`} style={td(200)}>
                <HeroPanel />
              </div>
            </Col>
          </Row>
        </div>
      </section>

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
                  <div style={{ fontSize: 40, fontWeight: 800, color: colors.brand.primary, lineHeight: 1 }}>
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
                <Text style={sectionLabel}>Our Services</Text>
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
                      background: `${s.accent}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, color: s.accent,
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
                <Text style={sectionLabel}>The Process</Text>
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
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                      background: colors.brand.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 16, fontWeight: 800,
                      boxShadow: shadows.md,
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
                  style={{ fontWeight: 600 }}
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

      {/* ── Featured Products ─────────────────────────────── */}
      {featured.length > 0 && (
        <section ref={productsSection.ref} style={{ ...sectionPad, background: colors.background.surface }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className={`anim-fade-up ${vis(productsSection.inView)}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing[10] }}>
              <div>
                <Text style={sectionLabel}>Handpicked For You</Text>
                <Title level={2} style={{ margin: `${spacing[1]}px 0 0` }}>Featured Items</Title>
              </div>
              <Button type="link" onClick={() => navigate('/catalogue')} style={{ color: colors.brand.primary, fontWeight: 600, padding: 0 }}>
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
      <section ref={whyUsSection.ref} style={{ ...sectionPad, background: colors.background.page }}>
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
                <Text style={sectionLabel}>Why J&amp;M</Text>
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
      <section ref={testimonialsSection.ref} style={{ ...sectionPad, background: colors.background.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className={`anim-fade-up ${vis(testimonialsSection.inView)}`} style={{ textAlign: 'center', marginBottom: spacing[12] }}>
            <Text style={sectionLabel}>Testimonials</Text>
            <Title level={2} style={{ margin: `${spacing[2]}px 0 0` }}>What Our Customers Say</Title>
          </div>
          <Row gutter={[24, 24]}>
            {TESTIMONIALS.map((t, i) => (
              <Col key={i} xs={24} md={8}>
                <div className={`anim-fade-up ${vis(testimonialsSection.inView)}`} style={{ ...td(i * 120), height: '100%' }}>
                  <div style={{
                    background: colors.background.page, borderRadius: radius.xl,
                    padding: spacing[6], height: '100%',
                    border: `1px solid ${colors.border.subtle}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <Rate disabled defaultValue={t.rating} style={{ color: '#FDCB6E', fontSize: 14, marginBottom: spacing[3] }} />
                    <Paragraph style={{ fontSize: 15, lineHeight: 1.75, color: colors.text.secondary, fontStyle: 'italic', flex: 1, marginBottom: spacing[4] }}>
                      "{t.text}"
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.accent})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
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
        background: `linear-gradient(135deg, ${colors.brand.dark} 0%, ${colors.brand.primary} 100%)`,
        padding: `${spacing[16]}px ${spacing[6]}px`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing[2],
            background: 'rgba(255,255,255,0.15)', borderRadius: radius.pill,
            padding: `6px ${spacing[4]}px`, marginBottom: spacing[4],
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>
            <CheckOutlined /> Free quotes — no obligation whatsoever
          </div>
          <Title className="cta-title" style={{ color: '#fff', fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: spacing[4] }}>
            Ready to Transform Your Space?
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.7, marginBottom: spacing[8] }}>
            Tell us your vision — measurements, fabric, style — and we'll send you a personalised quote within 24 hours, completely free.
          </Paragraph>
          <Space size="large" wrap style={{ justifyContent: 'center' }}>
            <Button
              size="large"
              style={{ backgroundColor: '#fff', borderColor: '#fff', color: colors.brand.primary, fontWeight: 700, height: 52, paddingInline: spacing[10] }}
              onClick={() => navigate('/quotes/new')}
            >
              Get a Free Quote
            </Button>
            <Button size="large" ghost style={{ height: 52, paddingInline: spacing[8] }} onClick={() => navigate('/catalogue')}>
              Browse Catalogue
            </Button>
          </Space>
        </div>
      </section>

    </CustomerLayout>
  );
};
