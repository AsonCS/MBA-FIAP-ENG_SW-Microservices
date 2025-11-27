# Implementation Guide: Infrastructure & Orchestration

**Project:** `micro-feed-platform`
**Scope:** Docker Compose, MySQL, Kafka, and GitHub Actions setup.

## Step 1: Project Initialization
* **Action:** Create the root directory `micro-feed-platform`.
* **Action:** Initialize a git repository.
* **File:** `.gitignore`
    * **Content:** Ignore `node_modules`, `build`, `.env`, `dist`, `.idea`, `.vscode`, `*.log`.

## Step 2: Docker Network & Database Service
* **Action:** Create `docker-compose.yaml` in the root.
* **Definition:**
    * Define a bridge network named `app-network`.
    * Add service `db`:
        * Image: `mysql:8.0`
        * Environment variables from `.env` (MYSQL_ROOT_PASSWORD, MYSQL_DATABASE).
        * Volume: `./docker-data/db:/var/lib/mysql`.
        * Healthcheck: `mysqladmin ping -h localhost`.
* **Validation:** Run `docker-compose up -d db` and verify the container is healthy.

## Step 3: Kafka Service
* **Action:** Update `docker-compose.yaml`.
* **Definition:**
    * Add service `zookeeper` (required for standard Kafka images or use KRaft).
    * Add service `kafka`:
        * Image: `confluentinc/cp-kafka:latest`.
        * Depends on `zookeeper` (or self if KRaft).
        * Environment: Configure `KAFKA_ADVERTISED_LISTENERS`, `KAFKA_AUTO_CREATE_TOPICS_ENABLE=true`.
        * Connect to `app-network`.
* **Action:** Create an initialization script (optional but recommended) or configure environment to auto-create topics: `sports`, `healthy`, `news`, `food`, `autos`.
* **Validation:** Run `docker-compose up -d kafka`. Use a tool like `kcat` or `kafka-ui` to verify topics exist.

## Step 4: Environment Variables
* **Action:** Create a `.env.example` file.
* **Content:**
    ```text
    MYSQL_ROOT_PASSWORD=secret
    MYSQL_DATABASE=app_db
    KAFKA_BROKER=kafka:9092
    ```

## Step 5: CI/CD Workflow Skeleton
* **Action:** Create `.github/workflows/infrastructure.yml`.
* **Content:** A workflow that checks if `docker-compose config` is valid.

## Final Review
* Ensure all containers start together: `docker-compose up -d`.
* Verify network communication (e.g., can you ping `db` from a temporary container on `app-network`?).
