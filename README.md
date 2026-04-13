# 🎓 TrinitySync  
### Anti-Conflict University Scheduling System  
**Holy Trinity University**

TrinitySync is a smart university scheduling platform designed to help administrators create class schedules **without conflicts**, while allowing students and faculty to view schedules clearly and reliably.

The system is primarily built for **schedule creation at the start of each semester**, ensuring that rooms, instructors, and time slots never overlap.

---

## 🚀 Key Features

### 🔐 Role-Based System

TrinitySync uses a structured, role-based access system powered by **Supabase Authentication and PostgreSQL Row Level Security (RLS).**

#### 👑 Super Admin
- Full system access across all colleges  
- Manage all schedules, programs, users, and conflicts  
- View global analytics and audit logs  
- Override and resolve conflicts across colleges  

#### 🏫 College Admin
- Manage schedules only within their assigned college  
- Create and approve schedule groups  
- Encode class schedules in bulk  
- Run and resolve conflict checks  
- Manage courses, instructors, and rooms within their college  

#### 👨‍🏫 Instructor
- View assigned teaching schedules  
- Monitor time slots, rooms, and loads  
- Future-ready for workload and availability systems  

#### 🎓 Student
- View personal schedules  
- Access semester timetables  
- Receive schedule updates and changes  

---

## ⚙️ Installation Guide

Follow the steps below to set up TrinitySync locally for development.

---

### 🖥️ Prerequisites

- Node.js  
- Python 3.10+  
- pip  
- Git (optional)

---

### 🌐 Frontend Setup

#### 1. Navigate to frontend
```
cd frontend
```

#### 2. Install dependencies
```
npm install
```

#### 3. Run dev server
```
npm run dev
```

Default: http://localhost:3000

---

### 🛠️ Backend Setup

#### 1. Navigate to backend
```
cd backend
```

#### 2. Create virtual environment
```
python -m venv venv
```

#### 3. Activate environment

Windows:
```
venv\Scripts\activate
```

Mac/Linux:
```
source venv/bin/activate
```

#### 4. Install dependencies
```
pip install -r requirements.txt
```

#### 5. Run migrations
```
python manage.py migrate
```

#### 6. Run server
```
python manage.py runserver
```

Default: http://localhost:8000

---

## 📜 License

Developed for academic and institutional use under Holy Trinity University.
