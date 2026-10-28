import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Ladle runs on Vite instead of Next.js, so Tailwind and the `@/*` alias from
// tsconfig.json are wired up here.
export default {
  plugins: [tailwindcss()],
  resolve: {
    alias: { "@": path.join(root, "src") },
  },
};
