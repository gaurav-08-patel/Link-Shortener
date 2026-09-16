FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install dependencies (including dev deps for the TypeScript build)
COPY package*.json ./
# Use `npm ci` for deterministic, faster installs from package-lock.json in builds
RUN npm ci

# Copy source and build
COPY . ./
RUN npm run build

### Final image (runtime only)
FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Use production mode in the final image
ENV NODE_ENV=production

# Copy package metadata and install only production deps
COPY --from=builder /app/package*.json ./
# Install only production dependencies in the final image using the lockfile
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Create non-root user and adjust ownership
RUN addgroup --system app && adduser --system --ingroup app app && chown -R app:app /app
USER app

EXPOSE 3000

CMD ["npm", "start"]
