FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY . .

RUN apk add openssl && npm install --include=dev

# Next.js collects telemetry by default, we can disable it here
ENV NEXT_TELEMETRY_DISABLED 1


EXPOSE 3000

CMD ["npm", "run", "dev"]