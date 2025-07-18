# The_First_Project_Backend_NTI
This is my Node.js backend.

# 📚 Audio Library Sharing App (Backend Only)

A backend RESTful API for an **Audio Library Sharing App**, built with **Node.js**, **Express**, and **MongoDB**. This app allows users to upload and manage audiobooks, lectures, or podcasts — complete with authentication, role-based access, file uploads, and audio streaming.

> 🎯 Testable with Postman — no frontend included.

---

## 🚀 Features

### 🔐 Authentication
- `POST /api/register`: Register a new user/admin with optional profile picture.
- `POST /api/login`: Login and receive a JWT.

> ✅ Passwords are hashed with **bcrypt**, and JWTs are used for session handling.

### 👤 User Profile
- `GET /api/profile`: View current user's profile.
- `PUT /api/profile`: Update name or profile picture.

### 🎧 Audio Management
- `POST /api/audio`: Upload audio (MP3/M4A), cover image, title, genre, and privacy setting.
- `GET /api/audio`: View public audio from all users.
- `GET /api/audio/mine`: View your uploaded audio (public + private).
- `GET /api/audio/stream/:id`: Stream an audio file.
- `PUT /api/audio/:id`: Update title, genre, privacy, or cover image.
- `DELETE /api/audio/:id`: Delete your audio.

> 🧠 Only the uploader can modify or delete their content.

### 🛠️ Admin Tools
- `GET /api/admin/audios`: View all uploaded audio files.
- `DELETE /api/admin/audio/:id`: Delete any user's audio.

### 📁 Upload Support with Multer
- Supports multiple file types:
  - Audio: `.mp3`, `.m4a` (max 50MB)
  - Images: `.jpg`, `.png` (max 2–5MB)
- Files are stored in structured folders based on user ID.

### 📼 Audio Streaming
- Stream files efficiently using `fs.createReadStream()` with HTTP range headers.

### 🧱 Validation with express-validator
- Clean separation of reusable validators for:
  - Registration
  - Login
  - Profile update
  - Audio upload/update
  - ObjectId format

### 🧰 Global Error Handling
- Centralized middleware handles:
  - Validation errors
  - Authentication/authorization issues
  - Upload errors
  - Uncaught server exceptions

---

## 🗂️ Project Structure

audio-library-app/
--
├── config/ # DB and multerc onfiguration
--
├── controllers/ # Route handler logic
---
├── middlewares/ # Auth, validators, error handling
---
├── models/ # Mongoose schemas
---
├── routes/ # All route files
---
├── uploads/ # Auto-created folders for audio, covers, profiles
---
│ └── audio/user_<userId>/
---
│ └── covers/user_<userId>/
---
│ └── profiles/user_<userId>/
---
├── .env # Env variables (PORT, DB, JWT_SECRET)
---
├── app.js # App config
---
├── server.js # App entry point
---


## 🧪 Testing (Postman)

- Use `form-data` to test uploads (fields: `audio`, `cover`, `profilePic`).
- Include `Authorization: Bearer <token>` header on protected routes.
- Test:
  - Input validation
  - Auth flows (user vs admin)
  - Role-based access
  - Audio streaming support

---

## 📋 API Validation Rules

| Field         | Rules                                                                 |
|---------------|-----------------------------------------------------------------------|
| `name`        | Required (min 2 chars)                                                |
| `email`       | Must be valid                                                         |
| `password`    | Min 6 chars, must include number or special char                      |
| `title`       | Required, min 3 chars                                                 |
| `genre`       | Required, must be one of: education, religion, comedy, fiction, etc.  |
| `isPrivate`   | Optional, must be boolean                                             |
| `:id` params  | Must be valid MongoDB ObjectId                                        |

---

## 🛡️ Security

- ✅ Password hashing using **bcrypt**
- ✅ Token-based access with **JWT**
- ✅ Role-based route protection (user vs admin)
- ✅ Express Validator for input validation
- ✅ Centralized error handling

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT, bcrypt
- **File Uploads:** Multer, fs
- **Validation:** express-validator
- **Testing:** Postman

---

## 📌 How to Run

```bash
git clone https://github.com/your-username/The_First_Project_Backend_NTI.git
cd The_First_Project_Backend_NTI
npm install
