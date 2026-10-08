# EMPLOYEE APP

## Project File Structure

atalkaray-2-0/
│
├── public/
│   └── vite.svg
│
├── src/
│   │
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Toast.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EmployeeAttendance.jsx
│   │   ├── LeaveRequests.jsx
│   │   ├── SalesAttendance.jsx
│   │   ├── SalesExpenses.jsx
│   │   ├── SalesLocation.jsx
│   │   ├── SalesPersonDescription.jsx
│   │   └── Settings.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── node_modules/


### Folder Description

| Folder / File      | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `public/`          | Static public assets                       |
| `src/assets/`      | Images and frontend assets                 |
| `src/components/`  | Reusable UI components                     |
| `src/context/`     | Authentication and global context          |
| `src/hooks/`       | Reusable React hooks                       |
| `src/layouts/`     | Main application layout                    |
| `src/pages/`       | Application screens/modules                |
| `App.jsx`          | Main routing and application configuration |
| `main.jsx`         | React application entry point              |
| `index.css`        | Global CSS / Tailwind styles               |
| `package.json`     | Project dependencies and scripts           |
| `vite.config.js`   | Vite configuration                         |
| `eslint.config.js` | ESLint configuration                       |
| `README.md`        | Project documentation                      |

### Main Page Modules

- **Login** — User authentication
- **Dashboard** — Employee dashboard
- **Employee Attendance** — Check-in, check-out and attendance history
- **Leave Requests** — Leave creation and history
- **Sales Attendance** — Salesperson attendance details
- **Sales Expenses** — Expense creation and expense history
- **Sales Location** — Map, route and location tracking
- **Sales Person Description** — Field activity descriptions
- **Settings** — Application settings placeholder

## Project Report

### 1. Project Overview

| Item           | Details                                 |
| -------------- | --------------------------------------- |
| Project Name   | `atalkaray-2-0`                         |
| Project Type   | Employee Self-Service Frontend          |
| Frontend       | React 19                                |
| Build Tool     | Vite 8                                  |
| Styling        | Tailwind CSS 4                          |
| Routing        | React Router 8                          |
| Authentication | Mock Authentication + localStorage      |
| Data Storage   | Browser localStorage + Mock Data        |
| Backend/API    | Not Implemented                         |
| Map            | Leaflet + React Leaflet + OpenStreetMap |
| Notifications  | Global Toast System                     |

**Project Objective:**
The application provides an employee-oriented interface for attendance, leave requests, expenses, sales attendance, sales tracking, and field-activity descriptions.

**Current Status:**
The application is a functional frontend prototype using mock/localStorage data. It is not production-ready for secure authenticated data or cross-user authorization.

---

# 2. Main Modules

| Module                    | Status              | Description                                               |
| ------------------------- | ------------------- | --------------------------------------------------------- |
| Login / Authentication    | Mock                | Local mock login and user restoration                     |
| Employee Dashboard        | Partially Completed | Personal attendance, leave and expense summaries          |
| Employee Attendance       | Mock                | Check-in, check-out, history and working-time calculation |
| Leave Requests            | Mock                | Leave submission, validation and history                  |
| Sales Attendance          | Mock                | Daily salesperson attendance display                      |
| Sales Expenses            | Mock                | Add/view expenses and upload receipts                     |
| Sales Location / Tracking | Mock / Manual       | Map, route and tracking-point display                     |
| Sales Person Description  | Mock / localStorage | Field notes linked to salesperson/date/location           |
| Sidebar                   | Completed           | Fixed responsive navigation                               |
| Header                    | Completed           | Route-based page title                                    |
| Toast Notifications       | Completed           | Success, error, warning and info notifications            |
| Protected Routes          | Completed           | Frontend authentication-based route protection            |
| Settings                  | Pending             | Coming-soon placeholder                                   |

---

# 3. Employee Dashboard

The Dashboard is designed as a **personal employee dashboard**, not an Admin Dashboard.

### Features

- Employee greeting
- Employee name and ID
- Current date
- Today's attendance
- Check-in / Check-out
- Monthly attendance summary
- Leave summary
- Quick actions
- Conditional salesperson summary

Attendance, leave and expense records are associated with the authenticated employee key in frontend storage. This provides UI-level filtering only and is **not server-side security**.

---

# 4. Employee Attendance

### Features

- Check In
- Check Out
- Working hours calculation
- Break-time deduction
- Overtime calculation
- Attendance status
- Monthly summary
- Attendance history
- Employee-specific records
- localStorage persistence

### Business Logic

- Standard working time: **480 minutes**
- Overtime is calculated for time exceeding 480 minutes.
- Duplicate check-in is prevented.
- Check-out is available only after check-in.
- Attendance records are stored using an employee-specific localStorage key.

---

# 5. Leave Management

### Leave Form

The form supports:

- Leave Type
- Start Date
- End Date
- Reason

### Validation

