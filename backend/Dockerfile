
FROM node:18-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build


FROM node:18-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create the non-root application user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy package files with correct ownership
COPY --chown=app:app package*.json ./

# Install production dependencies as the app user
USER app
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder --chown=app:app /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
