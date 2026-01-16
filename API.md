# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Registration Endpoints

### 1. Validate Passbook Number

**POST** `/registration/validate`

Validates if passbook number exists in master list and checks registration status.

**Request Body:**
```json
{
  "passbook_no": "1001"
}
```

**Success Response (Valid & Not Registered):**
```json
{
  "valid": true,
  "member": {
    "id": 1,
    "passbook_no": "1001",
    "full_name": "John Doe",
    "created_at": "2026-01-16T10:00:00Z"
  },
  "message": "Valid passbook number"
}
```

**Response (Already Registered):**
```json
{
  "valid": false,
  "already_registered": true,
  "message": "Already Registered",
  "registration": {
    "passbook_no": "1001",
    "full_name": "John Doe",
    "registration_date": "2026-01-16T11:30:00Z"
  }
}
```

**Error Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid Passbook Number"
}
```

**Status Codes:**
- 200: Success (includes both valid and already registered)
- 404: Invalid passbook number
- 400: Validation error
- 500: Server error

---

### 2. Register Member

**POST** `/registration/register`

Registers a validated member.

**Request Body:**
```json
{
  "passbook_no": "1001",
  "device_info": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration Successful",
  "registration": {
    "passbook_no": "1001",
    "full_name": "John Doe",
    "registration_date": "2026-01-16T11:30:00.123Z"
  }
}
```

**Error Response (Already Registered):**
```json
{
  "success": false,
  "message": "Already Registered",
  "registration": {...}
}
```

**Error Response (Invalid Passbook):**
```json
{
  "success": false,
  "message": "Invalid Passbook Number"
}
```

**Status Codes:**
- 201: Registration successful
- 409: Already registered (conflict)
- 404: Invalid passbook number
- 400: Validation error
- 500: Server error

---

### 3. Check Registration Status

**GET** `/registration/status/:passbook_no`

Checks if a passbook number is registered.

**Example:**
```
GET /registration/status/1001
```

**Success Response (Registered):**
```json
{
  "registered": true,
  "registration": {
    "id": 1,
    "passbook_no": "1001",
    "full_name": "John Doe",
    "registration_date": "2026-01-16T11:30:00Z",
    "device_info": "..."
  }
}
```

**Response (Not Registered):**
```json
{
  "registered": false,
  "message": "Not registered"
}
```

**Status Codes:**
- 200: Success
- 404: Not registered
- 500: Server error

---

## Admin Endpoints

### 4. Upload Members Excel

**POST** `/admin/upload-members`

Upload Excel file with member master list.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Excel file (.xlsx or .xls)

**Excel Format Required:**
| passbook_no | full_name   |
|-------------|-------------|
| 1001        | John Doe    |
| 1002        | Jane Smith  |

**Success Response:**
```json
{
  "success": true,
  "message": "Members uploaded successfully",
  "inserted": 10,
  "skipped": 0,
  "total": 10
}
```

**Error Response:**
```json
{
  "error": "Excel file must have columns: passbook_no, full_name"
}
```

**Status Codes:**
- 200: Success
- 400: Bad request (invalid file, missing columns)
- 500: Server error

**Notes:**
- Duplicate passbook numbers will be updated (upsert)
- Invalid rows are skipped
- Rows without required fields are skipped

---

### 5. Get All Registrations

**GET** `/admin/registrations`

Get list of all registered members.

**Success Response:**
```json
{
  "success": true,
  "count": 5,
  "registrations": [
    {
      "id": 5,
      "passbook_no": "1005",
      "full_name": "Charlie Brown",
      "registration_date": "2026-01-16T14:20:00Z",
      "device_info": "Mozilla/5.0..."
    },
    {
      "id": 4,
      "passbook_no": "1004",
      "full_name": "Alice Williams",
      "registration_date": "2026-01-16T13:15:00Z",
      "device_info": "..."
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Notes:**
- Results ordered by registration_date DESC (newest first)

---

### 6. Get Statistics

**GET** `/admin/stats`

Get registration statistics.

**Success Response:**
```json
{
  "success": true,
  "stats": {
    "total_members": 10,
    "total_registered": 5,
    "today_registered": 3,
    "pending": 5
  }
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Fields:**
- `total_members`: Total members in master list
- `total_registered`: Total registered members (all time)
- `today_registered`: Registrations today (current date)
- `pending`: Members not yet registered

---

### 7. Export Registrations to Excel

**GET** `/admin/export-registrations`

Download all registrations as Excel file.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename=registrations.xlsx`

**Excel Columns:**
- passbook_no
- full_name
- registration_date
- device_info

**Status Codes:**
- 200: Success (file download)
- 500: Server error

**Usage Example (JavaScript):**
```javascript
const response = await axios.get('/admin/export-registrations', {
  responseType: 'blob'
});

const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'registrations.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
```

---

### 8. Get All Members

**GET** `/admin/members`

Get master list of all members.

**Success Response:**
```json
{
  "success": true,
  "count": 10,
  "members": [
    {
      "id": 10,
      "passbook_no": "1010",
      "full_name": "Hannah Montana",
      "created_at": "2026-01-16T10:00:00Z",
      "updated_at": "2026-01-16T10:00:00Z"
    },
    ...
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Notes:**
- Results ordered by created_at DESC (newest first)

---

### 9. Delete All Data (Testing Only)

**DELETE** `/admin/members/all`

⚠️ **WARNING:** Deletes all members and registrations. Use only for testing!

**Success Response:**
```json
{
  "success": true,
  "message": "All data cleared"
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Notes:**
- Deletes all registrations first (due to foreign key)
- Then deletes all members
- Cannot be undone!
- Should be protected/removed in production

---

## Health Check

### GET `/health`

**Success Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Error Responses

All endpoints may return these standard errors:

**400 Bad Request:**
```json
{
  "errors": [
    {
      "msg": "Passbook number is required",
      "param": "passbook_no",
      "location": "body"
    }
  ]
}
```

**500 Server Error:**
```json
{
  "error": "Something went wrong!",
  "message": "Detailed error message (in development mode)"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- `express-rate-limit` middleware
- Recommended: 100 requests per 15 minutes per IP

## Authentication

Currently no authentication. For production, consider:
- JWT tokens for admin endpoints
- API keys for device registration
- Basic auth for admin dashboard

## CORS

CORS is enabled for all origins in development. In production, restrict to your frontend domain:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```
