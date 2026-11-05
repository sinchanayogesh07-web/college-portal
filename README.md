# NexPlacement Campus Placement Portal

The client is a single-page application built with semantic HTML, separate CSS, and vanilla JavaScript. The Express API and optional MongoDB persistence remain in place. The Node.js server and shared data models continue to use TypeScript.

## Run locally

1. Install the project dependencies with `npm install`.
2. Optionally set `MONGODB_URI` in `.env` to enable MongoDB persistence. Without it, the server uses its in-memory data store.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

The frontend has no UI framework runtime or frontend build dependency beyond Vite. It calls the Express API at `/api`.

## Production build

- `npm run build` creates the static client in `dist`.
- `npm start` starts the Express server. Set `NODE_ENV=production` to serve the built client.

The portal includes student drive search and applications, interview booking, profile and resume management, and coordinator tools for drives, applicants, interview slots, and placement analytics.
