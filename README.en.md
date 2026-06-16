# EmpregaSafe — React + Node + MongoDB + Optional AI

> A web platform for analyzing the reliability of job postings, identifying risk signals, possible scams, and social engineering attempts against candidates before they share personal data, documents, money, or continue in low-reliability hiring processes.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js-blue)](#tech-stack)
[![Database](https://img.shields.io/badge/database-MongoDB-brightgreen)](https://www.mongodb.com/)
[![Compliance](https://img.shields.io/badge/compliance-LGPD%20aware-blueviolet)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## Main Features

- Public landing page presenting the system.
- User registration with name, email, and password.
- Email format validation and warning for common domain typos during registration.
- Registration attempt audit with automatic retention and minimized data for threat investigation.
- Login with email and password.
- Access verification through a 6-digit code sent by email, with individual input fields and copy/paste support.
- Password recovery through a code sent by email.
- Protected session with JWT.
- Session termination through logout.
- Frontend session control.
- Job reliability analysis using local rules.
- Complementary AI analysis when enabled.
- Duplicate analysis blocking for the same job and the same user.
- Job classification by risk level.
- Display of the reasons identified in the analysis.
- Objective recommendation for the candidate.
- Salary support in Brazilian Real, US Dollar, and Euro.
- Demonstration field for attaching a job screenshot as a future improvement, without sending the file to the API.
- PDF export of the analysis result.
- Dashboard with metrics, charts, aggregated ranking of most reported companies, and latest analyses.
- Analysis history with search, filters, pagination, detailed report, and PDF export.
- Visual emphasis for risk levels on the dashboard, history, and detailed report, with contrast adapted to the device theme.
- Copyable analysis ID to link suspicious job reports.
- Suspicious job report registration.
- Duplicate report blocking for the same analysis and the same user.
- Existing analysis search in the report form.
- Automatic filling of company, link, reason, and details when an analysis is selected.
- Recent report listing.
- Report sending by email directly from the interface.
- About page explaining the project, scoring, and system purpose.
- Responsive layout with mobile menu.
- Light or dark theme applied automatically according to the device preference.
- Interface language selector to switch between Portuguese and English, with the preference saved in the browser.
- Translation of the interface, menus, forms, visual reports, common messages, and exported PDF according to the selected language.
- Automatic update of the HTML `lang` attribute for accessibility and better interpretation by browsers and screen readers.
- Data persistence in MongoDB Atlas.
- Automated unit, security, E2E, accessibility, and AI comparison test suites.
- Quality pipeline with GitHub Actions.

## Tech Stack

- **Frontend:** React, Vite, JSX, React Router, Recharts, Lucide React
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer
- **Database:** MongoDB Atlas
- **Authentication:** JWT, bcrypt password hashing, and email verification
- **Email:** Nodemailer with configurable SMTP; Brevo is recommended for production
- **Optional AI:** OpenRouter or OpenAI
- **Deployment:** Render for the API and Netlify for the frontend

## Online Environment

The project is prepared to work with separate frontend and backend deployments:

- **Frontend:** Netlify
- **Backend/API:** Render
- **Database:** MongoDB Atlas
- **Transactional email:** SMTP through Brevo is recommended for production

Example production URLs:

```txt
Frontend: https://empregasafe.netlify.app
API: https://empregasafe-api.onrender.com/api
Health check: https://empregasafe-api.onrender.com/health
```

> On Render's free plan, the API may hibernate after idle periods. For presentations, open the system a few minutes earlier to reactivate the service.

> Language selection is controlled by the frontend and saved in the browser. It
> does not require an additional Render environment variable in production.

## Project Structure

```txt
emprega-safe-react-node/
├── backend/
│   ├── scripts/
│   │   ├── evaluate-ai.js
│   │   ├── seed-hybrid-analyses.js
│   │   └── seed-professional-analyses.js
│   ├── tests/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── netlify.toml
│   └── playwright.config.js
├── scripts/
│   └── check-secrets.js
├── .github/workflows/
│   └── quality.yml
├── TESTING.md
└── package.json
```

## Frontend Pages

| Route              | Description                             | Access    |
| ------------------ | --------------------------------------- | --------- |
| `/`                | Demonstration landing page              | Public    |
| `/login`           | Platform login                          | Public    |
| `/register`        | Account creation                        | Public    |
| `/verify`          | Validate access code sent by email      | Public    |
| `/forgot-password` | Request password recovery               | Public    |
| `/reset-password`  | Create a new password with a valid code | Public    |
| `/app`             | Dashboard / security panel              | Protected |
| `/app/analisar`    | Analyze job reliability                 | Protected |
| `/app/historico`   | Analysis history                        | Protected |
| `/app/denuncias`   | Register and view reports               | Protected |
| `/app/sobre`       | About the system                        | Protected |

## Authentication Flow

### Account Creation

1. The user accesses `/register`.
2. The user enters name, email, password, and password confirmation.
3. The backend validates the data.
4. The password is hashed with `bcryptjs`.
5. The user is saved in MongoDB with `active: true`.
6. After registration, the user is redirected to `/login`.

### Login with Email Verification

1. The user accesses `/login`.
2. The user enters email and password.
3. The backend validates the hashed password.
4. If `EMAIL_ENABLED=false`, login enters directly in development mode.
5. If `EMAIL_ENABLED=true`, the system generates a 6-digit code.
6. The code is temporarily saved in the user record and expires in 10 minutes.
7. The system sends the code to the registered email.
8. The user is redirected to `/verify`.
9. After entering the correct code, the backend issues the JWT.
10. The frontend stores the session in the browser and grants access to the protected area.

If the SMTP service becomes unavailable, the backend returns a controlled error without crashing the API and removes the temporary generated code.

### Password Recovery

1. The user clicks **Forgot my password**.
2. The user enters the registered email.
3. The system sends a 6-digit code to the email.
4. The user enters the received code.
5. The user creates a new password.
6. The backend hashes the new password with `bcryptjs`.
7. The recovery code is removed from the database.
8. The user returns to `/login`.

## Job Analysis

The analysis works in local or hybrid mode.

- **Local rules:** automatic system criteria for identifying risk signals.
- **Rules + AI:** local rules combined with artificial intelligence interpretation of the job description.

AI does not replace the rules. It complements the evaluation and helps interpret context, negations, and longer descriptions.

The saved result records the mode used (`rules` or `hybrid`), the local score, the AI score, and the difference between both evaluations. Local safety floors remain applied when the AI response conflicts with strong fraud signals.

## Job Classification

Each job receives a risk score from 0 to 100. The higher the score, the higher the risk.

| Score     | Classification | Interpretation                         |
| --------- | -------------- | -------------------------------------- |
| 0 to 25   | Reliable       | Low apparent risk                      |
| 26 to 55  | Suspicious     | Requires attention before moving ahead |
| 56 to 80  | Fraudulent     | Possible scam attempt                  |
| 81 to 100 | Critical risk  | Severe risk; avoiding is recommended   |

## Signals Analyzed

The system evaluates signals such as:

- upfront charges;
- payment request, mandatory course, activation fee, or registration fee;
- document request before a formal offer;
- bank data, Pix key, IBAN, or selfie with document request;
- WhatsApp or Telegram as the main channel;
- generic email instead of a corporate domain;
- shortened link or low-trust channel;
- absence of common information expected in a formal job posting;
- salary promise incompatible with the role;
- artificial urgency to pressure the candidate;
- missing company, contact, or verifiable link.

The system also considers positive signals, such as:

- corporate email;
- official company link;
- clear description of activities and requirements;
- absence of upfront charges;
- documents requested only after a formal offer.

## Optional AI

The analysis works with local rules even without AI.

When enabled, AI complements the analysis by helping interpret the job description more accurately and strengthening the risk evaluation.

### OpenRouter

```env
AI_ENABLED=true
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
AI_TIMEOUT_MS=45000
```

Another OpenRouter-compatible model can also be used, as long as it is available for the account.

### OpenAI

```env
AI_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_MS=45000
```

To disable AI:

```env
AI_ENABLED=false
```

## Backend Environment Variables

File:

```txt
backend/.env
```

Example:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/test
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
TRUST_PROXY_HOPS=
REGISTRATION_AUDIT_RETENTION_DAYS=90
REGISTRATION_AUDIT_HASH_SECRET=your_unique_audit_secret

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@empregasafe.com
ADMIN_PASSWORD=replace_with_a_strong_password

EMAIL_ENABLED=true
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=EmpregaSafe <verified_email_on_brevo>

AI_ENABLED=false
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_MS=45000
```

### Email Configuration

The backend uses Nodemailer and allows any SMTP provider to be configured through environment variables. For production on Render Free, Brevo with port `2525` is recommended because hosting providers may block traditional SMTP ports such as `465` and `587`.

Recommended Brevo example:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=EmpregaSafe <verified_email_on_brevo>
```

`EMAIL_USER` must be the SMTP login provided by Brevo, and `EMAIL_PASS` must be a Brevo SMTP key. Do not use the Brevo account password or a regular API key.

For Gmail in a local environment, use a Google app password:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
EMAIL_FROM=EmpregaSafe <your_email@gmail.com>
```

To temporarily disable code sending in development:

```env
EMAIL_ENABLED=false
```

## Frontend Environment Variables

File:

```txt
frontend/.env
```

Local example:

```env
VITE_API_URL=http://localhost:3000/api
```

Production example:

```env
VITE_API_URL=https://your-api.onrender.com/api
```

## Deployment

### Backend on Render

Recommended configuration:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
Runtime: Node
```

Main variables:

```env
NODE_ENV=production
NODE_VERSION=20
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://empregasafe.netlify.app
REGISTRATION_AUDIT_RETENTION_DAYS=90
REGISTRATION_AUDIT_HASH_SECRET=your_unique_audit_secret

EMAIL_ENABLED=true
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=EmpregaSafe <verified_email_on_brevo>

AI_ENABLED=false
```

The `/health` endpoint can be used to validate whether the API and MongoDB are active.

### Frontend on Netlify

Recommended configuration:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Required variable:

```env
VITE_API_URL=https://empregasafe-api.onrender.com/api
```

After getting the final Netlify URL, configure `CORS_ORIGIN` on Render with the published frontend domain.

## Main API Routes

### Authentication

| Method | Route                       | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`        | Creates a new account                    |
| POST   | `/api/auth/login`           | Validates email and password             |
| POST   | `/api/auth/verify`          | Validates the 6-digit code sent by email |
| POST   | `/api/auth/forgot-password` | Requests a password reset code           |
| POST   | `/api/auth/reset-password`  | Resets the password with a valid code    |
| GET    | `/api/auth/me`              | Returns authenticated user data          |

### Analyses

| Method | Route                       | Description                             |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/api/analyses`             | Lists authenticated user's analyses     |
| POST   | `/api/analyses`             | Creates a new job analysis              |
| GET    | `/api/analyses/:externalId` | Retrieves an analysis owned by the user |

### Reports

| Method | Route                         | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/api/reports`                | Lists authenticated user's reports |
| POST   | `/api/reports`                | Creates a new report               |
| POST   | `/api/reports/:id/send-email` | Sends a report by email            |

### Statistics

| Method | Route        | Description                                                                   |
| ------ | ------------ | ----------------------------------------------------------------------------- |
| GET    | `/api/stats` | Returns user's dashboard metrics and aggregated ranking of reported companies |

## Database

The project uses MongoDB Atlas.

Main collections:

```txt
users
analyses
reports
registrationaudits
```

### `users`

Stores platform users.

Main fields:

```txt
name
email
password
role
active
verificationCode
verificationExpires
passwordResetCode
passwordResetExpires
createdAt
updatedAt
```

### `analyses`

Stores job analyses.

Main fields:

```txt
externalId
user
title
company
salary
currency
contact
link
description
score
classification
badge
analysisMode
ruleScore
aiScore
scoreDifference
reasons
signals
recommendation
ai
createdAt
updatedAt
```

### `reports`

Stores reports submitted by users.

Main fields:

```txt
externalId
user
analysis
company
link
reason
details
createdAt
updatedAt
```

### `registrationaudits`

Stores accepted, rejected, or errored registration attempts. The collection does not receive passwords, tokens, or verification codes. Email and IP are masked for display and also stored as hashes for correlation.

Records expire automatically after the period defined in `REGISTRATION_AUDIT_RETENTION_DAYS`.

#### Querying Registration Audit Logs

To list recent events:

```bash
cd backend
npm run audit:registrations -- --days=7 --limit=50
```

To investigate attempts related to a specific email:

```bash
npm run audit:registrations -- --email=user@example.com
```

Fictional and shortened output example:

```txt
{
  filters: { days: 7, limit: 50, email: '' },
  summary: [
    { _id: { outcome: 'accepted', reason: 'account_created' }, total: 1 },
    { _id: { outcome: 'rejected', reason: 'invalid_email' }, total: 1 }
  ],
  events: [
    {
      createdAt: '2026-06-02T14:00:00.000Z',
      outcome: 'rejected',
      reason: 'invalid_email',
      maskedEmail: 'p***@example.vom',
      emailHash: 'a1b2c3d4e5f6',
      maskedIp: '192.168.1.***',
      ipHash: 'f6e5d4c3b2a1',
      userAgent: 'Mozilla/5.0'
    }
  ]
}
```

The shortened hashes shown in the terminal help correlate attempts without exposing the full stored values.

## Running Locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

The API should start at:

```txt
http://localhost:3000/api
```

The seed creates an administrator user using the data defined in `.env`. Define a strong password for `ADMIN_PASSWORD`; the seed does not use a default password.

```env
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@empregasafe.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Access:

```txt
http://localhost:5173
```

## Useful Scripts

### Project Root

```bash
npm run test:all
npm test
npm run build
npm run test:secrets
npm run audit
```

### Backend

```bash
npm run dev
npm start
npm run seed
npm run seed:analyses -- user@example.com=100
npm run seed:analyses:hybrid -- user@example.com=20
npm run cleanup:duplicate-reports -- user@example.com --apply
npm run backfill:analysis-fingerprints -- --apply
npm run audit:registrations -- --days=7 --limit=50
npm run audit:registrations -- --email=user@example.com
npm run test:unit
npm run test:security
npm run test:ai
npm run test:ai:live
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:ui
```

## Demonstration Data

The backend has optional seeds to fill the history without deleting existing analyses. Batches are idempotent: running the same command again does not duplicate records.

### Local Rule Analyses

```bash
cd backend
npm run seed:analyses -- user@example.com=100
```

### Hybrid AI Analyses

```bash
npm run seed:analyses:hybrid -- user@example.com=20
```

The hybrid seed requires `AI_ENABLED=true` and a valid provider key. Each record is saved only when AI participates in the evaluation. This command may consume credits or quota from the configured provider.

It is possible to fill more than one account in the same command:

```bash
npm run seed:analyses -- user1@example.com=80 user2@example.com=20
```

> Seeds modify the MongoDB database configured in `backend/.env`. Use them only in controlled environments and do not send passwords or keys as command arguments.

## Professional Testing

The project has five complementary validation groups:

1. Unit tests for local rules, classifications, and payload validation.
2. API and security tests for Helmet, CORS, JWT, payload limits, rate limits, and data isolation between users.
3. E2E tests with Playwright on desktop and mobile, including accessibility with axe-core and visual interface states.
4. Versioned scenarios to compare reliable, suspicious, and critical jobs, with optional real AI consultation mode.
5. GitHub Actions pipeline with build, tests, dependency audit, and secrets verification.

To install the browser used by Playwright on the first execution:

```bash
cd frontend
npx playwright install chromium
cd ..
```

To run the full validation before a delivery:

```bash
npm run test:all
```

Additional details are available in [`TESTING.md`](TESTING.md).

## Security

- Do not commit `.env` files to GitHub.
- Use a strong `JWT_SECRET` in production.
- Use a unique `REGISTRATION_AUDIT_HASH_SECRET` in production.
- Configure `TRUST_PROXY_HOPS=1` only when the API is behind a trusted proxy, such as the deployment provider proxy.
- Use a transactional SMTP provider in production, such as Brevo, with verified sender and dedicated SMTP key.
- Do not send passwords by email.
- Passwords are stored with hash using `bcryptjs`.
- The verification code expires in 10 minutes.
- The password recovery code expires in 10 minutes.
- Internal routes are protected by JWT.
- Analyses, reports, and personal metrics are isolated by authenticated user.
- The ranking of most reported companies is aggregated and does not expose user, email, analysis ID, or individual report details.
- The API applies security headers with Helmet.
- The backend restricts allowed origins through CORS and limits JSON payloads.
- The API has a global request limit and stricter limits for login, verification, and password recovery.
- Temporary codes are generated with Node.js cryptographic resources.
- Password recovery does not reveal whether an email is registered.
- The repository includes automated scanning to prevent committing secrets and `.env` files.
- On logout, local authentication data is removed.
- In production, configure `CORS_ORIGIN` correctly.
- AI must be treated as analysis support, not as an absolute decision.
- Users should validate companies and job postings through official channels before sending documents or personal data.

## Usage Notes

- The dashboard uses data saved in MongoDB to build metrics and charts.
- Dashboard, history, and reports display only data from the authenticated user.
- The dashboard also displays an aggregated community ranking of most reported companies, preserving individual record privacy.
- The **Potentially fraudulent** category is shown in simplified form as **Fraudulent** in charts and filters.
- The analysis ID can be copied from the history page to link a report to a specific analysis.
- On the reports screen, the user can search for an existing analysis and automatically fill the fields.
- The system does not guarantee that a job is true or false; it highlights risk signals to support the candidate's decision-making.

## Authors and Project Team

- **Group:** EmpregaSafe
- **Members:** Juliana Reis, Pedro Asafe, Matheus de Souza, Nycolle Jenifer, Patrícia Betânia, Beatriz Pereira and Ricardo Lacerda.
- **Tech English Course Professor:** Leonardo Lucena.

## Project Status

Current version with:

- React frontend with landing page and protected area;
- responsive layout with mobile menu;
- Node.js backend with JWT authentication;
- registration, login, email verification, and password recovery;
- job analysis using local rules;
- optional AI through OpenRouter or OpenAI;
- dashboard with charts;
- aggregated ranking of most reported companies on the security panel;
- history with filters, pagination, and report;
- reports linkable by analysis ID;
- persistence in MongoDB Atlas;
- data isolation by user;
- idempotent seeds for demonstration with local rules or hybrid mode;
- professional tests and quality workflow with GitHub Actions.
