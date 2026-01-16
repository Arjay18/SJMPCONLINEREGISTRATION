# Online Member Registration System

A complete mobile-friendly registration system designed for on-site events, optimized for tablets and Android phones with Bluetooth thermal printer support.

## Features

- ✅ Excel master list import (passbook_no, full_name)
- ✅ Real-time validation and duplicate prevention
- ✅ Mobile-responsive design (works on phones, tablets, desktop)
- ✅ Automatic coupon printing via Bluetooth POS printer
- ✅ Admin dashboard with statistics
- ✅ Export registered members to Excel
- ✅ Multi-device support with centralized database

## Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- CSS3 (Mobile-first responsive design)

**Backend:**
- Node.js & Express
- PostgreSQL database
- XLSX library for Excel handling
- Multer for file uploads

**Printing:**
- ESC/POS thermal printer support
- Web Bluetooth API integration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone/Download the Project

```bash
cd "Online Registration"
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `.env` file with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=registration_db
NODE_ENV=development
```

### 3. Setup Database

```bash
# Create database (using psql or pgAdmin)
psql -U postgres
CREATE DATABASE registration_db;
\q

# Initialize database schema
npm run init-db
```

### 4. Start Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `.env` file if backend URL is different:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start Frontend

```bash
npm start
```

Frontend will open at `http://localhost:3000`

## Usage

### Admin Dashboard

1. Navigate to **Admin** tab
2. **Upload Members:**
   - Prepare Excel file with columns: `passbook_no`, `full_name`
   - Click "Upload Members" tab
   - Select and upload your Excel file
   - System will import/update member records

3. **View Statistics:**
   - Total members in master list
   - Total registered members
   - Today's registrations
   - Pending registrations

4. **View Master List:**
   - See all members imported from Excel

5. **View Registrations:**
   - See all registered members with timestamps
   - Export to Excel for reporting

### Member Registration

1. Navigate to **Register** tab
2. Enter passbook number
3. Click **Validate**
4. If valid and not registered:
   - Member details will show
   - Click **Register**
   - Coupon will automatically print (if printer connected)
   - Registration successful message displays

5. Possible responses:
   - ✅ **Valid** → Proceed to register
   - ⚠️ **Already Registered** → Cannot register again
   - ❌ **Invalid Passbook Number** → Not in master list

### Bluetooth Printer Setup

**For Desktop (Chrome/Edge):**
1. Pair Bluetooth printer with computer via Windows Settings
2. When registering, browser will prompt to select printer
3. Grant Bluetooth permissions

**For Android:**
1. Enable Bluetooth on device
2. Pair thermal printer in Android Bluetooth settings
3. Open app in Chrome browser (must use HTTPS in production)
4. Grant Bluetooth permissions when prompted

**Printer Requirements:**
- ESC/POS compatible thermal printer (58mm or 80mm)
- Bluetooth connectivity
- Common brands: Goojprt, Xprinter, Zjiang, Sunmi

**Note:** iOS Safari does not support Web Bluetooth. For iOS, you need:
- Native app wrapper (React Native, Capacitor)
- Or dedicated printing service

## API Endpoints

### Registration Endpoints

```
POST   /api/registration/validate
       Body: { passbook_no }
       
POST   /api/registration/register
       Body: { passbook_no, device_info }
       
GET    /api/registration/status/:passbook_no
```

### Admin Endpoints

```
POST   /api/admin/upload-members
       Form-data: file (Excel)
       
GET    /api/admin/registrations
       
GET    /api/admin/stats
       
GET    /api/admin/export-registrations
       Returns: Excel file
       
GET    /api/admin/members
```

## Database Schema

