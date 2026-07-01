FROM debian:stable-slim

# Install ClamAV and Node
RUN apt-get update && apt-get install -y --no-install-recommends \
  clamav clamav-daemon clamav-freshclam \
  curl ca-certificates gnupg lsb-release \
  nodejs npm \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

COPY scan-worker.js ./

# update ClamAV DB on start
CMD freshclam && node scan-worker.js
