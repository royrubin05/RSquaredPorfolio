import type { NextConfig } from "next";

import { execSync } from "child_process";

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT: commitHash,
  },
};

export default nextConfig;
