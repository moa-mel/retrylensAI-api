FROM node:22-alpine AS build
WORKDIR /usr/src/app

# Dummy URL only needed for client generation
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"

# Copy package files + Prisma schema/config first
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Now install (postinstall can find the schema)
RUN npm install

# Rest of the source + generate + build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- production stage ----------
FROM node:22-alpine AS production
ENV TZ=Africa/Lagos
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY ./prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY --from=build /usr/src/app/node_modules/.prisma /usr/src/app/node_modules/.prisma
COPY --from=build /usr/src/app/node_modules/@prisma /usr/src/app/node_modules/@prisma
COPY --from=build /usr/src/app/node_modules/@prisma/client /usr/src/app/node_modules/@prisma/client
COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/src/main.js"]