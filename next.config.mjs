/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://fa-app-worker.cobijona.workers.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
