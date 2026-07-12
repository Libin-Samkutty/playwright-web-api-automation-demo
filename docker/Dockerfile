# Pinned Playwright image — browsers, drivers, and OS-level deps already
# match the version in package.json's @playwright/test, avoiding the
# "works on my machine, fails on the runner" class of drift.
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
