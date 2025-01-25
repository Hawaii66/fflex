import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://flex.skistar.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        cookieDomainRewrite: {
          "*": "",
        },
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (!req.headers.cookie) {
              return;
            }
            proxyReq.setHeader("cookie", req.headers.cookie);
          });
        },
        secure: false,
      },
    },
  },
});
