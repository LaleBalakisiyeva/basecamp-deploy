# ⛺ MyBasecamp — Subject 2

Extension of Subject 1: adds **File Attachments**, **Discussion Threads**, **Messages**, and **Project Membership** management.
HEAD
> **Live deployment:** https://basecamp-deploy-production.up.railway.app

> **Live deployment:** `https://your-app.railway.app` *(replace after deploying — see [Deployment](#deployment))*
 a27ad7f1f478de321a57462f7da2af504cd4e6f8

> **Note:** This project does not run on the Qwasar platform due to differences in the database system. The project is implemented using PostgreSQL, while Qwasar uses SQLite.

---

## New Features (Subject 2)

### Attachments
- Any project member can upload files to a project
- Supported formats: PNG, JPG, GIF, PDF, TXT, CSV, DOC, DOCX
- Format stored in DB and displayed as a color-coded badge on project show
- Multiple attachments per project; uploader or project admin can delete

### Threads (Let's discuss!)
- Only project admins can create, edit, or delete threads
- Threads scoped to a project; full CRUD

### Messages (inside a thread)
- Any project member can post, edit, and delete their own messages
- Project admins can edit/delete any message
- Shows author, timestamp, and "edited" indicator

### Project Membership
- Owner is automatically a project admin member
- Admins can add members by email (role: member or admin)
- Admins can remove members; membership gates all project content

---

## Architecture: MVC + ORM

src/models:        User, Project, ProjectMember (new), Attachment (new), Thread (new), Message (new)
src/controllers:   attachmentsController, threadsController, messagesController, membersController (all new)
src/middleware:    project.js (loadProject, requireProjectMember, requireProjectAdmin), upload.js (multer)
src/routes:        attachments.js, threads.js (with nested messages), members.js

---

## Setup

Requires Node.js 18+ and PostgreSQL.

  npm install
  cp .env.example .env    # fill DATABASE_URL + SESSION_SECRET
  npm start
  node seed.js            # optional: creates demo users, project, thread, messages

Demo credentials:
  Admin: admin@mybasecamp.com / admin123
  Demo:  demo@mybasecamp.com / demo123

---

## Deployment (Railway)

1. Push repo to GitHub
2. railway.app → New Project → Deploy from GitHub repo
3. Add PostgreSQL plugin (DATABASE_URL is auto-set)
4. Add env vars: SESSION_SECRET, NODE_ENV=production
5. Deploy — Railway uses `npm start` automatically

Update the live link at the top of this file once deployed.

---

## Full Routes Reference

Attachments:
  POST   /projects/:projectId/attachments             upload file (project member)
  DELETE /projects/:projectId/attachments/:id         delete file (uploader or project admin)

Threads:
  GET    /projects/:projectId/threads/new             new thread form (project admin)
  POST   /projects/:projectId/threads                 create thread (project admin)
  GET    /projects/:projectId/threads/:id             view thread + messages (project member)
  GET    /projects/:projectId/threads/:id/edit        edit form (project admin)
  PUT    /projects/:projectId/threads/:id             update thread (project admin)
  DELETE /projects/:projectId/threads/:id             delete thread (project admin)

Messages:
  POST   /projects/:projectId/threads/:threadId/messages          post message (project member)
  GET    /projects/:projectId/threads/:threadId/messages/:id/edit edit form (author or admin)
  PUT    /projects/:projectId/threads/:threadId/messages/:id      update (author or admin)
  DELETE /projects/:projectId/threads/:threadId/messages/:id      delete (author or admin)

Members:
  POST   /projects/:projectId/members                add member by email (project admin)
  DELETE /projects/:projectId/members/:userId        remove member (project admin)

Permission matrix:
  Action                  | Member | Project Admin | Site Admin
  Upload attachment       |   yes  |     yes       |    yes
  Delete own attachment   |   yes  |     yes       |    yes
  Delete any attachment   |   no   |     yes       |    yes
  Create/edit/del thread  |   no   |     yes       |    yes
  Post message            |   yes  |     yes       |    yes
  Edit/del own message    |   yes  |     yes       |    yes
  Edit/del any message    |   no   |     yes       |    yes
  Add/remove members      |   no   |     yes       |    yes
