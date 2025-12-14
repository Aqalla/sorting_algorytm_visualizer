# Sorting Algorithm Visualizer

Interactive sorting algorithm visualizer with user authentication and settings persistence.

## Features

- Visual demonstration of sorting algorithms (Bubble Sort, Insertion Sort, Quick Sort)
- User authentication (login/register via email)
- Customizable settings (array size, animation speed)
- Dark/Light theme toggle
- Settings sync with backend API

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **State Management**: React Query, localStorage

## Project Structure

```
sorting_algorithm_visualizer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── algorithms/     # Sorting algorithm implementations
│   │   ├── components/     # React components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities, API client, config
│   │   └── pages/          # Page components
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route handlers
│   ├── static.ts           # Static file serving (production)
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite dev server integration
├── shared/                 # Shared types and schemas
│   └── schema.ts
├── script/                 # Build scripts
│   └── build.ts
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Docker Compose configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Docker

### Production

```bash
docker-compose up --build
```

### Development with hot reload

```bash
docker-compose --profile dev up dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/create` | Create new user |
| POST | `/api/v1/users/login` | Login existing user |
| GET | `/api/v1/users/settings` | Get user settings |
| PATCH | `/api/v1/users/settings` | Update user settings |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `API_BASE_URL` | Backend API URL | `` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | TypeScript type check |

## License

MIT