The system validates:

- Required dates
- Required reason
- Start date cannot be in the past
- End date cannot be before start date
- Date range must contain at least one weekday
- Saturday and Sunday are excluded from working-day calculation

New leave requests are initially stored with **Pending** status.

---

# 6. Sales Attendance

Sales Attendance currently provides a **read-only daily attendance view**.

### Available Features

- Salesperson selection
- Date selection
- Check-in time
- Check-out time
- Working time
- Attendance status

### Not Implemented

- Check-in action
- Check-out action
- Attendance persistence
- Attendance history
- Map/tracking functionality

The source specifically separates Sales Attendance from Sales Location/Tracking.

---

# 7. Sales Expenses

### Expense Features

- Expense listing
- Add Expense
- Expense category
- Amount
- Description
- Payment method
- Receipt upload
- Expense status
- Created date

### Expense Categories

- Travel
- Fuel
- Food
- Hotel/Stay
- Parking
- Toll
- Customer Meeting
- Other

### Payment Methods

- Cash
- Card
- UPI
- Other

### Receipt

- PDF or image
- Maximum size: **1 MB**
- Stored as a data URL in localStorage

New expenses receive **Pending** status.

**Payroll and salary processing are not implemented in the frontend.**

---

# 8. Sales Location / Tracking

The Sales Location module provides a mock map and route-tracking interface.

### Features

- Salesperson filter
- Date filter
- Tracking points
- Start location
- End location
- Editable location names
- Route/polyline
- Numbered markers
- Activity list
- Map popups
- Distance calculation
- Last-location information
- Activity descriptions

### Map Technology

- Leaflet
- React Leaflet
- OpenStreetMap tiles

### Current Limitation

Tracking is **static/mock data**. Start and End locations are manually selected and stored in localStorage.

There is currently:

- No real GPS
- No browser geolocation
- No live tracking
- No backend tracking API

---

# 9. Sales Person Description

The system allows field/activity notes to be associated with:

- Salesperson
- Date
- Time
- Selected tracking location

### Features

- Required description
- Maximum 500 characters
- Location association
- Timestamp
- Chronological history
- localStorage persistence
- Toast notifications

These descriptions belong to the **Sales Location / Tracking** module rather than Sales Attendance.

---

# 10. Authentication

### Current Implementation

Authentication is currently mock/localStorage based.

The login:

- Accepts non-empty credentials
- Performs browser email validation
- Creates a sample user
- Stores authentication information locally
- Restores the user from localStorage
- Supports logout
- Removes password information from restored user data

### Important

This is **not real backend authentication**.

The current mock user is created with:

`{ id: 1, email, name: "User" }`

---

# 11. Application Routing

| Route                  | Access    | Page                | Status      |
| ---------------------- | --------- | ------------------- | ----------- |
| `/login`               | Public    | Login               | Active      |
| `/dashboard`           | Protected | Employee Dashboard  | Active      |
| `/employee-attendance` | Protected | Employee Attendance | Active      |
| `/leave-requests`      | Protected | Leave Requests      | Active      |
| `/sales-attendance`    | Protected | Sales Attendance    | Active      |
| `/sales-expenses`      | Protected | Sales Expenses      | Active      |
| `/sales-location`      | Protected | Sales Location      | Active      |
| `/settings`            | Protected | Settings            | Placeholder |
| `/`                    | Redirect  | Dashboard           | Active      |
| `*`                    | Redirect  | Dashboard           | Active      |

Protected pages are controlled through `ProtectedRoute` and `MainLayout`.

---

# 12. UI / Layout

### Main Layout

The application contains:

- Sidebar
- Header
- Main content area
- Nested routes
- Blur overlay

### Sidebar

- Collapsed width: 52px
- Expanded width: 256px
- Hover-based expansion
- Lucide icons
- Animated opening/closing
- Logout action

### Header

- Fixed 72px header
- Route-based title

### Responsive Design

Tailwind responsive classes are used throughout the application.

A limitation is that the sidebar relies on hover behavior, so touch-only devices may not receive the same expanded-label interaction.

---

# 13. Toast Notification System

The global Toast system supports:

- Success
- Error
- Warning
- Info
- Auto-dismiss
- Manual close
- Animation
- Multiple simultaneous notifications
- Responsive positioning

The Toast Provider is mounted globally around the application's routes.

---

# 14. Technology Stack

| Technology    | Version | Purpose                          |
| ------------- | ------: | -------------------------------- |
| React         |  19.2.8 | UI Framework                     |
| React DOM     |  19.2.8 | Browser Rendering                |
| Vite          |   8.3.0 | Build Tool                       |
| React Router  |   8.4.0 | Routing                          |
| Tailwind CSS  |   4.3.3 | Styling                          |
| Leaflet       |   1.9.4 | Map                              |
| React Leaflet |   5.0.0 | React Map Integration            |
| Lucide        |  1.52.0 | Icons                            |
| Motion        |  14.0.0 | Installed but not currently used |
| ESLint        | 10.10.0 | Code Quality                     |

