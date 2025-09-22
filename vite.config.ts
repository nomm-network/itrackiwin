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
      "@app": path.resolve(__dirname, "src/app"),
      "@core": path.resolve(__dirname, "src/core"),
      "@features": path.resolve(__dirname, "src/features"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@admin": path.resolve(__dirname, "src/admin"),
      "@types": path.resolve(__dirname, "src/types"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@shared": path.resolve(__dirname, "src/shared"),
      // Feature-specific aliases
      "@profile": path.resolve(__dirname, "src/features/profile"),
      "@coach": path.resolve(__dirname, "src/features/coach"),
      "@gym": path.resolve(__dirname, "src/features/gym"),
      "@workouts": path.resolve(__dirname, "src/workouts-sot"),
      "@social": path.resolve(__dirname, "src/features/social"),
      "@fitness": path.resolve(__dirname, "src/features/health/fitness"),
      "@exercises": path.resolve(__dirname, "src/features/exercises"),
      "@programs": path.resolve(__dirname, "src/features/programs"),
      "@dashboard": path.resolve(__dirname, "src/features/dashboard"),
    },
  },
}));
