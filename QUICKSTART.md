# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Setup Database

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database:
```sql
CREATE DATABASE registration_db;
```

3. Configure backend/.env:
```env
DB_USER=postgres
DB_PASSWORD=your_password
```

4. Initialize database:
```powershell
cd backend
npm run init-db
```

### Step 3: Run the Application

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 4: Upload Member List

1. Open http://localhost:3000
2. Go to **Admin** → **Upload Members**
3. Upload the included `sample_members.csv` (convert to .xlsx first or use your own Excel file)

### Step 5: Test Registration

1. Go to **Register** tab
2. Enter passbook number: `1001`
3. Click **Validate** → **Register**
4. Done! ✅

## 📱 Bluetooth Printer Setup

1. Pair your ESC/POS thermal printer via Bluetooth settings
2. When registering, browser will prompt to select printer
3. Grant permissions and print!

**Supported Browsers:** Chrome, Edge, Opera (Android/Desktop)

## 🎯 Key Features

- ✅ Validate passbook numbers
- ✅ Prevent duplicate registrations
- ✅ Auto-print coupons
- ✅ View registration statistics
- ✅ Export to Excel

## 📞 Need Help?

Check the main README.md for detailed instructions and troubleshooting.
