# gawego

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, React Router, Express, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Router** - Declarative routing for React
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Express** - Fast, unopinionated web framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **MySQL** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```
## Database Setup

This project uses MySQL with Drizzle ORM.

1. Make sure you have a MySQL database set up.
2. Update your `apps/server/.env` file with your MySQL connection details.

3. Apply the schema to your database:
```bash
bun db:push
```


Then, run the development server:

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).



## Project Structure

```
gawego/
├── apps/
│   ├── web/         # Frontend application (React + React Router)
│   └── server/      # Backend API (Express, TRPC)
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
