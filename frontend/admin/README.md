Admin app scaffold (placeholder). Run `npm install` then `npm run dev` inside this folder to start.# EPU Admin (standalone)

This is a small standalone admin UI using Vite + Vue 3. It's intentionally separate from the main Nuxt frontend so you can develop/test admin pages independently.

Run locally:

```powershell
cd frontend/admin
npm install
npm run dev
# open http://localhost:5173 (or the port Vite prints)
```

Notes:

- This is a minimal app for testing UI. If you want Tailwind, I can add it.
- To integrate with backend APIs later, update the components to call your Nest endpoints.
