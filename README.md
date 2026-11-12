# Potla EventSpaces — Frontend Client

React and Tailwind CSS client application for the Potla EventSpaces Function Hall Booking Platform, enabling customers, venue owners, and administrators to discover, book, and manage event spaces.

---

## 1. Technology Stack

- **Core Framework**: React 18, Vite
- **Styling & UI**: Tailwind CSS (v4), Lucide React Icons
- **Routing**: React Router 6
- **API Client**: Axios (configured with JWT interceptors and base API routing)

---

## 2. Key Features & Role Views

- **Customer Portal**: Search and filter banquet halls, convention centers, and lawns; view real-time availability calendars; complete checkout flows; manage bookings, reviews, and favorites.
- **Venue Owner Dashboard**: Manage hall listings, pricing tiers, availability blocks, payouts, and incoming booking requests.
- **Admin Console**: Platform-wide moderation, dispute resolution, user management, and payout approvals.

---

## 3. Quickstart & Local Development

### Prerequisites
- Node.js 20+
- npm or yarn
- Running instance of [`fhbp-backend`](https://github.com/<your-username>/fhbp-backend)

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000/api/v1

# 3. Start development server
npm run dev -- --host 0.0.0.0 --port 5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 4. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the Django REST API | `http://localhost:8000/api/v1` |

---
*Looking for the Django REST API & Docker setup? Check the [`fhbp-backend`](https://github.com/wasimakramshaikdev/fhbp-backend) repository.*
