import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@app": path.resolve(__dirname, "src/app"),
      "@admin": path.resolve(__dirname, "src/admin"),
      // Category aliases
      "@health": path.resolve(__dirname, "src/features/health"),
      "@social": path.resolve(__dirname, "src/features/social"), 
      "@commerce": path.resolve(__dirname, "src/features/commerce"),
      // Health subcategory aliases
      "@fitness": path.resolve(__dirname, "src/features/health/fitness"),
      "@nutrition": path.resolve(__dirname, "src/features/health/nutrition"),
      "@sleep": path.resolve(__dirname, "src/features/health/sleep"),
      "@recovery": path.resolve(__dirname, "src/features/health/recovery"),
      "@mindset": path.resolve(__dirname, "src/features/health/mindset"),
    },
  },
}));
