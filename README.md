# RaiseRealm Backend - API Server

RESTful API backend for the RaiseRealm crowdfunding platform built with Node.js, Express, and Supabase.

## 🏗️ Project Overview

RaiseRealm Backend provides a comprehensive REST API for managing:
- User authentication and authorization
- Project creation and management
- Milestone tracking
- Reward tiers
- Contributions and payments
- Impact reporting
- Comments and community engagement

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Payment Processing**: Stripe
- **Validation**: Custom middleware

## 📁 Project Structure

```
backend/
├── config/
│   └── supabase.js       # Supabase client configuration
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── commentController.js    # Comments management
│   ├── contributionController.js # Contributions handling
│   ├── impactController.js    # Impact reports CRUD
│   ├── milestoneController.js  # Milestones management
│   ├── paymentController.js   # Stripe payments
│   ├── projectController.js   # Projects CRUD
│   └── rewardController.js   # Rewards management
├── middleware/
│   ├── authMiddleware.js      # JWT authentication
│   └── validationMiddleware.js # Input validation
├── routes/
│   ├── authRoutes.js
│   ├── commentRoutes.js
│   ├── contributionRoutes.js
│   ├── impactRoutes.js
│   ├── milestoneRoutes.js
│   ├── paymentRoutes.js
│   ├── projectRoutes.js
│   └── rewardRoutes.js
├── package.json
├── server.js             # Express app entry point
└── .env                  # Environment variables
```

## 🗄️ Database Schema

### Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | User email (unique) |
| name | VARCHAR(255) | User display name |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Account creation time |

#### projects
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| creator_id | UUID | FK to users |
| title | VARCHAR(255) | Project title |
| description | TEXT | Full description |
| short_description | VARCHAR(500) | Brief summary |
| category | VARCHAR(100) | Project category |
| image_url | TEXT | Cover image |
| goal_amount | DECIMAL | Funding target |
| current_amount | DECIMAL | Amount raised |
| status | ENUM | draft, active, funded, completed, failed |
| end_date | TIMESTAMP | Campaign end date |
| created_at | TIMESTAMP | Creation time |

#### milestones
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| title | VARCHAR(255) | Milestone title |
| description | TEXT | Details |
| amount | DECIMAL | Funding amount |
| status | ENUM | pending, completed |
| due_date | TIMESTAMP | Target completion |

#### rewards
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| title | VARCHAR(255) | Reward name |
| description | TEXT | Reward details |
| amount | DECIMAL | Minimum contribution |
| limit | INTEGER | Max backers (optional) |

#### contributions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| user_id | UUID | FK to users |
| amount | DECIMAL | Contribution amount |
| reward_id | UUID | FK to rewards (optional) |
| status | ENUM | pending, completed, refunded |
| created_at | TIMESTAMP | Contribution time |

#### impact_reports
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| title | VARCHAR(255) | Report title |
| description | TEXT | Impact details |
| metrics | JSONB | Key-value metrics |
| media_urls | TEXT[] | Image/video URLs |
| created_by | UUID | FK to users |
| created_at | TIMESTAMP | Report time |

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "message": "Registration successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Google OAuth
```
POST /auth/google-auth
Content-Type: application/json

{
  "googleToken": "google_id_token",
  "profile": {
    "email": "user@gmail.com",
    "name": "Google User",
    "picture": "avatar_url"
  }
}

Response: {
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Project Endpoints

#### Get All Projects
```
GET /projects
Query Params: category, status, search, page, limit

Response: {
  "projects": [...],
  "pagination": { ... }
}
```

#### Get Single Project
```
GET /projects/:id

Response: {
  "id": "...",
  "title": "...",
  "creator": { ... },
  "milestones": [...],
  "rewards": [...],
  "contributions": [...],
  "current_amount": 50000,
  "backers_count": 100
}
```

#### Create Project (Protected)
```
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Project",
  "description": "Full description",
  "short_description": "Brief summary",
  "category": "Technology",
  "goal_amount": 100000,
  "end_date": "2024-12-31",
  "image_url": "https://..."
}

Response: {
  "message": "Project created successfully",
  "project": { ... }
}
```

### Milestone Endpoints

#### Get Project Milestones
```
GET /milestones/project/:project_id

Response: [
  {
    "id": "...",
    "title": "Phase 1",
    "amount": 25000,
    "status": "pending"
  }
]
```

#### Create Milestone (Protected)
```
POST /milestones
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "project_uuid",
  "title": "First Milestone",
  "description": "Initial development",
  "amount": 25000,
  "due_date": "2024-06-30"
}
```

### Reward Endpoints

#### Get Project Rewards
```
GET /rewards/project/:project_id

Response: [
  {
    "id": "...",
    "title": "Early Bird",
    "amount": 1000,
    "description": "Special early backer reward"
  }
]
```

### Contribution Endpoints

#### Create Contribution
```
POST /contributions
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "project_uuid",
  "amount": 5000,
  "reward_id": "reward_uuid" // optional
}

Response: {
  "message": "Contribution initiated",
  "contribution": { ... }
}
```

### Payment Endpoints

#### Get Stripe Config
```
GET /payments/config

Response: {
  "publishableKey": "pk_test_..."
}
```

#### Create Payment Intent
```
POST /payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000, // amount in paise ( INR)
  "project_id": "project_uuid",
  "reward_id": "reward_uuid" // optional
}

Response: {
  "clientSecret": "pi_xxx_secret_xxx"
}
```

#### Stripe Webhook
```
POST /payments/webhook
Content-Type: application/json

Stripe webhook events for payment confirmation
```

### Impact Report Endpoints

#### Get Creator Impact Stats
```
GET /impact/dashboard
Authorization: Bearer <token>

Response: {
  "overview": {
    "totalProjects": 5,
    "fundedProjects": 3,
    "totalRaised": 150000,
    "totalReports": 8
  },
  "projects": [...],
  "aggregatedMetrics": {
    "people_helped": 500,
    "villages_covered": 25
  }
}
```

#### Create Impact Report
```
POST /impact
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "project_uuid",
  "title": "Q1 2024 Update",
  "description": "Progress report...",
  "metrics": {
    "people_helped": 100,
    "schools_built": 2
  }
}
```

## 🚀 Installation Steps

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Step 1: Clone Repository
```
bash
git clone https://github.com/YOUR_USERNAME/raiserealm-backend.git
cd raiserealm-backend
```

### Step 2: Install Dependencies
```
bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:

```
env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Server Port
PORT=3000

# Stripe Keys (get from stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Step 4: Set Up Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor
4. Run the SQL commands from `DATABASE_SCHEMA.sql`
5. Run commands from `FIX_RLS.sql` (if needed)

### Step 5: Start Server
```
bash
npm start
```

Server will run at `http://localhost:3000`

## 🌐 Deployment

### Deploy to Render
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Add environment variables in Render dashboard
6. Deploy!

**Live Backend**: [https://raiserealm-api.onrender.com](https://raiserealm-api.onrender.com)

## 🧪 Testing

### Test with cURL

```
bash
# Health Check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 📝 API Response Format

All responses follow this structure:

### Success
```
json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```
json
{
  "error": "Error message here"
}
```

## 🔐 Authentication

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Database & Auth
- [Stripe](https://stripe.com) - Payments
- [Express.js](https://expressjs.com) - Web Framework
