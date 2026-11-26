# .devcontainer/Dockerfile
FROM node:20-bullseye

# Install VS Code extension dev dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    xvfb \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Yeoman and VS Code Extension Generator (optional but handy)
RUN npm install -g yo generator-code vsce @vscode/vsce