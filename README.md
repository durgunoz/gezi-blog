# Blog Platform - Full Stack Project

This project is a modern full-stack blog platform built with layered architecture, token-based authentication, and a relational database system. It includes user roles and secure API interaction between frontend and backend.

## 🔧 Technologies

### Backend
- **.NET / ASP.NET Core**
- **Entity Framework Core**
- **AutoMapper** (DTO ↔ Entity conversion)
- **MSSQL** (Relational database)
- **Swagger UI** (API documentation with CORS support)
- **Docker** (Optional: PostgreSQL for dev/testing)

### Frontend
- **Vite**
- **Axios** (for API requests)
- **Token-based authentication** (Stateless)

---

## 🧱 Architecture

### Project Layers
- `Controllers` → Expose API endpoints
- `DTOs` → Data Transfer Objects
- `Entities` → Database models
- `Mappings` → AutoMapper configurations
- `Services` → Business logic layer
- `Repositories` → Data access layer

---

## 🧩 Data Model & Relationships

### Entity Relationships:

- **Author (1) - (N) Post**
- **Post (N) - (N) Category**
- **Post (N) - (N) Tag**
- **Post (1) - (N) Comment**

Database: **MSSQL**  
PostgreSQL via Docker is available as an optional development/test environment.

---

## 🔐 Authentication & Authorization

- **JWT (stateless token)** is used for user authentication.
- Each token has an expiration time.
- If a token is deleted client-side, it can still be used until expiration (not fully secure).
- Future implementation can include **refresh tokens** and **token revocation/blacklisting**.

### Roles
- `Admin`: Full control. Can promote Readers to Authors.
- `Author`: Can create and manage their own posts.
- `Reader`: Can browse and read posts.

---

## ⚙️ Setup & Running

### Backend

dotnet restore
dotnet ef database update
dotnet run


###Docker (Optional - PostgreSQL)
docker-compose up -d

###Frontend
cd frontend
npm install
npm run dev



Swagger UI
https://localhost:{port}/swagger/index.html

Swagger UI is configured with CORS support, so it can be used for testing and documenting API endpoints.

