import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Turbopack が app などを誤ってルートと推論するのを防ぐ */
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
