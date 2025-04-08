# Capstone Project Documentation: Educational Module Platform

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Data Structures](#data-structures)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [Setup Instructions](#setup-instructions)
- [Web App Demonstation](#web-app-demonstration)

## Introduction
This project is a web application designed as an educational module platform. It provides a structured way to organize and present learning content across different subjects. The platform supports multiple user roles (Admin, Teacher, Student) with role-specific features and access controls.

## Features
### Implemented
- ✅ Modern UI with Radix components
- ✅ Server-side rendering with Next.js
- ✅ Type-safe development with TypeScript
- ✅ Database integration with Prisma ORM
- ✅ Role-based authentication system
- ✅ Teacher management system
- ✅ Course creation and management
- ✅ Student enrollment system
- ✅ Progress tracking
- ✅ Containerized deployment

### In Development
- 🔄 AI learning assistance
- 🔄 Advanced analytics dashboard
- 🔄 Real-time notifications
- 🔄 Content management system

### Key Features
- **Role-Based Access Control**:
  - Admin: Full system access, teacher management, student oversight
  - Teacher: Course creation, content management, student progress tracking
  - Student: Course enrollment, progress tracking, content access

- **Course Management**:
  - Create and manage courses with modules
  - Structured content organization
  - Progress tracking at course and module levels
  - Student enrollment management

- **Teacher Management**:
  - Admin-controlled teacher accounts
  - Teacher performance monitoring
  - Course assignment and management

- **Student Features**:
  - Course enrollment
  - Progress tracking
  - Module completion status
  - Learning path visualization

## Technologies Used
### Frontend
- **Next.js** (v15.1.6) with App Router
- **React** (v19.0.0)
- **TypeScript** (v5)
- **TailwindCSS** (v3.4.1)
- **Radix UI** components
- **Framer Motion** (v12.0.6)

### State Management & Forms
- **Zustand** (v5.0.3)
- **React Hook Form** (v7.54.2)
- **Zod** (v3.24.1) for validation

### Backend & Data
- **Next Auth** (v4.24.11) for authentication
- **Prisma ORM** (v6.4.1)
- **PostgreSQL** database
- **Python** (v3.9) AI model server

### DevOps
- **Docker** multi-stage containerization
- **ESLint** (v9)

## Project Structure
```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard and features
│   ├── teacher/           # Teacher dashboard and features
│   ├── dashboard/         # Student dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── teacher/          # Teacher-specific components
│   └── ui/               # Shared UI components
├── prisma/               # Database configuration
├── lib/                  # Utility functions
├── public/               # Static assets
└── ai_model_server.py    # Python AI service
```

## Installation
### Prerequisites
- Node.js (v18+)
- Python (v3.9+) for AI service
- Docker and Docker Compose
- PostgreSQL database

1. Clone the repository:
    ```bash
    git clone https://github.com/Komallsood/capstone-project.git
    ```
2. Install the required dependencies:
    ```bash
    npm install
    ```
3. Set up the environment variables (see Environment Variables section)
4. Initialize the database:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
5. Run the development server:
    ```bash
    npm run dev
    ```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Docker Deployment
```bash
docker compose up --build
```

## API Endpoints
### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/session` - Get current session

### Admin
- GET `/api/admin/teachers` - List all teachers
- POST `/api/admin/teachers` - Create new teacher
- PUT `/api/admin/teachers/:id` - Update teacher
- DELETE `/api/admin/teachers/:id` - Delete teacher

### Courses
- GET `/api/courses` - List all courses
- POST `/api/courses` - Create new course
- GET `/api/courses/:id` - Get course details
- PUT `/api/courses/:id` - Update course
- DELETE `/api/courses/:id` - Delete course

### Students
- GET `/api/students` - List all students
- GET `/api/students/:id` - Get student details
- POST `/api/students/:id/enroll` - Enroll student in course

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Setup Instructions

1. **Create and Activate a Virtual Environment**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
2. **Install Required Python Packages**
    See the `requirements.txt` file available with the following content:
    ```plaintext
    Flask
    Flask-CORS
    transformers
    ```
    Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. **Download and Save the GPT-2 Model Locally**
    Create a script named `download_model.py`:
    ```python
    from transformers import GPT2LMHeadModel, GPT2Tokenizer

    model_name = "gpt2"
    model = GPT2LMHeadModel.from_pretrained(model_name)
    tokenizer = GPT2Tokenizer.from_pretrained(model_name)

    model.save_pretrained("./model")
    tokenizer.save_pretrained("./model")
    ```
    Run the script to download the model:
    ```bash
    python download_model.py
    ```
    ![GPT-2 Model Setup](assets/gpt2_download.png)


4. **Set Up the Flask Server**
    Create a script named `ai_model_server.py`:
    ```python
    from flask import Flask, request, jsonify
    from transformers import GPT2LMHeadModel, GPT2Tokenizer

    app = Flask(__name__)
    model = GPT2LMHeadModel.from_pretrained("./model")
    tokenizer = GPT2Tokenizer.from_pretrained("./model")

    @app.route('/generate', methods=['POST'])
    def generate():
        input_text = request.json.get('input_text')
        inputs = tokenizer.encode(input_text, return_tensors='pt')
        outputs = model.generate(inputs, max_length=50)
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return jsonify({'generated_text': generated_text})

    if __name__ == '__main__':
        app.run(port=5000)
    ```
    Run the Flask server:
    ```bash
    python ai_model_server.py
    ```
    ![Flask Server Running](assets/flask_server.png)

5. **Run the React Application**
    Ensure the React application is correctly configured to interact with the Flask server. Start the React application:
    ```bash
    npm start
    ```
    ![React Application Running](assets/react_app.png)


### Web App Demonstration

#### Login Page
![Login Page](assets/login_page.png)

#### Student Login
![Student Login](assets/student_login.png)

#### Module Dashboard
![Dashboard](assets/dashboard_page.png)

#### Enrolled Subjects Panel
![Module Content](assets/enrolled_subjects.png)

#### Troubleshoot chat window
![Troubleshoot](assets/troubleshoot.png)

### AI Agent query window
![AI Agent](assets/ai_agent_ui.png)
