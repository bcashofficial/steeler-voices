# voices-design-system — the Module Federation remote.
# Builds the DEVELOPMENT flavour (so a host on `vite dev` shares the same jsx
# runtime) and serves dist/ with vite preview on 5301.
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN NODE_ENV=development npm run build:dev
EXPOSE 5301
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5301", "--strictPort"]
