import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Bhim-Lock-And-Keys",
  assetPrefix: "/Bhim-Lock-And-Keys/",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

