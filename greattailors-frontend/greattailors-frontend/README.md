GreatTailors - Full frontend scaffold (CRA + Tailwind)
=====================================================

What this archive contains:
- A Create React App style frontend scaffold with:
  - Tailwind configured (tailwind.config.js + postcss.config.cjs)
  - Axios API wrapper (src/api/api.js)
  - Auth hook (src/hooks/useAuth.js)
  - Pages: Login, Dashboard
  - Simple Navbar component
  - index.js, App.js wired to React Router

How to use:
1. Extract the archive into the folder where your project should be (or overwrite an existing CRA app).
2. In project root, run:

   npm install

   # then to ensure Tailwind PostCSS plugin is available:
   npm install -D @tailwindcss/postcss postcss@8 tailwindcss autoprefixer

3. Start dev server:

   npm start

Notes:
- If you previously had conflicting PostCSS config files, remove them or keep only postcss.config.cjs.
- This scaffold assumes your backend API is reachable at http://localhost:4000 by default. Change VITE_API_BASE in .env if needed.