### Members Table
```sql
id              SERIAL PRIMARY KEY
passbook_no     VARCHAR(50) UNIQUE NOT NULL
full_name       VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Registrations Table
```sql
id                  SERIAL PRIMARY KEY
member_id           INTEGER REFERENCES members(id)
passbook_no         VARCHAR(50) UNIQUE NOT NULL
full_name           VARCHAR(255) NOT NULL
registration_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
device_info         VARCHAR(255)
```

## Excel File Format

Your master list Excel file must have these columns:

| passbook_no | full_name      |
|-------------|----------------|
| 12345       | John Doe       |
| 67890       | Jane Smith     |
| 11223       | Bob Johnson    |

- Column names must be exactly: `passbook_no` and `full_name`
- Passbook numbers can be text or numeric
- Both columns are required

## Deployment

### Production Backend

1. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Configure production database credentials
   - Use environment variables (not .env file)

2. **Deploy to:**
   - Heroku: `heroku create && git push heroku main`
   - DigitalOcean App Platform
   - AWS EC2 / Elastic Beanstalk
   - Railway, Render, or Fly.io

3. **Database:**
   - Use managed PostgreSQL (Heroku Postgres, AWS RDS, etc.)
   - Run migrations after deployment

### Production Frontend

1. **Build for production:**
```bash
cd frontend
npm run build
```

2. **Update API URL:**
   - Set `REACT_APP_API_URL` to your backend URL
   - Example: `https://your-api.herokuapp.com/api`

3. **Deploy to:**
   - Netlify: Drag & drop `build` folder
   - Vercel: `vercel deploy`
   - GitHub Pages
   - Firebase Hosting
   - Any static hosting service

4. **HTTPS Required:**
   - Web Bluetooth requires HTTPS in production
   - Most hosting providers provide free SSL

### Mobile App Alternative

For better printer support, especially on iOS:

1. **React Native:**
   - Use `react-native-bluetooth-escpos-printer`
   - Full native Bluetooth access

2. **Ionic Capacitor:**
   - Wrap existing React app
   - Use `capacitor-bluetooth-printer` plugin

3. **Cordova:**
   - Use `cordova-plugin-bluetooth-serial`

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE registration_db;`

### CORS Error
- Backend CORS is configured for all origins
- In production, restrict to your frontend domain

### Printer Not Found
- Ensure printer is paired in system Bluetooth settings
- Printer must be ESC/POS compatible
- Check browser Bluetooth permissions
- Use Chrome, Edge, or Opera (not Firefox or Safari on desktop)

### Mobile Access
- Use local network IP address (e.g., `http://192.168.1.10:3000`)
- Or deploy to HTTPS server for full Web Bluetooth support

### Excel Upload Fails
- Verify column names: `passbook_no` and `full_name`
- Check file format (.xlsx or .xls)
- Ensure no empty rows between data

## Development

### Project Structure
```
Online Registration/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── routes/
│   │   ├── registration.js      # Registration endpoints
│   │   └── admin.js             # Admin endpoints
│   ├── schema.sql               # Database schema
│   ├── server.js                # Express server
│   ├── initDatabase.js          # DB initialization script
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── RegistrationForm.js
    │   │   ├── RegistrationForm.css
    │   │   ├── AdminDashboard.js
    │   │   └── AdminDashboard.css
    │   ├── services/
    │   │   └── api.js           # API client
    │   ├── utils/
    │   │   └── printer.js       # Bluetooth printer utility
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

### Testing

1. **Test with sample data:**
   - Create Excel file with test members
   - Upload via admin dashboard
   - Test registration flow

2. **Test printer:**
   - Pair Bluetooth printer
   - Register a test member
   - Verify coupon prints correctly

3. **Test multi-device:**
   - Open app on multiple devices
   - Verify duplicate prevention works
   - Check registration synchronization

## License

MIT License - Feel free to use for your events!

## Support

For issues or questions:
1. Check troubleshooting section above
2. Verify all prerequisites are installed
3. Check browser console for errors
4. Ensure database is properly initialized

## Credits

Built with React, Node.js, Express, and PostgreSQL.
ESC/POS printing via Web Bluetooth API.
