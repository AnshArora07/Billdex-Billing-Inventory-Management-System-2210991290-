# Billdex Frontend

React.js frontend for the Billdex billing and inventory management system.

---

## Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v18 or higher — [https://nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- The **Billdex backend** running on `http://localhost:5000`

---

## Setup

### 1. Create the project folder

```bash
mkdir billdex-frontend
cd billdex-frontend
```

### 2. Create the folder structure

```bash
mkdir -p src/components src/pages src/layouts src/services src/utils
```

Your structure should look like this:

```
billdex-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Modal.jsx
    │   ├── ProtectedRoute.jsx
    │   └── StatCard.jsx
    ├── layouts/
    │   ├── DashboardLayout.jsx
    │   ├── Sidebar.jsx
    │   └── Topbar.jsx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── ProductsPage.jsx
    │   ├── BillingPage.jsx
    │   └── SalesPage.jsx
    ├── services/
    │   └── api.js
    └── utils/
        └── auth.js
```

### 3. Copy all source files

Place each file from this project into its matching path shown above.

### 4. Install dependencies

```bash
npm install
```

This installs: `react`, `react-dom`, `react-router-dom`, `axios`, `tailwindcss`, `vite`, and supporting packages.

### 5. Start the development server

```bash
npm run dev
```

The app will open at **http://localhost:5173**

---

## Environment

The frontend talks to the backend via axios. The base URL is set in `src/services/api.js`:

```js
baseURL: 'http://localhost:5000/api'
```

If your backend runs on a different port, update this line before starting.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `/dist`) |
| `npm run preview` | Preview the production build locally |

---

## Pages and Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/dashboard` | Dashboard | Protected |
| `/products` | Products | Protected |
| `/billing` | Billing | Protected |
| `/sales` | Sales history | Protected |

Visiting `/` automatically redirects to `/dashboard`. If not logged in, protected routes redirect to `/login`.

---

## How Authentication Works

1. On login or signup, the backend returns a JWT token and user object.
2. These are saved to `localStorage` by `src/utils/auth.js`.
3. Every API request automatically includes the token via an axios interceptor in `src/services/api.js`.
4. A `401` response from the backend clears the token and redirects to `/login`.
5. Clicking **Logout** in the topbar clears the token and redirects to `/login`.

---

## Connecting to the Backend

Start the Billdex backend first, then start this frontend. Both must be running at the same time during development.

```bash
# Terminal 1 — backend
cd billdex
npm run dev

# Terminal 2 — frontend
cd billdex-frontend
npm run dev
```

---

## Troubleshooting

**Blank page on load**
Make sure `index.html` is in the root of the project (not inside `src/`), and that `src/main.jsx` exists.

**`npm install` fails**
Check your Node.js version with `node -v`. It must be v18 or higher.

**API calls return network errors**
Confirm the backend is running on port `5000`. Check `src/services/api.js` and update `baseURL` if needed.

**Styles not loading**
Make sure `src/index.css` starts with the three Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Also confirm `tailwind.config.js` and `postcss.config.js` are in the project root.

**Login redirects back to login**
The token may be missing or expired. Open browser DevTools → Application → Local Storage and clear `billdex_token` and `billdex_user`, then log in again.