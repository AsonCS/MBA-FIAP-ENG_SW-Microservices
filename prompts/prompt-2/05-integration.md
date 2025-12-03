# Implementation Guide: Integration & Verification

**Project:** `micro-feed-platform`
**Scope:** Connecting all services and final testing.

## Step 1: Docker Compose Update
* **Action:** Update `docker-compose.yaml` to include `backend`, `feed`, and `frontend`.
* **Configuration:**
    * Ensure `backend` depends on `db` and `kafka`.
    * Ensure `feed` depends on `kafka`.
    * Map ports:
        * Backend: 3000:3000
        * Feed: 8080:8080
        * Frontend: 3001:3000 (or 80:3000)

## Step 2: Create Nginx server configuration
* **Action:** Create Nginx configuration to allow CORS from the Frontend URL.
* **Action:** Update `feed` (Ktor) to allow iframe embedding (check X-Frame-Options headers).

## Step 3: End-to-End Test Script
* **Action:** Create a manual verification script or automated test `test/e2e-full.sh`.
* **Sequence:**
    1.  Register user (Backend).
    2.  Login user (Backend).
    3.  Post message to "autos" (Backend -> Kafka).
    4.  Wait 2 seconds (Eventual consistency).
    5.  Fetch "autos" HTML (Feed).
    6.  Assert HTML contains the message.

## Step 4: Run Production Build
* **Action:** `docker-compose up --build`.
* **Validation:** Open browser at Frontend URL. Perform full user flow.

## Step 5: Final Documentation
* **Action:** Update `README.md` with:
    * Prerequisites (Docker).
    * Startup command.
    * List of endpoints.
    * Architecture diagram reference.
