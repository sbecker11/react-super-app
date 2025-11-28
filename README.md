# React Web Application

A React-based single-page application built with Create React App, featuring routing, authentication forms, and a job description analyzer.

## 📋 Project Overview

This web application includes:
- **Routing**: React Router for navigation between pages
- **Components**: Header, Footer, Sidebar (Left), Home, About, Login/Register
- **Features**: 
  - User authentication form with validation (using Yup)
  - Job Description Analyzer component (in development)
  - Responsive layout with header, sidebar, and footer

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 14.0 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

You can check if you have Node.js installed by running:
```bash
node --version
npm --version
```

### Installation Steps

1. **Navigate to the project directory** (if not already there):
   ```bash
   cd /Users/sbecker11/workspace-react/react-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   This will install all required packages including:
   - React & React DOM
   - React Router DOM
   - React Scripts (build tools)
   - Yup (form validation)
   - Testing libraries

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   - The app will automatically open at [http://localhost:3000](http://localhost:3000)
   - The page will reload automatically when you make changes

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.js          # Top navigation header
│   ├── Footer.js          # Footer component
│   ├── Left.js            # Left sidebar navigation
│   ├── Home.js            # Home page component
│   ├── About.js           # About page component
│   ├── LoginRegister.js   # Login/Register form with validation
│   └── JDAnalyzer.js      # Job Description Analyzer (in development)
├── services/              # API services (currently empty)
├── App.js                 # Main app component with routing
├── App.css                # Main app styles
├── index.js               # Application entry point
└── index.css              # Global styles
```

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).  
The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.  
See the [testing documentation](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.  
The build is optimized and minified for best performance. Ready for deployment!

### `npm run eject`
**⚠️ Warning: This is a one-way operation!**  
Ejects from Create React App configuration. You won't be able to go back!

## 🔍 Current Routes

The application has the following routes:
- `/` or `/home` - Home page
- `/about` - About page
- `/login-register` - Login/Register form

## 📝 Key Features

### Login/Register Form
- Form validation using Yup schema
- Email validation
- Password requirements:
  - At least 8 characters
  - Must contain an uppercase letter
  - Must contain a number
  - Must contain a special character (!@#$%^&*)
- Error messages displayed inline

### Navigation
- Header navigation links
- Sidebar navigation
- React Router for client-side routing

## ⚠️ Known Issues / TODO

1. **JDAnalyzer Component**: Basic form implemented, but analysis functionality needs to be added
   - Form structure is complete with all fields
   - Word analysis and JD comparison features to be implemented

2. **Services Folder**: Empty - API integration needed for backend services

3. **Authentication**: Login/Register form currently only validates client-side, no backend integration

## 🔧 Troubleshooting

### Issue: `npm start` fails with errors
**Solution**: Make sure you've run `npm install` first to install all dependencies.

### Issue: Port 3000 is already in use
**Solution**: You can specify a different port:
```bash
PORT=3001 npm start
```

### Issue: Dependencies out of sync
**Solution**: Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🆕 How to Create a React App from Scratch

For detailed instructions on creating a new React application from scratch using different methods (Create React App, Vite, Next.js, or manual setup), please see the comprehensive guide:

👉 **[CREATE-REACT-APP-GUIDE.md](./CREATE-REACT-APP-GUIDE.md)**

This guide includes:
- Step-by-step instructions for all methods
- Comparison tables and recommendations
- Prerequisites and troubleshooting tips
- Next steps after creating an app

---

## 📚 Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Yup Validation Documentation](https://github.com/jquense/yup)
- [Vite Documentation](https://vitejs.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

This project is private.

---

**Note**: Fixed `react-scripts` version issue (was set to 0.0.0, now set to 5.0.1) and removed duplicate/invalid package entry.
