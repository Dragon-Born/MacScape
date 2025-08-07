import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Cloudflare Pages
  output: 'export',
  
  // Disable image optimization since it requires server-side processing
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes are handled consistently
  trailingSlash: true,
  
  // Disable eslint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable server-side features that won't work in static export
  experimental: {
    // Disable PPR (Partial Prerendering) for static export
    ppr: false,
  },
  
  // Configure for Cloudflare Pages
  // env: {
  //   NEXT_PUBLIC_APP_URL: 'https://dopaverse.org',
  // },
  
  // Optimize for static hosting
  generateBuildId: async () => {
    // Use a consistent build ID for static deployment
    return 'dopa-static-build';
  },
  
  // Configure base path if needed (leave empty for root domain)
  basePath: '',
};

export default nextConfig;
