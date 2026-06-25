---
title: AstroFinix Mail Service
emoji: 📧
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# AstroFinix Mail Service

A Node.js/Express SMTP microservice with EJS templates to dispatch welcome and transactional emails.

## Run Locally

1. Create a `.env` file:
   ```env
   PORT=3000
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=hello@astrofinix.com
   SMTP_PASS=your_password
   SMTP_FROM_EMAIL="Astrofinix AI" <hello@astrofinix.com>
   ```

2. Install and Start:
   ```bash
   npm install
   npm start
   ```

## API Endpoints

### 1. General Mail Dispatch
* **Route:** `POST /api/send-email`
* **Body:**
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Hello Subject",
    "text": "Plain text message",
    "html": "<h1>HTML message</h1>"
  }
  ```

### 2. Dedicated Onboarding Welcome
* **Route:** `POST /api/send-welcome`
* **Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "User Name",
    "actionUrl": "https://astrofinix.com"
  }
  ```
