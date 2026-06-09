🛡️ Insurance Management System

A full-stack web application developed to help insurance companies digitally manage policies, customers, premium payments, and business reports through a centralized platform.

**Project Overview**

The Insurance Management System is designed to simplify insurance operations by replacing manual record management with a secure and efficient digital solution.

The system allows employees to:

Manage insurance policies
Track premium payments
View customer information
Generate reports and analytics
Monitor business performance through dashboards
Objectives
Digitize insurance policy management
Reduce manual paperwork
Improve payment tracking
Provide centralized customer records
Generate business reports and analytics
Enhance operational efficiency

🚀 Features
Authentication
User Registration
Secure Login
JWT Authentication
Role-Based Access Control
Policy Management (CRUD)
Create Policy
View Policy
Update Policy
Delete Policy
Dashboard
Total Policies
Active Policies
Revenue Analytics
Business Statistics
Payment Management
Premium Tracking
Payment Status Monitoring
Transaction History
Reports & Analytics
Revenue Reports
Policy Statistics
Business Insights
Security
Password Encryption using bcrypt
JWT-based Authentication
Protected Routes

🏗️ System Architecture
User / Employee
       │
       ▼
Frontend (React.js)
       │
       ▼
Axios API Requests
       │
       ▼
Backend (Node.js + Express.js)
       │
       ▼
Sequelize ORM
       │
       ▼
MySQL Database
       │
       ▼
Response Back to Frontend
💻 Technology Stack
Frontend
React.js
Vite
Axios
CSS
Backend
Node.js
Express.js
Database
MySQL
Sequelize ORM
Authentication & Security
JWT (JSON Web Token)
bcryptjs
Development Tools
Git
GitHub
VS Code

📂 Project Structure
Insurance_Management_System
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
│
└── README.md

⚙️ Installation
Clone Repository
git clone https://github.com/Pavithrareddy812/Insurance_Policy_Management_System.git
Frontend Setup
cd frontend
npm install
npm run dev
Backend Setup
cd backend
npm install
npm run dev

🗄️ Database Setup

Create MySQL Database:

CREATE DATABASE insurance_db;

Configure environment variables in:

backend/.env

Example:

PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=insurance_db
JWT_SECRET=your_secret_key


🔄 Application Flow
Employee logs into the system.
Dashboard displays policy and revenue statistics.
Policies can be created, viewed, updated, and deleted.
Premium payments are recorded and tracked.
Reports and analytics are generated.
Data is securely stored in MySQL.


📈 Future Enhancements
Mobile Application Support
Email Notifications
SMS Alerts
Two-Factor Authentication
Cloud Deployment
Advanced Reporting
Enhanced Security Features
