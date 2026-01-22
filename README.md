# How to Run the React Application Locally

## Installation
- Install dependencies:
```npm install```

## Run Development Server
- Start the development server:
```npm run dev``` 

> By default, the vite server runs at `http://localhost:5173`.

## Build for Production
- To create a production build:
```npm run build```
- To run this build:
  ```npm run preview```

## Notes
- Make sure `.env` files are configured properly if your React app depends on environment variables.
- For SPA routing, ensure the server redirects all routes to `index.html` (for example, using `.htaccess` on Apache).
