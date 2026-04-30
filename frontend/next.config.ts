import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Proxy API/auth/admin calls to the FastAPI backend on localhost:8000.
  // Keeps the browser on a single origin — no CORS, no cross-domain cookie
  // headaches, no tracker-blocker false positives.
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
    return [
      { source: "/auth/:path*",  destination: `${backend}/auth/:path*` },
      { source: "/api/:path*",   destination: `${backend}/api/:path*` },
      { source: "/admin/:path*", destination: `${backend}/admin/:path*` },
    ];
  },
};

export default nextConfig;
