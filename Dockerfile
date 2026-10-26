FROM node:22-alpine3.21 as build
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine3.21 as production
ENV TZ=Africa/Lagos
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ./package*.json ./
COPY ./prisma ./prisma
RUN npm install --omit=dev --ignore-scripts
RUN npx prisma generate
COPY --from=build /usr/src/app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8000) + '/api/v1', (r) => r.statusCode < 500 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "dist/src/main.js"]
