# InvoiceFlow — Freelancer Invoice Generator

A full-stack SaaS tool for Indian freelancers to create GST-compliant PDF invoices, manage clients, track payments, and send invoices via email.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Vanilla CSS (dark-mode design system) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| PDF | Puppeteer |
| Auth | JWT + bcrypt |

## Project Structure

```
├── client/           # React frontend (Vite)
└── server/           # Node.js + Express backend
```

## Quick Start

### 1. Setup MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Copy your connection string
3. Edit `server/.env` and replace the `MONGODB_URI` value

### 2. Start the Backend
```bash
cd server
npm run dev        # starts on http://localhost:5000
```

### 3. Start the Frontend
```bash
cd client
npm run dev        # starts on http://localhost:5173
```

### 4. Open the App
Visit `http://localhost:5173`

## API Endpoints (Phase 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| PUT | /api/auth/profile | Update profile |
| POST | /api/invoices | Create invoice |
| GET | /api/invoices | List invoices |
| GET | /api/invoices/:id | Get invoice |
| PUT | /api/invoices/:id | Update invoice |
| DELETE | /api/invoices/:id | Delete invoice |
| PATCH | /api/invoices/:id/status | Update status |
| GET | /api/invoices/:id/pdf | Download PDF |
| POST | /api/clients | Create client |
| GET | /api/clients | List clients |

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your values:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=a_long_random_secret
```
