# Women's Care Clinic — Express + MongoDB

Your clinic website, now wired to your MongoDB database instead of the browser.

## Folder layout

```
my-server/
├── server.js            ← Express server (serves the site + API)
├── .env                 ← your secrets (you create this)
├── .env.example         ← template to copy
├── .gitignore
├── models/
│   ├── Appointment.js   ← appointment schema
│   └── Contact.js       ← contact-message schema
├── routes/
│   └── api.js           ← all API endpoints
└── public/
    └── index.html       ← the website (now uses fetch, not localStorage)
```

## Setup (one time)

1. Put these files inside your `Desktop/my-server` folder.

2. Install the two packages this uses (you already have express + mongoose):
   ```
   npm install mongoose dotenv
   ```

3. Create a file named `.env` (copy `.env.example`) and fill in:
   ```
   PORT=3000
   MONGODB_URI=<your full MongoDB connection string with the real password>
   ADMIN_PASSWORD=<the password you want for the admin dashboard>
   ```

## Run

```
node server.js
```

Then open http://localhost:3000

## How it works

- **Book Appointment** form  → `POST /api/appointments` → saved to MongoDB
- **Contact** form           → `POST /api/contact`      → saved to MongoDB
- **Admin** page (top nav)    → log in with `ADMIN_PASSWORD`
  - lists every appointment from the database (newest first)
  - delete one / delete all / download an HTML report
  - admin actions send the password as an `x-admin-password` header

## A note on security

This admin login is intentionally simple. For a real public deployment you
should add proper authentication (sessions or JWT) and serve over HTTPS, since
the header approach is only meant for local/internal use.
