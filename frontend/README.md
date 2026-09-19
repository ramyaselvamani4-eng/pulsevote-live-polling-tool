# PulseVote

## Live Polling Tool

PulseVote is a real-time polling application where users can create polls, share them with an audience, and see voting results update live without refreshing the page.

## Features

* User Signup and Login
* JWT-based authentication
* Create polls
* Add multiple options
* Share polls using a unique link
* Real-time voting
* Live result updates using WebSocket
* Redis-powered live vote counting
* MongoDB persistent data storage
* Prevent duplicate voting
* Close polls
* Dashboard for managing created polls
* Copy poll link
* Responsive and simple user interface

## Technology Stack

### Frontend

* React
* JavaScript
* React Router

### Backend

* Go
* Gin Framework

### Database

* MongoDB

### Real-Time System

* Redis
* WebSocket

### Authentication

* JWT
* bcrypt

## Architecture

```text
User
  |
  v
React Frontend
  |
  | HTTP API
  v
Go + Gin Backend
  |
  +------------------+
  |                  |
  v                  v
MongoDB             Redis
  |                  |
  |                  v
  |              Live Counts
  |                  |
  +--------+---------+
           |
           v
       WebSocket
           |
           v
   Connected Users
```

## Application Flow

```text
Create Account
      |
      v
Login
      |
      v
Dashboard
      |
      v
Create Poll
      |
      v
Generate Share Link
      |
      v
Audience Opens Poll
      |
      v
Audience Votes
      |
      v
MongoDB Stores Vote
      |
      v
Redis Updates Live Count
      |
      v
WebSocket Broadcast
      |
      v
All Connected Users See Updated Results
```

## Project Structure

```text
live-polling-tool/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Poll.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── CreatePoll.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── websocket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── database.go
│   │   └── redis.go
│   ├── controllers/
│   │   ├── auth.go
│   │   ├── poll.go
│   │   └── vote.go
│   ├── middleware/
│   │   └── auth.go
│   ├── models/
│   │   ├── user.go
│   │   └── poll.go
│   ├── utils/
│   │   └── jwt.go
│   ├── websocket/
│   │   └── handler.go
│   ├── main.go
│   └── go.mod
│
├── README.md
└── .gitignore
```

## API Endpoints

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Polls

```text
POST /api/polls
GET /api/polls/:shareCode
GET /api/polls/:shareCode/results
GET /api/user-polls
POST /api/polls/:shareCode/close
```

### Voting

```text
POST /api/polls/:shareCode/vote
```

### WebSocket

```text
GET /ws/polls/:shareCode
```

## Environment Variables

### Backend

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
```

### Frontend

Create a `.env` file inside the `frontend` folder if required for your frontend configuration.

## Running the Project Locally

### 1. Start MongoDB

PulseVote uses MongoDB for persistent data storage.

### 2. Start Redis

Make sure Redis is running on:

```text
localhost:6379
```

### 3. Start Backend

Open PowerShell:

```powershell
cd C:\Users\pc\Desktop\live-polling-tool\backend
go run .
```

Backend runs on:

```text
http://localhost:8080
```

### 4. Start Frontend

Open another PowerShell window:

```powershell
cd C:\Users\pc\Desktop\live-polling-tool\frontend
npm.cmd run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## How to Use

1. Open the application.
2. Create an account.
3. Login.
4. Open the Dashboard.
5. Click **Create New Poll**.
6. Enter a question and options.
7. Create the poll.
8. Copy the generated poll link.
9. Share the link with the audience.
10. Audience members vote.
11. Results update in real time.
12. The poll owner can close the poll.

## Real-Time Voting

When a user votes:

```text
Vote
  |
  v
Go Backend
  |
  +----> MongoDB
  |       Stores vote
  |
  +----> Redis
          Updates vote count
             |
             v
         WebSocket
             |
             v
      Connected Browsers
```

This allows users watching the same poll to see updated results without manually refreshing the page.

## Duplicate Vote Prevention

Each browser receives a unique voter ID stored in local storage.

The backend checks whether that voter has already voted for the poll.

If a previous vote exists, another vote is rejected.

## Security

* Passwords are hashed using bcrypt.
* Authentication uses JWT.
* Poll creation requires authentication.
* Poll closing requires authentication.
* Only the poll creator can close their poll.
* Users cannot vote on closed polls.
* Duplicate votes are prevented.

## Future Improvements

* Poll editing
* Poll deletion
* Admin analytics
* Vote charts
* Multiple poll types
* Cloud deployment
* Rate limiting
* Improved mobile UI

## Author

Ramya

B.Tech Information Technology Student

Software Testing / QA Enthusiast
