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

### 🗓️ Anti-Conflict Scheduling Engine

Automatically detects and prevents conflicts based on:

- ⏰ Time overlaps  
- 🏫 Room availability  
- 👨‍🏫 Instructor double-booking  
- 🏷️ Section / schedule group overlaps  
- 📚 Cross-section conflicts within the same semester  

Supports:
- Real-time validation  
- Bulk schedule creation  
- Cross-group conflict scanning  
- Conflict severity ranking  
- Stored conflict history and resolution tracking  

---

### 🏫 Academic Structure Support

- Colleges  
- Programs  
- Year levels  
- Sections  
- Semesters / Trimesters  
- School years  

Designed to support **multi-college universities** like Holy Trinity University, with future expansion in mind.

---

### 📚 Course Management

- Centralized course catalog  
- Program-based course mapping  
- Year-level and semester classification  
- Prerequisite support  
- Optimized for large seeded datasets  

---

### 🧠 Conflict Monitoring System

- Automatic detection during schedule creation  
- Cross-section and cross-program validation  
- Persistent conflict records  
- Resolution and audit tracking  
- Background-ready conflict scanning  

---

### 🔎 Activity & Audit Logs

Tracks:
- User authentication events  
- Schedule creation and updates  
- Conflict detection  
- Conflict resolution  
- Administrative approvals  

Ensures full traceability and accountability.

---

## 🛠️ Tech Stack

### Backend
- Django  
- Django REST Framework  
- PostgreSQL (Supabase)  
- Supabase Authentication  
- PostgreSQL Row Level Security (RLS)  

### Frontend
- Next.js  
- TypeScript  
- Tailwind CSS  
- shadcn/ui  
- Framer Motion  

---

## 🧩 Core Scheduling Design

- **ScheduleGroup** → Block schedule  
  *(e.g., BSIT 2A – 2nd Semester, SY 2025–2026)*

- **ScheduleItem** → Individual class meetings  
  *(course, day, time, room, instructor)*

This structure allows:
- Clean bulk creation  
- Accurate conflict detection  
- Scalable semester management  

---

## 🎯 Primary Use Case

TrinitySync is mainly focused on:

> **Semester-start scheduling**,  
> where administrators encode, validate, and finalize all class schedules before student distribution — with guaranteed conflict detection.

---

## 🔐 Security

- Supabase JWT authentication  
- Role-based API permissions  
- Database-level Row Level Security  
- Secure service-role backend integration  
- Full activity logging  

---

## 📈 Performance & Scalability

- Optimized PostgreSQL indexes  
- UUID primary keys  
- Metadata-ready schema design  
- Background task support  
- Multi-college and future-program ready  

---

## 👨‍💻 Contributors & Credits

### Main Developer / Full Stack / System Architect  
**Ayer Khali Abrio**

- System architecture  
- Backend & frontend development  
- Database modeling  
- Conflict engine design  
- Supabase integration  
- UI/UX implementation  

---

### Data Engineering & Course Dataset Encoding  
**Rhyle Ricky Bonto**

- Encoded and structured official course data  
- Organized program-based datasets  
- Inserted and validated course records used by TrinitySync  

---

## 🏫 Institution

**Holy Trinity University**

---

## 📜 License
Developed for academic and institutional use under Holy Trinity University.
