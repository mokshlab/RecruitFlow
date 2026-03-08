# RecruitFlow

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

A production-deployed, full-stack job portal with a two-sided platform: a candidate-facing portal and a separate recruiter/admin dashboard -- connected via real-time WebSocket events.

**Live Demo:**
- **Candidate Portal:** [https://recruit-flow-five.vercel.app](https://recruit-flow-five.vercel.app)
- **Recruiter Dashboard:** [https://recruit-flow-five.vercel.app/admin-dashboard](https://recruit-flow-five.vercel.app/admin-dashboard)

**Demo Credentials:**
| Role | Login | Password |
|---|---|---|
| Candidate | `demo.user@example.com` | `Demo$456` |
| Admin | `testadmin` | `Check#2026` |

---

## What It Does

RecruitFlow solves the coordination problem between job seekers and recruiters on a single platform:

- Candidates browse, filter, apply, and track applications in real-time
- Recruiters post jobs, review applicants, update statuses, and get instant notifications when someone applies
- Both sides see live updates without page refresh -- powered by Socket.io room-based messaging

---

## Stack & Key Decisions

| Layer | Technology | Why |
|---|---|---|
| API | Node.js + Express | Lightweight, non-blocking I/O suits real-time workloads |
| Database | MongoDB Atlas + Mongoose | Flexible schema for evolving job/application models |
| Auth | JWT + bcrypt | Stateless auth -- scales horizontally without session store |
| Real-time | Socket.io | Room isolation keeps candidate and recruiter events separate |
| File Storage | GridFS (MongoDB) | Keeps resume storage within the existing database layer |
| Frontend | React 19 + MUI | Component-driven UI with consistent design system |
| Deployment | Vercel + Render | Zero-config CI/CD on push to main |

---

## Engineering Highlights

**Dual authentication system** -- Candidates and admins authenticate through separate flows with independent JWT claims and middleware guards. A misconfigured role cannot bleed privileges across contexts.

**Real-time event architecture** -- Socket.io rooms partition events by user type. When a candidate submits an application, the server emits to the recruiter room only -- no broadcast noise, no polling.

**Secure file pipeline** -- Uploaded resumes are validated at three layers: MIME type, file extension, and magic-byte header inspection before reaching GridFS. Prevents disguised executable uploads.

**Rate limiting + security headers** -- Auth endpoints and general API endpoints have separate rate limit tiers. Helmet, XSS sanitization, and NoSQL injection prevention applied globally.

**MVC with layered middleware** -- Routes -> Controllers -> Models, with validation and auth middleware composable per-route rather than globally applied.

---

## Architecture

```
+-----------------+        +----------------------------------+
|  React Frontend |--HTTP->|  Express REST API (MVC)         |
|  (Vercel)       |<--WS---|  +-- Auth Middleware (JWT)       |
+-----------------+        |  +-- Validation Middleware       |
                           |  +-- Rate Limiting               |
                           |  +-- GridFS File Handler         |
                           +----------------+-----------------+
                                            |
                                     MongoDB Atlas
                           (Jobs . Users . Admins . Applications)
```

---

## Developer

**Moksh**
GitHub: [@mokshlab](https://github.com/mokshlab)