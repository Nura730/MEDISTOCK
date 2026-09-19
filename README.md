# MediStock 🏥
> **"Find essential medicines. Know before you go."**  
> *Track 3 — Public Welfare | SC-10: Medicine Availability in Government Pharmacies*

MediStock is a centralized, real-time medicine availability and reservation platform designed to eliminate the frustration of visiting multiple government hospitals and dispensaries searching for critical medicines. Powered by the MERN stack with Socket.IO real-time synchronization, geolocation distance calculations, and an administrative shortage command center.

---

## 🌟 Key Features

### 1. Citizen Portal
- **Smart Medicine Search**: Real-time auto-complete search by brand name, generic formulation, or therapeutic category (Antibiotic, Antidiabetic, Analgesic, Cardiovascular, etc.).
- **Proximity-Based Availability**: Instant distance calculation using the Haversine formula based on citizen geolocation.
- **Stock Status Indicators**: Visual availability tags:
  - 🟢 **Available** (> 20 units)
  - 🟡 **Low Stock** (1–20 units)
  - 🔴 **Out of Stock** (0 units)
- **Interactive Map & Route Guidance**: Integrated Google Maps / OpenStreetMap directions with operating hours, contact numbers, and pharmacy types (DH, CHC, PHC, Jan Aushadhi).
- **Digital Medicine Hold / Token Reservation**: 
  - Citizens can place a medicine on temporary 2-hour hold.
  - Generates a unique digital token & verification QR code for pharmacy pickup.
  - Auto-expires if not claimed, preventing hoarding.

### 2. Pharmacy Staff Portal
- **Live Inventory Management**: Rapid quantity adjustments and one-click stock status toggles (In-Stock / Low Stock / Out of Stock).
- **Token Verification & Fulfillment**: Instant verification and fulfillment of citizen digital tokens by Token ID.
- **Batch Stock Intake**: Log incoming medicine consignments, batch numbers, and expiry dates.
- **Low Stock Alerts**: Highlighted visual warnings for items nearing critical thresholds.

### 3. State & District Admin Command Center
- **District Shortage Heatmap & Analytics**: Live monitoring of supply trends, medicine shortages across all registered pharmacies.
- **Critical Shortage Alerts**: Automated red-flag alerts when essential life-saving drugs drop below minimum thresholds across a district.
- **Real-Time Audit Trail**: Activity log tracking updates made by pharmacy staff.
- **Emergency Supply Reallocation**: Broadcast urgent restock requests across government distribution networks.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Socket.IO Client, HTML5 Geolocation API, Modern Glassmorphism & Responsive CSS
- **Backend**: Node.js, Express.js, Socket.IO (WebSockets)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (`citizen`, `staff`, `admin`)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nura730/MEDISTOCK.git
cd MEDISTOCK
```

---

### Step 2: Configure Environment Variables

1. Navigate to the `server/` directory:
```bash
cd server
```
2. Check or update `.env` (a `.env.example` is provided):
```env
MONGO_URI=mongodb://localhost:27017/medistock
JWT_SECRET=medistock_jwt_secret_hackathon_2026
PORT=5000
NODE_ENV=development
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string).*

---

### Step 3: Install Dependencies

1. **Install backend dependencies:**
```bash
cd server
npm install
```

2. **Install frontend dependencies:**
```bash
cd ../client
npm install
```

---

### Step 4: Seed Sample Data
The seed script populates 15+ essential government medicines, 6 realistic government pharmacies across Chennai/Tamil Nadu (District Hospitals, CHCs, Jan Aushadhi Kendras), realistic inventory batches, and sample demo accounts.

Run from the `server/` folder:
```bash
cd ../server
npm run seed
```

---

### Step 5: Run the Application

Open two terminal windows:

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm start
# Server runs at http://localhost:5000
```

#### Terminal 2 — Start the Frontend Development Server:
```bash
cd client
npm run dev
# Vite runs at http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 👥 Demo Accounts & Credentials

Use these pre-configured credentials to test all roles and flows:

| Role | Email | Password | Assigned Location / Scope |
| :--- | :--- | :--- | :--- |
| **Pharmacy Staff** | `staff.gh@medistock.gov.in` | `Staff@123` | Rajiv Gandhi Government General Hospital (RGGGH) |
| **Pharmacy Staff** | `staff.chromepet@medistock.gov.in` | `Staff@123` | Chromepet Government Hospital |
| **State Admin** | `admin.state@medistock.gov.in` | `Admin@123` | State Health Mission Command Center |
| **Citizen** | *(Self-registration or direct browsing without login)* | — | Public Access |

---

## 🧪 Step-by-Step Testing & Evaluation Guide

### 1. Test Citizen Medicine Search & Discovery
1. Go to `http://localhost:5173`.
2. Type **"Paracetamol"**, **"Metformin"**, **"Amoxicillin"**, or **"Insulin"** into the search bar.
3. Observe instant search results showing:
   - Generic name vs Brand name
   - Category tags
   - Available stock count and status badges (Available / Low Stock / Out of Stock).
4. Allow browser geolocation when prompted (or use default location) to see distances calculated dynamically in kilometers.
5. Click on any medicine card to view detailed pharmacy breakdown, operating hours, contact numbers, and pharmacy types.

### 2. Test Real-Time Stock Updates (Dual Window Demo)
1. Open **Browser Window A** in Incognito or normal window at `http://localhost:5173` on the Citizen Search page for **"Paracetamol 500mg"**.
2. Open **Browser Window B** at `http://localhost:5173/login`.
3. Log in as Pharmacy Staff (`staff.gh@medistock.gov.in` / `Staff@123`).
4. Go to the Staff Inventory Dashboard.
5. Find **"Paracetamol 500mg"** and change the stock status or update the quantity (e.g. reduce to 5 or change to Out of Stock).
6. Notice that **Window A updates instantly** via Socket.IO without refreshing the page!

### 3. Test Citizen Medicine Reservation & Token
1. In the Citizen view, click **"Reserve Medicine"** or **"Get Hold Token"** on an available item.
2. Enter citizen name and mobile number.
3. Receive a digital verification token with a countdown timer (2 hours) and QR code.
4. Switch to the Staff Portal, enter the Token ID into the **Token Verification** box, and click **Fulfill**.
5. The token is marked as fulfilled, and inventory updates automatically.

### 4. Test Administrator Shortage Dashboard
1. Log out or open a new window at `http://localhost:5173/login`.
2. Sign in as Admin (`admin.state@medistock.gov.in` / `Admin@123`).
3. View the **State Shortage Heatmap**, real-time shortage metrics, pharmacy compliance rates, and system-wide inventory audit trails.

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medicines` | Search & filter medicines | Public |
| `GET` | `/api/medicines/:id` | Get medicine details & stock across pharmacies | Public |
| `GET` | `/api/pharmacies` | List pharmacies with distance filter (`lat`, `lng`, `radius`) | Public |
| `POST` | `/api/auth/login` | Authenticate staff/admin | Public |
| `GET` | `/api/inventory/my-pharmacy` | Get stock for logged-in pharmacy | Staff / Admin |
| `PUT` | `/api/inventory/:id` | Update stock quantity and status (emits Socket event) | Staff / Admin |
| `POST` | `/api/reservations` | Create temporary medicine reservation token | Public |
| `PUT` | `/api/reservations/:id/fulfill`| Fulfill reservation token | Staff |
| `GET` | `/api/admin/stats` | District shortage stats & health metrics | Admin |

---

## 📜 License
Developed for educational, hackathon, and public welfare demonstration purposes under the MIT License.
