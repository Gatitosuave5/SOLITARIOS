import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    //  Permite buildar aunque haya errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
