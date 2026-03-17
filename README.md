# Tasks Offline

## Project Overview
An "Offline-First" task management application following Kolibri's design principles, optimized for low-connectivity environments.

### 1. Architecture & Backend (The Engine)
- **Framework**: Django 6.0 & Django REST Framework (DRF).
- **Persistence Layer**: SQLite for local, portable residency.
- **Data Modeling**: `Task` model with automated audit fields (`auto_now_add`).
- **RESTful API**: ModelViewSets and Routers for standardized CRUD endpoints.

### 2. Frontend & User Interface (The Shell) - *Upcoming*
- **Framework**: Vue.js 3 (Composition API) + Vite.
- **Communication**: Shared state management and Axios for API consumption.
- **Styling**: Modern, low-resource UI focus.
