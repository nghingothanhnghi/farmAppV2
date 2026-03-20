import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // server: {
  //   host: true, // allow external access
  //   port: 5173,
  //   hmr: {
  //     protocol: 'ws',
  //     host: 'localhost',
  //     port: 5173,
  //   },
  // },
  optimizeDeps: {
    include: [
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-image",
      "prosemirror-model",
      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-transform",
      "prosemirror-commands",
      "prosemirror-schema-list",
    ],
  },
})
