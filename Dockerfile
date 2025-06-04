
FROM node:20-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json ./

RUN npm install


COPY . .

RUN npm run build



FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production


COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/next.config.js ./next.config.js



RUN mkdir -p /app/src/posts



RUN mkdir -p /app/public/uploads


EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]