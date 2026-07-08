# Production Deployment Guide (Klipnova + ELTS PWA)

This guide outlines how to build, preview, and deploy your combined TanStack Start application to production hosting environments.

---

## 📦 1. How to Build the Production Bundle

To compile the entire project (both client-side assets and server-side SSR engine), run the following command in the `mylocation/` directory:

```bash
npm run build
```

### What does this generate?
Vinxi & Nitro will compile your app into the **`.output/`** directory (not `dist/`, as TanStack Start uses Nitro as its server engine):
*   **`.output/public/`**: Contains all static assets (Klipnova styling, images, service worker `sw.js`, manifest, and client JS/CSS bundles). These can be cached and served directly by a CDN.
*   **`.output/server/`**: Contains the compiled SSR Node.js server engine that handles routing, server functions, page rendering, and service worker registration responses.

---

## 🔍 2. How to Preview the Production Build Locally

Before deploying to a public server, you can preview the exact compiled production code locally:

```bash
npm run preview
```
This boots up a local production-mimicking web server (usually at `http://localhost:3000`) so you can verify that animations, layout routing, PWA caching, and forms are working correctly.

---

## 🚀 3. Deployment Options

Since your app is built on **TanStack Start (Vinxi + Nitro)**, it supports multi-provider deployment presets out of the box.

### Option A: Cloudflare Pages / Workers (Recommended & Cost-Efficient)
Cloudflare is highly recommended for speed and native PWA response times.
1. Install Wrangler globally or use npx:
   ```bash
   npm run build
   ```
2. Deploy the built package using Cloudflare's Nitro prebuilt deployer:
   ```bash
   npx nitro deploy --prebuilt
   ```
3. Set your environment variables (like `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`) in the Cloudflare Dashboard under your project's settings.

### Option B: Vercel or Netlify (Zero Configuration)
If you connect your GitHub repository to Vercel or Netlify, they will automatically detect your project and set up the builds:
1. **Framework Preset:** Select **Vite** or **Vercel/Netlify Functions**.
2. **Build Command:** `npm run build`
3. **Output Directory:** `.output` (Netlify and Vercel automatically detect `.output` for Nitro/Start server builds).
4. Add your `.env` variables under the **Environment Variables** tab in your hosting dashboard.

### Option C: VPS / Dedicated Server (DigitalOcean, AWS, Linode)
If you have a virtual private server, you can run the compiled Node server directly:
1. Build the project on the server:
   ```bash
   npm run build
   ```
2. Start the production Node server:
   ```bash
   node .output/server/index.mjs
   ```
   *Note: Use a process manager like **PM2** (`pm2 start .output/server/index.mjs --name elts-app`) to keep the server running in the background.*

---

## 🔒 4. Production Environment Variables (Crucial Step)

When you deploy to a production host, your local `.env` file **will not** be uploaded (it is protected by `.gitignore`). You must copy your keys from `.env` and paste them into your hosting provider's dashboard:

| Key | Description | Exposure |
| :--- | :--- | :--- |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase Project ID | Public (Client Bundle) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase Anon/Publishable Key | Public (Client Bundle) |
| `VITE_SUPABASE_URL` | Your Supabase Project API URL | Public (Client Bundle) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your admin secret key | **Private (Server Side Only)** |
