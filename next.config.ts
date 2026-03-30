import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Pin Turbopack to this package when a parent directory also has a lockfile
 * (otherwise Next infers the wrong workspace root and `tailwindcss` fails to resolve).
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
