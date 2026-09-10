# Yalamber Mini Mart

**Your Everyday Store.**

Neighborhood mini mart in New Baneshwor — React frontend, Express API, PostgreSQL, and cookie auth.

```bash
# PostgreSQL 17, database `yalamber`
sudo pg_ctlcluster 17 main start

cd server && npm install
cd .. && npm install
cp server/.env.example server/.env   # then set JWT_SECRET, DATABASE_URL, ADMIN_PASSWORD
npm run build
npm start
```

Open `http://localhost:5173`. API is at `/api`.

Auth uses an **httpOnly** cookie (`ym_session`). Passwords are bcrypt-hashed. Guests can still shop with a local bag; after sign-in the bag merges onto the account.
