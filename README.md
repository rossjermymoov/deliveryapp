# Kalsi Plastics - UK Fleet & Delivery Management Platform

A prototype logistics platform built for **Kalsi Plastics** to manage multi-depot last-mile deliveries across **22 UK Depots**, ingest label creation webhooks from external API providers (highlighting **B&Q, Shopify, and eBay** origin channels), optimize delivery routes factoring in **dwell times**, and empower drivers with a **mobile-first delivery app** with Proof of Delivery (POD) signature & photo capture.

---

## 🌟 Key Features

### 1. Inbound Webhook Ingestion & Channel Badging
- **Endpoint**: `POST /api/webhooks/shipment`
- Ingests shipment events from external label generation APIs.
- Automatically clusters and assigns incoming orders to the nearest of Kalsi's 22 UK Depots.
- Badges orders with their sales channel origin:
  - 🟠 **B&Q Marketplace**
  - 🟢 **Shopify Direct**
  - 🔴 **eBay Store**

### 2. Depot Bucket & Route Optimizer
- **22 Pre-Configured UK Depots**: Birmingham, Manchester, Leeds, Bristol, London East/West, Southampton, Glasgow, Cardiff, etc.
- **Route Engine**: Uses Traveling Salesperson (TSP) optimization.
- **Dwell Time per Stop**: Allows depot dispatchers to configure unloading dwell times (e.g. 15–20 mins for long/bulky plastic fascia boards).

### 3. Driver Mobile Application (Web & Flutter)
- **Manifest View**: Sequential list of delivery stops.
- **1-Tap Navigation**: Direct link launching **Google Maps** driving directions.
- **Proof of Delivery (POD)**:
  - ✍️ Touch/Stylus customer signature pad.
  - 📷 Camera capture for photographic proof of bulky goods delivered on site.
  - 📍 GPS geolocation presence stamp.

---

## 📁 Repository Structure

```
├── client/              # React + Vite + Tailwind CSS Web Management Portal & Driver Web App
├── server/              # Node.js + Express + Prisma + SQLite Backend & Webhook Ingestion
└── flutter_driver_app/  # Flutter iOS & Android Cross-Platform Mobile Driver App
```

---

## 🚀 Quickstart Guide

### 1. Run the Web App (Depot Admin & Driver Mobile)
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run the Backend API Server
```bash
cd server
npm install
npx prisma db push --schema=prisma/schema.prisma
npx tsx src/seed.ts
npm start
```
Server runs on [http://localhost:4000](http://localhost:4000).

### 3. Run the Flutter Mobile App (iOS / Android)
```bash
cd flutter_driver_app
flutter pub get
flutter run
```
