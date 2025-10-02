# Task Management Application

## 🚀 Introduction

The **Task Management Application** is a web-based productivity tool designed to help users organize, track, and manage tasks efficiently. Built using **React 19, MongoDB, TailwindCSS, and React Query**, this app provides a seamless user experience with drag-and-drop functionality, real-time updates, and cloud storage.

> **Note:** This project is inspired by [kamalnathdhekwar/Task-Manager](https://github.com/kamalnathdhekwar/Task-Manager).

## 📑 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Environment Variables](#-environment-variables)
- [Dependencies](#-dependencies)
- [Development](#-development)
- [Build and Deployment](#-build-and-deployment)
- [Contributors](#-contributors)

## ✨ Features

- 📝 **Task Management** – Create, update, and delete tasks.
- 📂 **Drag and Drop Support** – Organize tasks effortlessly.
- 🍃 **MongoDB Integration** – Real-time data syncing.
- 🎨 **TailwindCSS & DaisyUI** – Beautiful and responsive UI.
- 🔍 **Search & Sort** – Quickly find and sort tasks.
- 🔔 **Notifications** – Get real-time updates.
- 🌐 **Deployed on Vercel** – Fast and scalable hosting.

## 🛠 Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/kamalnathdhekwar/Task-Manager.git
   cd Task-Manager
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the root directory and add the following:

   ```env
   MONGODB_URI=your-mongodb-connection-string
   VITE_URL=your-app-url
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

## 🎮 Usage

1. Open the app in your browser at `http://localhost:5173/`.
2. Sign in or register (authentication method depends on your implementation).
3. Add, edit, or delete tasks.
4. Drag and drop tasks to change their order.
5. Get real-time updates and notifications.

## 🔑 Environment Variables

Ensure you configure the following variables in your `.env` file:

| Variable       | Description                        |
| -------------- | ---------------------------------- |
| `MONGODB_URI`  | MongoDB connection string          |
| `VITE_URL`     | Deployment URL (e.g., Vercel)      |

## 📦 Dependencies

This project uses the following dependencies:

### ✅ Main Dependencies:

- **React 19** – Frontend library
- **MongoDB** – Database
- **React Query** – Data fetching and state management
- **React Router** – Routing management
- **TailwindCSS & DaisyUI** – UI framework
- **Axios** – HTTP requests
- **React Hook Form** – Form management
- **React Toastify** – Notifications
- **AOS** – Animations
- **LocalForage** – Local storage handling

### 🛠 Dev Dependencies:

- **Vite** – Build tool
- **ESLint** – Linter for code quality
- **DaisyUI** – UI components
- **Types for React & ReactDOM** – TypeScript support

## 🏗 Development

- Start the development server:
  ```sh
  npm run dev
  ```
- Run the linter:
  ```sh
  npm run lint
  ```
- Build the project:
  ```sh
  npm run build
  ```
- Preview production build:
  ```sh
  npm run preview
  ```

## 🚀 Build and Deployment

The app is deployed on **Vercel**. To deploy manually:

1. Build the project:
   ```sh
   npm run build
   ```
2. Deploy to Vercel:
   ```sh
   vercel --prod
   ```

## 👥 Contributors

- **Inspired by [kamalnathdhekwar/Task-Manager](https://github.com/kamalnathdhekwar/Task-Manager)**

---

Enjoy using **Task Management Application**! 🚀🎯

### Let me know if you need any modifications! 🚀