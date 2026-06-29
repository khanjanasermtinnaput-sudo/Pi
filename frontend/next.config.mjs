/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // On Render (experimentalServices), the backend sub-service is mounted at
  // /_/backend. Proxy /api/* there so the browser never needs to know the
  // internal route prefix. Locally, NEXT_PUBLIC_API_URL points to the dev
  // backend directly and no rewrite is needed.
  async rewrites() {
    if (process.env.RENDER) {
      return [
        {
          source: "/api/:path*",
          destination: "/_/backend/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
