# RetryLensAI

## How to Test

You can test RetryLensAI using the live frontend or by running the API and frontend locally.

### 1. Test the Live Application

**Frontend:** [https://sing-flow-zug6.onrender.com](https://sing-flow-zug6.onrender.com)

Open the frontend to explore the dashboard, view API incidents, inspect incident details, and test the available analysis and replay functionality.

> **Note:** The frontend requires the backend API to be running and accessible. If the hosted application is unavailable, use the local setup instructions below.

### 2. Run the Project Locally

**Backend API**

Clone the backend repository:

```bash
git clone https://github.com/moa-mel/retrylensAI-api.git
cd retrylensAI-api
npm install
```

Configure the required environment variables using the project's `.env.example` or setup instructions, then start the backend using its documented start command.

**Frontend**

Clone or navigate to the frontend project, then install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Replace the URL with the actual backend API address.

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Test the API Functionality

The frontend interacts with the following API endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/incidents` | Retrieve API incidents |
| GET | `/incidents/:id` | Retrieve incident details |
| POST | `/incidents/:id/analyze` | Analyze an incident |
| POST | `/incidents/:id/replay` | Replay an incident using broken or fixed mode |

Example replay request:

```json
{
  "mode": "broken"
}
```

You can also use:

```json
{
  "mode": "fixed"
}
```

No test account or faucet is currently documented. Add demo credentials or seed-data instructions here if your deployed application requires authentication or preloaded incidents.

---

## Overview

RetryLensAI is an API reliability and retry management solution designed to help developers handle failed API requests more effectively.

It aims to reduce the impact of temporary API failures, network interruptions, and server errors by providing a centralized way to manage request retries.

Instead of implementing retry logic separately in every application, developers can integrate RetryLensAI into their projects through its API or the published npm SDK.

## Key Features

- **API Reliability:** Helps applications recover from temporary request failures.
- **Automated Retries:** Provides a mechanism for retrying failed API requests.
- **Developer Experience:** Reduces repetitive retry-handling logic across applications.
- **Incident Analysis:** Provides functionality for inspecting and analyzing API incidents.
- **Request Replay:** Allows developers to replay incidents in broken and fixed modes.
- **Reusable Integration:** Makes RetryLensAI accessible through an npm package.

## NPM SDK

RetryLensAI is also available as an npm package, allowing developers to integrate its functionality into their Node.js applications.

### Install the SDK

```bash
npm install retrylensai-sdk
```

### Resources

- **NPM Package:** [retrylensai-sdk](https://www.npmjs.com/package/retrylensai-sdk)
- **Backend API Repository:** [RetryLensAI API](https://github.com/moa-mel/retrylensAI-api)

The RetryLensAI API provides the backend functionality, while the npm SDK offers a convenient way for developers to integrate RetryLensAI into their applications.

## Frontend

The RetryLensAI frontend is built with Next.js using the App Router. It provides an interface for viewing incidents, inspecting failures, analyzing incidents, and testing replay functionality.

**Live Frontend:** [https://sing-flow-zug6.onrender.com](https://sing-flow-zug6.onrender.com)

### Frontend Setup

1. Put the frontend folder in your project as `web/`.
2. Ensure your Next.js app uses the `@/*` alias for the project root.
3. Create `web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Replace the port with the actual NestJS API port.
5. Start the API, then run the frontend:

```bash
npm run dev
```

## API Expectations

The frontend expects the following API responses:

- `GET /incidents` returns `IncidentSummary[]`.
- `GET /incidents/:id` returns an `Incident`.
- `POST /incidents/:id/analyze` returns the updated `Incident`.
- `POST /incidents/:id/replay` accepts `{ "mode": "broken" | "fixed" }` and returns the updated `Incident`.

### Important Implementation Note

The supplied backend currently returns IDs inconsistently: `fetchIncidents()` returns numeric IDs, while `view()` converts IDs to strings. The frontend types reflect that distinction.

Consider standardizing the API response shape so incident IDs use the same type throughout the application.

If the frontend runs on a different origin from NestJS, configure CORS in the backend to allow the frontend origin.

## Tech Stack

- **Backend:** NestJS
- **Frontend:** Next.js
- **SDK:** Node.js / npm
- **Language:** TypeScript
