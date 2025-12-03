#!/bin/bash

# Configuration
BASE_URL="http://localhost"
BACKEND_URL="${BASE_URL}/api"
FEED_URL="${BASE_URL}/feed/api"
USERNAME="testuser"
PASSWORD="testpassword"
SUBJECT="autos"
MESSAGE="Hello from E2E test! $(date +%s)" # Unique message

echo "Starting End-to-End Test..."

# 1. Register user (Backend)
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/users" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\"}")

if echo "${REGISTER_RESPONSE}" | grep -q "id"; then
  echo "User registered successfully."
else
  echo "User registration failed or user already exists. Response: ${REGISTER_RESPONSE}"
fi

# 2. Login user (Backend)
echo "2. Logging in user..."
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -oP '(?<="accessToken":")[^"]*')

if [ -n "${ACCESS_TOKEN}" ]; then
  echo "Login successful. Access Token: ${ACCESS_TOKEN:0:10}..."
else
  echo "Login failed. Response: ${LOGIN_RESPONSE}"
  exit 1
fi

# 3. Post message to "autos" (Backend -> Kafka)
echo "3. Posting message to subject '${SUBJECT}'..."
POST_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/subjects/${SUBJECT}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d "{\"message\": \"${MESSAGE}\"}")

if echo "${POST_RESPONSE}" | grep -q "201 Created"; then
  echo "Message posted successfully."
elif echo "${POST_RESPONSE}" | grep -q "200 OK"; then
  echo "Message posted successfully (status 200 OK)."
else
  echo "Failed to post message. Response: ${POST_RESPONSE}"
  exit 1
fi

# 4. Wait 2 seconds (Eventual consistency)
echo "4. Waiting 2 seconds for eventual consistency..."
sleep 2

# 5. Fetch "autos" HTML (Feed)
echo "5. Fetching HTML feed for subject '${SUBJECT}'..."
FEED_HTML=$(curl -s "${FEED_URL}/subjects/${SUBJECT}")

# 6. Assert HTML contains the message
echo "6. Asserting HTML contains the message..."
if echo "${FEED_HTML}" | grep -q "${MESSAGE}"; then
  echo "Assertion successful: Message found in feed!"
  echo "E2E Test PASSED."
else
  echo "Assertion failed: Message NOT found in feed."
  echo "Feed HTML:"
  echo "${FEED_HTML}"
  echo "E2E Test FAILED."
  exit 1
fi

exit 0
