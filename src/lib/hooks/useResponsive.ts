import { useEffect, useState } from 'react';

export const useResponsive = () => {
  const [size, setSize] = useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 992,
    isDesktop: window.innerWidth >= 992,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 992,
        isDesktop: window.innerWidth >= 992,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};
