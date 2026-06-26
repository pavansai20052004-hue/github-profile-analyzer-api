# GitHub Profile Analyzer API

Backend service for the Node.js assignment. It analyzes a public GitHub user profile with the GitHub API, stores useful insights in MySQL, and exposes endpoints to read the stored analysis.

## Tech Stack

- Node.js
- Express.js
- MySQL
- GitHub public API

## Features

- Analyze a GitHub username and store the result in MySQL.
- Save useful profile insights such as public repositories, followers, following, stars, forks, top language, language breakdown, top repositories, account age, profile completeness, and activity score.
- Fetch all stored analyzed profiles with pagination, sorting, and search.
- Fetch a single stored analyzed profile by username.
- Centralized error handling, request validation, rate limiting, CORS, and security headers.

## Project Structure

```text
src/
  config/          Environment and database configuration
  controllers/     Request handlers
  middleware/      Error handling
  routes/          API routes
  services/        GitHub API and MySQL business logic
  utils/           Shared helpers
database/
  schema.sql       MySQL database schema/export
postman/
  GitHub_Profile_Analyzer.postman_collection.json
scripts/
  init-db.js       Initializes MySQL database from schema.sql
  check-syntax.js  Syntax verification script
```

## Setup Instructions

1. Install dependencies.

```bash
npm install
```

2. Create the environment file.

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials.

3. Create the database and table.

```bash
npm run db:init
```

You can also run `database/schema.sql` manually in MySQL Workbench or the MySQL CLI.

4. Start the API.

```bash
npm run dev
```

For production:

```bash
npm start
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | API port. Default: `3000` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port. Default: `3306` |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `GITHUB_TOKEN` | Optional GitHub token to increase API rate limits |
| `ANALYSIS_MAX_REPOS` | Maximum repositories inspected per user. Default: `300` |
| `CORS_ORIGIN` | Allowed origin. Use `*` for local testing |

## API Endpoints

### Health Check

```http
GET /health
```

### Analyze and Store a Profile

```http
POST /api/profiles/analyze
Content-Type: application/json

{
  "username": "octocat"
}
```

Alternative path:

```http
POST /api/profiles/octocat/analyze
```

### Fetch All Stored Profiles

```http
GET /api/profiles?page=1&limit=20&sortBy=analyzedAt&order=desc
```

Supported `sortBy` values:

- `analyzedAt`
- `followers`
- `publicRepos`
- `totalStars`
- `username`

Optional search:

```http
GET /api/profiles?search=india
```

### Fetch a Single Stored Profile

```http
GET /api/profiles/octocat
```

## Example Response

```json
{
  "success": true,
  "message": "GitHub profile analyzed and stored successfully",
  "data": {
    "username": "octocat",
    "publicRepos": 8,
    "followers": 17000,
    "totalStars": 120,
    "topLanguage": "Ruby",
    "insights": {
      "activityScore": 72,
      "accountAgeDays": 6000,
      "profileCompleteness": {
        "hasName": true,
        "hasBio": true,
        "hasLocation": true,
        "hasBlog": true,
        "hasCompany": false
      }
    }
  }
}
```

## Postman Collection

Import this file into Postman:

```text
postman/GitHub_Profile_Analyzer.postman_collection.json
```

Set the collection variable `baseUrl` to your local or deployed API URL.

## Deployment Notes

Deploy the API to a Node.js hosting provider such as Render, Railway, Vercel serverless functions, or an AWS/EC2 server. Use a hosted MySQL database and set the same environment variables on the deployment platform.

Submission fields usually need:

- Source code repository link: your GitHub repository URL.
- Live API endpoints: your deployed API base URL, for example `https://your-app.onrender.com`.
- Postman collection: share the collection file or a public Postman link.
