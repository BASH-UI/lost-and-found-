# Campus Lost & Found

A responsive student lost-and-found noticeboard.

## Features
- Create lost-item and found-item posts
- Browse, search, and filter posts
- Edit and delete posts
- Update status to Open, Claimed, or Returned
- Save posts in browser local storage

## Run locally
1. Download or clone this project.
2. Open the folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Add a post and refresh the page to confirm that it remains saved.

## Important limitation
This is a front-end prototype. Browser local storage is local to one browser profile and device. It does not share posts between students. A real campus-wide version needs a shared backend/database, authentication, and access rules (for example, Supabase).

## Files
- `index.html` — page structure
- `styles.css` — layout and appearance
- `script.js` — form handling, CRUD actions, filters, and local storage
