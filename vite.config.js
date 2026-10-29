import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { knowledgeApi } from "./scripts/knowledge-api.mjs";
export default defineConfig({
    plugins: [knowledgeApi(), react()],
    server: {
        host: "127.0.0.1", port: 52947, strictPort: true,
        fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/knowledge/private/**"] }
    },
    preview: { host: "127.0.0.1", port: 52947, strictPort: true }
});
