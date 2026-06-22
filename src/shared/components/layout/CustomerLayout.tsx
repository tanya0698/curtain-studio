import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useColors } from '../../../lib/theme';

export const CustomerLayout = ({ children }: { children: ReactNode }) => {
  const colors = useColors();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.background.page }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