---

# 15. Data Storage

| Module             | Data Source             | Persistence  | Backend |
| ------------------ | ----------------------- | ------------ | ------- |
| Authentication     | Mock user               | localStorage | No      |
| Attendance         | Mock + user actions     | localStorage | No      |
| Leave              | User submissions        | localStorage | No      |
| Sales Attendance   | Static mock data        | No           | No      |
| Sales Expenses     | User records            | localStorage | No      |
| Sales Tracking     | Static mock coordinates | No           | No      |
| Tracking Endpoints | Manual selections       | localStorage | No      |
| Sales Descriptions | User notes              | localStorage | No      |

### Security Note

localStorage-based employee isolation is **not backend authorization**. Users can inspect or modify browser storage and client-side state.

---

# 16. Current Limitations

### High Priority

1. No backend/API integration
2. Mock authentication
3. No server-side authorization
4. Salesperson selectors are not user-scoped
5. Employee identity is mock-based
6. Attendance is not connected to backend
7. Leave is not connected to backend
8. Expenses are not connected to backend

### Medium Priority

1. Sales Attendance is read-only
2. No real GPS tracking
3. Sales tracking uses static data
4. Settings page is incomplete
5. Automated tests are not available

### Low Priority

1. README still contains Vite starter documentation
2. Unused dependencies/assets should be reviewed

---

# 17. Future Development

| Priority | Task                                              | Module           |
| -------- | ------------------------------------------------- | ---------------- |
| High     | Restrict salesperson selectors to authorized user | Sales            |
| High     | Implement real authentication                     | Authentication   |
| High     | Connect attendance to backend                     | Attendance       |
| High     | Connect leave to backend                          | Leave            |
| High     | Connect expenses and receipts to backend          | Expenses         |
| Medium   | Add sales attendance actions/history              | Sales Attendance |
| Medium   | Replace static tracking with authorized data      | Sales Location   |
| Medium   | Add GPS tracking if required                      | Sales Location   |
| Medium   | Implement Settings                                | Settings         |
| Medium   | Add automated frontend tests                      | QA               |
| Low      | Replace starter README                            | Documentation    |
| Low      | Review unused dependencies                        | Maintenance      |

---

# 18. QA / Testing Status

| Area                     | Status           |
| ------------------------ | ---------------- |
| Production Build         | Passed           |
| Full Lint                | Passed           |
| Sidebar Lint             | Passed           |
| Automated Tests          | Not Available    |
| Authentication Manual QA | Partially Tested |
| Employee Workflow QA     | Partially Tested |
| Sales Location QA        | Partially Tested |
| Sidebar QA               | Passed           |
| Responsive QA            | Partially Tested |

### Known Issues

- Sales Attendance exposes both mock salespeople.
- Sales Location exposes both mock salespeople.
- Mock login displays `User`.
- No project-owned automated test suite exists.

---

# 19. Business Rules

| Module                 | Business Rule                                               |
| ---------------------- | ----------------------------------------------------------- |
| Employee Dashboard     | Shows personal employee information and summaries           |
| Employee Attendance    | Employee's own attendance actions/history                   |
| Sales Attendance       | Attendance details only                                     |
| Sales Location         | Tracking, route, endpoint and field activity                |
| Sales Description      | Field notes belong to Sales Location                        |
| Sales Expense          | Company-related salesperson expenses                        |
| Payroll                | Not implemented                                             |
| Data Visibility        | Employee-keyed frontend filtering only                      |
| Salesperson Visibility | Dashboard has ID matching; sales selectors currently do not |

---

# 20. Final Project Status

| Category            | Current Status                |
| ------------------- | ----------------------------- |
| Authentication      | Mock / localStorage           |
| Dashboard           | Partially Completed           |
| Attendance          | Mock / Functional Local Flow  |
| Leave               | Mock / Functional Local Flow  |
| Sales Attendance    | Partially Completed           |
| Sales Expenses      | Mock / Functional Local Flow  |
| Sales Tracking      | Mock / Manual                 |
| Description         | Mock / localStorage           |
| UI/UX               | Partially Completed           |
| Responsive Design   | Partially Completed           |
| Toast               | Completed                     |
| Routing             | Completed                     |
| Backend Integration | Not Implemented               |
| Overall Status      | Functional Frontend Prototype |

## Final Conclusion

The Employee App currently provides a functional frontend prototype for employee attendance, leave management, expenses, sales attendance, sales tracking and field descriptions.

The major remaining requirement is **backend integration**. Real authentication, server-side authorization, persistent shared data, employee/salesperson ownership, expense approval/reimbursement status and authoritative tracking data must be implemented before the application can be considered production-ready.

**Overall assessment: Functional prototype — Backend integration and security implementation pending.**
