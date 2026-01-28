# Doc Container

**Doc Container** is a full-stack application designed for document management. It features a modern, separated architecture with a robust PHP backend and a reactive TypeScript frontend, all orchestrated via Docker.

## 🛠 Technologies Used

### Backend (`/api`)

* **Framework:** Laravel 12.x
* **Database ORM:** Eloquent
* **Authentication:** Laravel Sanctum
* **Testing:** PHPUnit

### Frontend (`/spa`)

* **Framework:** React
* **Build Tool:** Vite
* **Language:** TypeScript
* **Routing:** TanStack Router
* **Styling:** Tailwind CSS

### Infrastructure

* **Containerization:** Docker & Docker Compose
* **Web Server:** Nginx / Apache (via Docker)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)

---

## 🚀 Setup & Installation

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/latv/DMS.git
cd DMS

```

### 2. Environment Configuration

You need to set up environment variables for the root, the API, and the SPA.

**Root:**

```bash
cp .env.example .env

```

**Backend (API):**

```bash
cd api
cp .env.example .env
# Edit .env to match your database credentials defined in compose.yml
cd ..

```

**Frontend (SPA):**

```bash
cd spa
cp .env.example .env
cd ..

```

### 3. Build and Run Containers

Use Docker Compose to build the images and start the services.

```bash
docker compose up -d --build

```

### 4. Post-Installation Steps (Backend)

Once the containers are running, you need to install dependencies and set up the database within the API container.

**Access the API container:**

```bash
docker compose exec api bash

```

**Run the following commands inside the container:**

```bash
# Install PHP dependencies
composer install

# Generate Application Key
php artisan key:generate

# Run Database Migrations
php artisan migrate

# (Optional) Seed the database
php artisan db:seed

```

**Exit the container:**

```bash
exit

```

### 5. Access the Application

Once everything is running(depends how is configurated in `compose.yml` file):

* **Frontend (SPA):** Visit [http://localhost:3000]
* **Backend (API):** Visit [http://localhost:8000]

---

## 📂 Project Structure

```plaintext
├── api/             # Laravel Backend Application
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   └── routes/
├── spa/             # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── hooks/
│   ├── public/
│   └── vite.config.ts
├── compose.yml      # Docker Compose configuration
└── README.md        # Project Documentation

```

---
## 🧪 Running Tests
Backend feature test
```bash
docker compose exec api php artisan test
```


*This 'README.md' file was generated with the assistance of AI. And edited by author*