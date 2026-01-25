Doc Container
Doc Container is a full-stack application designed for document management. It features a modern, separated architecture with a robust PHP backend and a reactive TypeScript frontend, all orchestrated via Docker.

🛠 Technologies Used
Backend (/api)
Framework: Laravel 12.00

Database ORM: Eloquent

Authentication: Laravel Sanctum

Testing: PHPUnit

Frontend (/spa)
Framework: React

Build Tool: Vite

Language: TypeScript

Routing: TanStack Router

Styling: CSS / Tailwind (implied by standard Vite setups)

Infrastructure
Containerization: Docker & Docker Compose

Web Server: Nginx / Apache (via Docker)

📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:

Docker Desktop

Git

🚀 Setup & Installation
Follow these steps to get the project running locally.

1. Clone the Repository
Bash

git clone https://github.com/latv/DMS.git
cd DMS

2. Environment Configuration
You need to set up environment variables for the root, the API, and the SPA.

Root:

Bash

cp .env.example .env
Backend (API):

Bash

cd api
cp .env.example .env
# Edit .env to match your database credentials defined in compose.yml
cd ..
Frontend (SPA):

Bash

cd spa
cp .env.example .env
cd ..
3. Build and Run Containers
Use Docker Compose to build the images and start the services.

Bash

docker compose up -d --build
4. Post-Installation Steps (Backend)
Once the containers are running, you need to install dependencies and set up the database within the api container.

Access the API container:

Bash

docker compose exec api bash
Run the following commands inside the container:

Bash

# Install PHP dependencies
composer install

# Generate Application Key
php artisan key:generate

# Run Database Migrations
php artisan migrate

# (Optional) Seed the database
php artisan db:seed
Exit the container:

Bash

exit
5. Access the Application
Once everything is running:

Frontend (SPA): Visit http://localhost:5173 (or the port defined in your compose.yml).

Backend (API): Visit http://localhost:8000 (or the port defined in your compose.yml).

📂 Project Structure
Plaintext

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