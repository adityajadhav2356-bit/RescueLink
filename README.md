
# RescueLink 🆘🔗

RescueLink is a real-time worker safety and monitoring platform designed for hazardous and industrial environments (e.g., mining, construction, and remote field sites). It provides an integrated ecosystem that connects field workers with their supervisors, featuring live vital tracking, precise geolocation, environmental monitoring, and instant emergency SOS protocols.

## 🚀 Features

*   **Real-time Vital & Environment Monitoring**: Live tracking of environmental temperature, air quality, and device battery.
*   **Live Geolocation Mapping**: Interactive, real-time map displaying the exact locations and statuses of all field operators.
*   **Instant SOS / Emergency Alerts**: Workers can instantly trigger critical alerts with context directly to supervisors.
*   **Supervisor Dashboard**: A comprehensive command center view to monitor all active personnel, resolve alerts, and manage deployments.
*   **Worker Dashboard**: A mobile-optimized, accessible interface for workers to track their own diagnostics and trigger emergencies.
*   **Role-Based Access Control**: Distinct secured views and functionalities tailored for 'workers' versus 'supervisors'.
*   **Internationalization**: Multi-language support to ensure accessibility in diverse team environments.

## 💻 Tech Stack

### Frontend (`/client`)
*   **Framework**: React 19 powered by Vite
*   **Styling**: Tailwind CSS v4, Framer Motion (Animations), clsx & tailwind-merge
*   **Mapping & Data**: React Leaflet (Maps), Recharts (Data visualization)
*   **Real-time Communication**: Socket.io-client
*   **Internationalization**: i18next & react-i18next
*   **Icons**: Lucide React

### Backend (`/server`)
*   **Runtime/Framework**: Node.js, Express.js
*   **Real-time Communication**: Socket.io (WebSockets)
*   **Database**: MongoDB (via Mongoose)
*   **Utilities**: CORS, dotenv

## 🛠️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Locally or Atlas URI)

### 1. Server Setup
Navigate into the `server` directory, install dependencies, and start the backend:
```bash
cd server
npm install
# Start the server (default runs on port 5000)
npm start
```
*(Note: A MongoDB connection is mocked in the default code for demo purposes; uncomment the Mongoose connection string in `server.js` for production usage.)*

### 2. Client Setup
Open a new terminal, navigate into the `client` directory, install dependencies, and start the Vite development server:
```bash
cd client
npm install
# Start the Vite development server
npm run dev
```

The frontend application will start and provide a local host URL (typically `http://localhost:5173/`).

## 🗺️ Project Structure

```text
RescueLink/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # View routes (Landing, Login, Dashboards)
│   │   ├── i18n.js         # Internationalization config
│   │   └── App.jsx         # App routing and layout
│   └── package.json        # Frontend dependencies
└── server/                 # Node/Express backend
    ├── controllers/        # Route controllers
    ├── models/             # Mongoose DB schemas
    ├── routes/             # API routes
    ├── server.js           # Main Entry config & Socket.io handlers
    └── package.json        # Backend dependencies
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## 📄 License
This project is licensed under the ISC License.

