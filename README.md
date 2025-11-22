# Restaurant Listing Application

A React-based web application backed by a Node.js server to display and manage a list of restaurants. Features include sorting, filtering, geolocation-based distance calculation, and Google Maps integration. Data is synced nightly from a Google Sheet via GitHub Actions.

## Project Structure

```
rsTable/
├── client/         # React frontend (Vite + Tailwind CSS)
├── server/         # Node.js backend (Express)
├── data/           # Data storage (JSON)
├── scripts/        # Automation scripts (Google Sheets sync)
└── .github/        # GitHub Actions workflows
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- Google Cloud Service Account (for Google Sheets sync)
- Google Maps API Key (optional, for map thumbnails)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd rsTable
    ```

2.  **Install dependencies for all workspaces:**
    ```bash
    # Install Client dependencies
    cd client
    npm install

    # Install Server dependencies
    cd ../server
    npm install

    # Install Script dependencies
    cd ../scripts
    npm install
    ```

## Running the Application

You need to run both the backend server and the frontend client.

### 1. Start the Backend Server
The server runs on `http://localhost:3001`.

```bash
cd server
node index.js
```

### 2. Start the Frontend Client
The client runs on `http://localhost:5173`.

```bash
cd client
npm run dev
```

## Running Tests

Integration tests are available for the backend API.

```bash
cd server
npm test
```

## Configuration

### Environment Variables
Create a `.env` file in the `server/` directory if you want to customize the port (default is 3001).
```
PORT=3001
```

### Google Sheets Sync (Automation)
The project includes a GitHub Action that runs every night to sync data from a Google Sheet. To enable this:

1.  Set up a Google Cloud Service Account with access to the Google Sheets API.
2.  Share your Google Sheet with the Service Account email.
3.  Add the following **Secrets** to your GitHub Repository:
    - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The email of your service account.
    - `GOOGLE_PRIVATE_KEY`: The private key of your service account.
    - `GOOGLE_SHEET_ID`: The ID of the Google Sheet you want to sync from.

You can also run the sync script manually:
```bash
cd scripts
npm run sync
```
(Note: You will need a `.env` file in `scripts/` with the same credentials for local execution).

## Features

- **Sortable Columns**: Click on headers to sort by Name, Address, Distance, etc.
- **Filtering**: Search bar filters results by name, address, or comments (min 3 chars).
- **Geolocation**: Calculates distance from your current location to the restaurant.
- **Dark Mode**: Toggle between light and dark themes using the button in the header.
## Deployment

### Netlify (Frontend)
The project includes a `netlify.toml` for easy deployment.
1.  Connect your repository to Netlify.
2.  It should automatically detect the settings from `netlify.toml`:
    - **Base directory**: `client`
    - **Build command**: `npm install && npm run build`
    - **Publish directory**: `dist`
3.  **Environment Variables**:
    - Set `VITE_API_URL` to the URL of your deployed backend (e.g., `https://your-backend.onrender.com`).

### Backend Deployment
The backend is a standard Node.js/Express app. You can deploy it to services like **Render**, **Railway**, or **Heroku**.
1.  Deploy the `server` directory.
2.  Ensure the `data/restaurants.json` file is included.
3.  **Note**: Since the data is in a JSON file, changes made by the GitHub Action will only be reflected if the backend redeploys or pulls the latest changes.
