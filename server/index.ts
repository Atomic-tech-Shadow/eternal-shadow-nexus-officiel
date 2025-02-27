{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "tsx index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production tsx index.ts",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "firebase": "^11.3.1",
    "firebase-admin": "^13.1.0",
    "ws": "^8.18.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "tsx": "^4.19.1",
    "esbuild": "^0.25.0",
    "vite": "^5.4.14",
    "@types/express": "4.17.21",
    "@types/ws": "^8.5.14"
  }
      }
