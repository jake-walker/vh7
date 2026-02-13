# VH7

VH7 is an all-in-one URL shortener, file sharing, and pastebin service. It provides a simple and efficient way to create short links, share files, and host code snippets or text pastes.

The production instance is available at **[vh7.uk](https://vh7.uk)**.

## Features

- **URL Shortener:** Create short, easy-to-share links.
- **File Sharing:** Upload and share files with ease.
- **Pastebin:** Share code snippets and text with syntax highlighting.
- **Advanced Controls:** Set expiration dates and custom slugs for your shares.
- **Developer Friendly:** Built with a modern tech stack and a clean API.

## Tech Stack

VH7 is built entirely on the Cloudflare ecosystem for maximum performance and scalability:

- **Frontend:** [React](https://reactjs.org/) with [Mantine](https://mantine.dev/) for UI components, [Vite](https://vitejs.dev/) for building, and [Redux Toolkit](https://redux-toolkit.js.org/) for state management.
- **Backend:** [Cloudflare Workers](https://workers.cloudflare.com/) using the [Hono](https://hono.dev/) framework.
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite-based serverless database) managed with [Drizzle ORM](https://orm.drizzle.team/).
- **Object Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/) for storing uploaded files.
- **Tooling:** [Biome](https://biomejs.dev/) for linting and formatting, [pnpm](https://pnpm.io/) for package management.

## Project Structure

The repository is organized into a monorepo with two main directories:

- `/app`: The frontend React application.
- `/worker`: The backend API and scheduled cleanup tasks.

## Local Development

### Prerequisites

- [pnpm](https://pnpm.io/installation) installed.
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) CLI installed (optional, but recommended).

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jakew/vh7.git
   cd vh7
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Initialize the local database:**
   In the `worker` directory, run migrations to set up your local D1 instance:
   ```bash
   cd worker
   pnpm migrate:up
   cd ..
   ```

### Running the Application

To run VH7 locally, you need to start both the backend and the frontend.

1. **Start the Backend (Worker):**
   ```bash
   cd worker
   pnpm dev
   ```
   The API will be available at `http://localhost:8787`.

2. **Start the Frontend (App):**
   In a new terminal window:
   ```bash
   cd app
   pnpm dev
   ```
   The application will be available at the URL provided by Vite (usually `http://localhost:5173`).

## Deployment

Deployment is handled via Cloudflare. Ensure you have your `wrangler.jsonc` configured with the correct environment variables and bindings.

```bash
# Deploy the worker and assets
wrangler deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.