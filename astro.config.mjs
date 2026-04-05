// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const env = process.env.NODE_ENV
  ? loadEnv(process.env.NODE_ENV, process.cwd(), "")
  : {};

// https://astro.build/config
export default defineConfig({
  base: env.BASE_URL,
  site: env.SITE,
});
