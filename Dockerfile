FROM node:18-slim

RUN apt update && apt install -y wget gnupg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/keyrings/google.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt update && apt install -y google-chrome-stable && \
    npm install puppeteer

WORKDIR /app
COPY . .

CMD ["node", "index.js"]
