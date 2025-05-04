import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from "vite-plugin-pwa";
import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    removeConsole(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icon.svg"],
      manifest: {
        id: "dn-cascade",
        name: "DebRIEF",
        short_name: "DebRIEF",
        version: version,
        description:
          "Comprehensive data management solution transforming organizational efficiency through intelligent technology.",
        orientation: "portrait",
        lang: "sk",
        theme_color: "#FFFFFF",
        background_color: "#FFFFFF",
        handle_links: "always",
        categories: ["social", "productivity"],
        display: "standalone",
        start_url: "/",
        scope: "/",
        prefer_related_applications: false,
        disable_text_selection: true,
        icons: [
          {
            src: "/pwa/icon-192x192-mask.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa/icon-512x512-mask.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "main maskable",
          },
          {
            src: "/pwa/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "main any",
          },
        ],
        screenshots: [
          {
            src: "/pwa/preview-desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "DebRIEF Desktop Interface",
          },
          {
            src: "/pwa/preview-mobile.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow",
            label: "DebRIEF Mobile Interface",
          },
        ],
      },
      workbox: {
        // Configure navigation handling for SPA
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/firebase/, /^\/_/],

        // Add strategies specifically for your application routes
        runtimeCaching: [
          {
            // Handle all navigation requests (HTML)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "navigation-cache",
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Cache local app data and API responses
            urlPattern: /^https:\/\/(firestore|firebase)\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Exclude the firebase-messaging-sw.js from being modified by workbox
        exclude: [/firebase-messaging-sw\.js$/],
      },
      // Ensure the service worker doesn't interfere with the Firebase Messaging SW
      injectRegister: null,
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1024,
  },
});
