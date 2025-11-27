# Implementation Guide: Frontend Service (NextJS)

**Project:** `micro-feed-platform`
**Service:** `frontend`
**Tech Stack:** NextJS 14+, Tailwind CSS, Axios.

## Step 1: Initialization
* **Action:** Create NextJS app in `./frontend` (`npx create-next-app`).
* **Config:** Select TypeScript, Tailwind, App Router.
* **File:** `.env.local` -> `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_FEED_URL`.

## Step 2: API Services
* **File:** `src/services/api.ts`.
* **Logic:**
    * Instance for Backend (handling Auth headers).
    * Functions: `login`, `register`, `postMessage(subject, text)`.

## Step 3: Auth Components & Pages
* **File:** `src/components/AuthForm.tsx`.
* **Page:** `src/app/login/page.tsx`.
* **Page:** `src/app/register/page.tsx`.
* **Logic:** Handle form submission, error states, and token storage (Cookie/LocalStorage).
* **Test:** Unit test form validation.

## Step 4: Subject Selector Component
* **File:** `src/components/SubjectSelector.tsx`.
* **UI:** A row of buttons mapped from an array of subjects.
* **Props:** `activeSubject`, `onSelect`.

## Step 5: Feed Frame Component
* **File:** `src/components/FeedFrame.tsx`.
* **UI:** An `<iframe>` element.
* **Logic:**
    * Prop `subject`.
    * `src` attribute points to `feed` service URL + subject.
    * Add a "Refresh" button that forces iframe reload (e.g., appending `?t=timestamp` to src).

## Step 6: Home Page (Dashboard)
* **Page:** `src/app/page.tsx`.
* **State:** `selectedSubject` (default: 'sports').
* **Layout:**
    * Header (Logout).
    * SubjectSelector.
    * FeedFrame (Left/Top).
    * Compose Message Input (Right/Bottom).
* **Logic:** On "Send Message", call API. Do *not* auto-reload iframe. Show toast notification "Message sent".

## Step 7: UI Tests
* **Action:** Install Cypress or Playwright.
* **Test:** End-to-End flow: Login -> Select 'Sports' -> Type Message -> Click Post -> Click Refresh -> Verify Message appears in iframe (requires full stack running).

## Step 8: Docker Production
* **File:** `frontend/Dockerfile`.
* **Stages:**
    1.  `deps`: Install dependencies.
    2.  `builder`: `npm run build`.
    3.  `runner`: Alpine node, copy `.next` and `public`. CMD `npm start`.

## Step 9: CI/CD
* **File:** `.github/workflows/frontend.yml`.
* **Steps:** Checkout -> Install -> Lint -> Build.
