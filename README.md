# User Behavior Analytics Tracker & Dashboard

A lightweight, real-time user behavior analytics tracking system built as a Full Stack Candidate Assessment task for **Ritz Media World**.

The system tracks page visits, time spent on each page, navigation paths, entry sources, and real-time active users. It then displays this data on an interactive dashboard using modern visualizations.

---

## 🏗️ System Architecture & Structure

The project is structured into three clean, separate services to maintain scalability and clean design boundaries:

```
data-analytic/
├── backend/              ← Node.js + Express MVC Backend (Port 5000)
├── frontend/
│   └── vite-project/     ← Main Website Frontend (Port 5173)
└── dashborad-frontend/
    └── dashborad/        ← Analytics Dashboard Frontend (Port 5200)
```

---

## ⚡ Quick Start Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB Atlas** (cloud database) or local MongoDB instance.

---

### Step 1: Configure Backend Environment
Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://data-analytic:ankur%404011@cluster0.bonxmzx.mongodb.net/?appName=Cluster0
```

---

### Step 2: Install Dependencies & Run

Open **three separate terminals** to run all services concurrently:

#### Terminal 1: Run the Backend API Server
```bash
cd backend
npm install
npm run dev
```
* **Server runs at:** `http://localhost:5000`

#### Terminal 2: Run the Main Website
```bash
cd frontend/vite-project
npm install
npm run dev
```
* **Website runs at:** `http://localhost:5173`

#### Terminal 3: Run the Analytics Dashboard
```bash
cd dashborad-frontend/dashborad
npm install
npm run dev
```
* **Dashboard runs at:** `http://localhost:5200`

---

## 🛠️ Implementation Details & Workflow

### 1. Frontend Tracking Logic (`useTracker.js`)
* Tracks page views and route transitions seamlessly using React Router.
* Dynamically determines traffic **Entry Source** (Direct, Referral, Campaign, Internal).
* Calculates exactly how long the user stays on a page by measuring current time against entry timestamp.
* Uses `navigator.sendBeacon()` on the window `beforeunload` event to reliably track the exit page and time even during abrupt window/tab closes.

### 2. Backend MVC API Design (`controllers/` & `routes/`)
* **`POST /api/analytics/event`**: Tracks a page entry and saves the elapsed duration of the previous page visit.
* **`POST /api/analytics/session/end`**: Concludes the user's session and logs overall session length.
* **`GET /api/dashboard/overview`**: Compiles total sessions, page views, and average visit durations.
* **`GET /api/dashboard/page-time`**: Details average time spent on each route.
* **`GET /api/dashboard/most-visited`**: Retrieves page routes sorted by visit count.
* **`GET /api/dashboard/entry-sources`**: Counts entry sources grouped by type.
* **`GET /api/dashboard/navigation-flow`**: Maps navigation transitions for page-flow charts.

### 3. Real-Time Connections (Socket.IO)
* Integrates WebSockets in the Express backend to register active sockets on connection.
* Automatically broadcasts live client updates to the dashboard active users panel.

---

## ⚖️ Key Assumptions & Trade-offs

1. **In-Memory Active User Counting**: Active socket connections are tracked in Node memory. This is highly performant and keeps it simple for assessment, but in a production environment with multiple server instances, a Redis adapter should be utilized.
2. **Session Persistence**: Sessions are tracked via a unique `sessionId` stored in browser `localStorage`. This ensures page refreshes are treated as part of the same continuous session.
3. **No Auth Requirements**: As per the task description, the endpoints are open. In a production system, dashboard endpoints would be guarded by session tokens or auth middleware.
