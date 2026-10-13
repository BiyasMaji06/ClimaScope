# ClimaScope – Weather Dashboard

ClimaScope is a weather dashboard web application that provides current weather conditions, hourly temperature charts, and a 7-day forecast for multiple cities. Users can explore weather information without creating an account, manage their favourite cities, and optionally sign up or log in to save their cities to a database.

## Features

- **Weather Dashboard:** View current weather conditions, temperature, humidity, wind speed, and precipitation.
- **Hourly Temperature Chart:** Visualise temperature changes throughout the next 24 hours.
- **7-Day Forecast:** View daily minimum and maximum temperatures, weather conditions, and other forecast details.
- **Weather Advisory:** Display application-generated guidance based on weather conditions.
- **City Search:** Search for cities and add them to your saved list.
- **Manage Cities:** Add and remove cities without requiring an account.
- **Guest Mode:** Access the dashboard and manage cities without signing up. Guest preferences are stored in browser local storage.
- **User Authentication:** Create an account and log in to access account-based features.
- **MongoDB Integration:** Store user accounts and saved cities.
- **Responsive Interface:** Use the dashboard on desktop and mobile devices.

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Recharts
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST API
- MongoDB
- bcrypt for password hashing
- JSON Web Tokens (JWT), if configured in the backend

### Weather Data
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## Project Structure

```text
WP/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...backend routes and configuration
│
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ManageCities.jsx
│   │   ├── SignUp.jsx
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

*Note: The backend structure may vary depending on the route and configuration files in your project.*

## Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or MongoDB Atlas
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd WP
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository URL.

### 2. Install Frontend Dependencies

From the project root directory, run:

```bash
npm install
npm install react-router-dom recharts
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create or update `backend/.env` with the variables required by your backend.

For example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use the exact variable names expected by your backend code. Replace the example values with your own configuration.

**Important:** Never commit your `.env` file, database credentials, or authentication secrets to GitHub.

### 5. Start the Backend

From the `backend` directory, run the command supported by your `package.json`, for example:

```bash
node server.js
```

The backend should be available at `http://localhost:5000`, assuming port 5000 is configured.

### 6. Start the Frontend

Open a second terminal in the project root directory:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

Keep both the backend and frontend running while using the application.

## Application Pages

| Page | Description |
|---|---|
| Dashboard | Displays current weather, hourly temperature charts, advisories, and a 7-day forecast. |
| Manage Cities | Allows users to search for cities and add or remove saved locations. |
| Sign Up | Allows new users to register. |
| Log In | Allows registered users to authenticate. |

## How It Works

1. The React frontend sends requests to the Express backend.
2. The backend retrieves weather information from Open-Meteo.
3. The weather data is returned to the frontend and displayed using React components.
4. The geocoding service helps users search for locations.
5. Guest city preferences are stored in browser local storage.
6. Authenticated users can store their saved cities in MongoDB through the backend.
7. User authentication and password handling are managed by the backend.

## API Integration

ClimaScope uses Open-Meteo to retrieve weather forecasts and geographic coordinates. The Express backend provides the API endpoints consumed by the React application.

Example frontend API base URL:

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

The exact endpoints depend on the backend implementation.

## Security Notes

- Passwords should be hashed before being stored in MongoDB.
- Authentication secrets and database credentials should be stored in environment variables.
- Protected backend routes should validate authentication tokens.
- Guest mode should not require authentication for public weather information.
- Production deployments should use HTTPS and appropriate CORS settings.

## Future Enhancements

- Weather maps and interactive location markers.
- More detailed weather alerts.
- Additional weather metrics and visualisations.
- Unit conversion between Celsius and Fahrenheit.
- Improved error handling and offline states.
- Deployment to a cloud hosting platform.

## Learning Outcomes

This project demonstrates the integration of a React frontend with a Node.js and Express backend, REST API communication, external API integration, database connectivity, user authentication, state management, and responsive interface design.

It also provides practical experience in handling asynchronous requests, displaying dynamic data, and supporting both guest and authenticated user experiences.

## Acknowledgements

- [Open-Meteo](https://open-meteo.com/) for weather and geocoding data.
- [React](https://react.dev/) for the frontend framework.
- [Express](https://expressjs.com/) for backend routing and API development.
- [MongoDB](https://www.mongodb.com/) for database storage.
- [Recharts](https://recharts.org/) for data visualisation.

---

**Project:** ClimaScope – Weather Dashboard  
**Purpose:** Academic project demonstrating frontend, backend, REST API, and database integration.
