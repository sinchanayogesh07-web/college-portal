# NexPlacement Campus Placement Portal

The client is a single-page AngularJS 1.8 application built with semantic HTML, CSS, and JavaScript. The existing Express API and optional MongoDB persistence remain in place.

## Run locally

1. Install the project dependencies with `npm install`.
2. Optionally set `MONGODB_URI` in `.env` to enable MongoDB persistence. Without it, the server uses its in-memory data store.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

AngularJS is loaded from the Google Hosted Libraries CDN. The frontend calls the Express API at `/api`.

## Production build

- `npm run build` creates the static client in `dist`.
- `npm start` starts the Express server. Set `NODE_ENV=production` to serve the built client.

The portal includes student drive search and applications, interview booking, profile and resume management, and coordinator tools for drives, applicants, interview slots, and placement analytics.
