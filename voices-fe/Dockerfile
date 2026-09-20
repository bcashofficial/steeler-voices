# voices-fe — the Module Federation host. Builds the development flavour
# (the design_system remote is built the same way, so both share one jsx
# runtime) and serves dist/ with vite preview on 5300. The remote's URL is
# what the browser will fetch, so it stays localhost:5301 in compose.
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG DESIGN_SYSTEM_URL=http://localhost:5301
ARG VITE_BACKEND_URL=http://localhost:8300
RUN DESIGN_SYSTEM_URL=$DESIGN_SYSTEM_URL VITE_BACKEND_URL=$VITE_BACKEND_URL npm run build:dev
EXPOSE 5300
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5300", "--strictPort"]
