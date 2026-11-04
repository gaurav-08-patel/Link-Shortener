# Stage 1: Build the application
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build


# Stage 2: Production image
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root application user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy package files
COPY package*.json ./

# Install production dependencies as root,
# then give the application user ownership
RUN npm ci --omit=dev && chown -R app:app /app

# Copy compiled application
COPY --from=builder --chown=app:app /app/dist ./dist

# Run the application as a non-root user
USER app

EXPOSE 3000

CMD ["npm", "start"]