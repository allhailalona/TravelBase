import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access
    port: 5173,
    watch: {
      usePolling: true // Better HMR in Docker
    }
  }
});