# NexPlacement Campus Placement Portal

The app is built with semantic HTML, separate CSS, and vanilla JavaScript, with a Node.js/Express API and optional MongoDB persistence. The entire project uses JavaScript (ES modules); no TypeScript compiler or frontend framework is required.

## Run locally

1. Install Node.js 20.19+ or 22.12+ and the project dependencies with `npm install`.
2. Optionally set `MONGODB_URI` in `.env` to enable MongoDB persistence. Without it, the server uses its in-memory data store.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

The frontend has no UI framework runtime or frontend build dependency beyond Vite. It calls the Express API at `/api`.

## Production build

- `npm run build` creates the static client in `dist`.
- `npm start` starts the Express server. Set `NODE_ENV=production` to serve the built client.
- `npm run lint` checks the JavaScript files for syntax errors.

The portal includes student drive search and applications, interview booking, profile and resume management, and coordinator tools for drives, applicants, interview slots, and placement analytics.
