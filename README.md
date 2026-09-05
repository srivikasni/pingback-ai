# PingBack AI — Screenshot-to-Action Opportunity Tracker

A cloud-based web app for students. Upload a screenshot of an internship,
workshop, hackathon, scholarship, assignment, or event post; OCR extracts
the text; you verify/edit the details; it's saved as a trackable action
item with deadline, reminder, priority, and status.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| OCR | Tesseract.js (runs in the browser) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Charts | Chart.js |
| API testing | Postman |
| Backend hosting | Render |
| Frontend hosting | Vercel |

## Project structure

```
pingback-ai/
  backend/
    models/Opportunity.js   # Mongoose schema (database design)
    routes/opportunities.js # REST API + CRUD routes
    server.js                # Express app entry point
    package.json
    .env.example
  frontend/
    index.html
    style.css
    script.js
    config.js                # set your backend URL here
  README.md
```

## 1. Run the backend locally

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste your own MongoDB Atlas connection string
(see below for how to get one), then:

```bash
npm start
```

The API runs at `http://localhost:5000/api/opportunities`.

### Get a MongoDB Atlas connection string

1. Sign up free at https://www.mongodb.com/atlas
2. Create a free M0 cluster.
3. Database Access → add a database user (username + password).
4. Network Access → Add IP Address → Allow Access From Anywhere (`0.0.0.0/0`).
5. Connect → Drivers → copy the connection string and paste it into `.env` as `MONGO_URI`.

## 2. Run the frontend locally

Just open `frontend/index.html` in a browser, or serve it with any static
server (e.g. VS Code Live Server). Make sure `frontend/config.js` points
at `http://localhost:5000/api/opportunities` while testing locally.

## 3. Test the API with Postman

Import these requests into Postman (or create a collection):

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/opportunities` | Create an opportunity |
| GET | `/api/opportunities` | List all (supports `?category=`, `?status=`, `?search=`) |
| GET | `/api/opportunities/:id` | Get one |
| PUT | `/api/opportunities/:id` | Update one |
| DELETE | `/api/opportunities/:id` | Delete one |
| GET | `/api/opportunities/meta/stats` | Dashboard stats (totals, by category, by status) |

Export your Postman collection as JSON and include it in your submission
as the API documentation deliverable.

## 4. Deploy to the cloud

### Backend on Render

1. Push this project to GitHub.
2. On https://render.com → New → Web Service → connect your repo.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add an environment variable `MONGO_URI` with your Atlas connection string.
7. Deploy. You'll get a URL like `https://pingback-backend.onrender.com`.

### Frontend on Vercel

1. On https://vercel.com → New Project → import the same repo.
2. Root directory: `frontend`
3. Before deploying (or after, then redeploy), edit `frontend/config.js`:
   ```js
   const API_BASE_URL = 'https://pingback-backend.onrender.com/api/opportunities';
   ```
4. Deploy. You'll get a URL like `https://pingback-ai.vercel.app`.

## 5. What satisfies each rubric item

- **Problem selection & architecture** — see project description above and the architecture diagram in your report.
- **Application development** — `frontend/` (upload, OCR, form, dashboard) + `backend/` (Express app).
- **Database & REST API integration** — `backend/models/Opportunity.js` (schema) and `backend/routes/opportunities.js` (REST endpoints) connected via Mongoose to MongoDB Atlas.
- **Cloud deployment** — Render (backend) + Vercel (frontend) + MongoDB Atlas (database), all cloud-hosted.
- **Documentation & demonstration** — this README, your Postman collection, and a screen-recorded demo of uploading a screenshot through to saving/editing/deleting a record.

## Notes

- Tesseract.js runs OCR entirely in the browser — no server call is made for OCR itself. If your evaluator specifically wants a cloud OCR *API* in the request/response chain, swap this for a server-side call to a cloud OCR service (e.g. Google Vision, AWS Textract) inside a new backend route.
- Never commit your real `.env` file — only `.env.example` should go to GitHub.
