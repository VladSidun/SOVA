import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { parsePublicEnv } from "./src/lib/public-env";

// Validate configured public values without requiring future integration keys.
parsePublicEnv(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
