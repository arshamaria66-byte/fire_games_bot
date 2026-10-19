import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Permit the Arena live-preview origin to request the dev server's HMR assets.
  allowedDevOrigins: ['3000-ig106kb5ufufeis65q1fk.e2b.app'],
};
export default nextConfig;
