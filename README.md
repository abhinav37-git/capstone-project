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
This project is a web application designed as an educational module platform. It provides a structured way to organize and present learning content across different subjects. Users can browse subjects and access individual modules within those subjects.

## Features
### Implemented
- ✅ Modern UI with Radix components
- ✅ Server-side rendering with Next.js
- ✅ Type-safe development with TypeScript
- ✅ Database integration with Prisma ORM
- ✅ Containerized deployment

### In Development
- 🔄 AI learning assistance
- 🔄 User authentication flows
- 🔄 Course management system
- 🔄 Learning progress tracking

- **Interactive Learning Modules**: Structured courses in IoT, Blockchain, ML, and Cloud Computing
- **Progress Tracking**: Real-time progress monitoring at course/module level (shown in `app/dashboard/page.tsx:7-53`)
- **Admin Dashboard**: Student management and analytics (shown in `app/admin/students/page.tsx:6-58`)
- **AI-Powered Assistant**: Integrated query system with GPT-2 integration (shown in `components/ai-agent.tsx:83-105`)
- **Role-Based Access**: Separate interfaces for students, teachers, and admins
- **Interactive UI Components**: Resizable panels, progress visualizations, and real-time updates
- **Student Analytics**: Track active users and course progress (shown in `components/admin/active-students.tsx:11-49`)

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
- **Next Auth** (v4.24.11)
- **Prisma ORM** (v6.4.1)
- **PostgreSQL** database
- **Python** (v3.9) AI model server

### DevOps
- **Docker** multi-stage containerization
- **ESLint** (v9)

## Project Structure

```
├── app/                 # Next.js App Router
├── components/          # React components
├── prisma/              # Database configuration
├── lib/                 # Utility functions
├── public/              # Static assets
└── ai_model_server.py   # Python AI service
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
    npm i
    uv pip install -r requirements.txt
    ```
3. Set up the environment variables (see below).
4. Run the application:
    ```bash
    npm run dev
    python ai_model_server.py
    ```
### Docker Deployment

```bash
docker compose up
```


## Contributing
Contributions are welcome! If you would like to contribute to this project, please follow these guidelines:
1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Open a pull request with a clear description of the changes.

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
