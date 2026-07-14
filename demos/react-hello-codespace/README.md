# React Hello Codespace Demo

A minimal React + Vite demo showing how to develop a front-end app inside a GitHub Codespaces development container.

## What this demonstrates

- React single-page app using Vite.
- GitHub Codespaces development environment.
- Forwarded preview ports for development and production preview.
- Optional Docker container build using nginx.
- Safe placement under `demos/react-hello-codespace/` so it does not overwrite the existing GitHub Pages site.

## Run in GitHub Codespaces

1. Open the repository in GitHub.
2. Select **Code** > **Codespaces** > **Create codespace on main** or create a codespace from this branch.
3. The dev container runs:

   ```bash
   cd demos/react-hello-codespace && npm install
   ```

4. Start the React development server:

   ```bash
   cd demos/react-hello-codespace
   npm run dev
   ```

5. Open the forwarded port `5173`.

## Local development

```bash
cd demos/react-hello-codespace
npm install
npm run dev
```

## Production build

```bash
cd demos/react-hello-codespace
npm run build
npm run preview
```

The preview server runs on port `4173`.

## Docker build

```bash
cd demos/react-hello-codespace
docker build -t react-hello-codespace-demo .
docker run --rm -p 8080:80 react-hello-codespace-demo
```

Then open:

```text
http://localhost:8080
```

## GitHub hosting model

GitHub has three different concepts that are easy to confuse:

| Capability | Purpose | Production hosting? |
|---|---|---|
| GitHub Codespaces | Cloud development container | No |
| GitHub Pages | Static website hosting | Yes, for static sites |
| GitHub Container Registry | Stores container images | No, registry only |

For this demo, Codespaces is used for development. For permanent public hosting, either deploy the built static files to GitHub Pages or deploy the Docker image to a real container runtime such as Azure Container Apps, Azure App Service, AWS, Fly.io, Render, or similar.
