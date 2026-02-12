import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Signup from './screens/signup';
import Home from './screens/home';

import './App.css'




export default function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));

  const syncAuth = () => {
    setUser(localStorage.getItem("user"));
  };

  return (
      <Router>
        <Routes>
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/" replace /> : <Signup onLogin={syncAuth} /> 
            } 
          />

          <Route 
            path="/" 
            element={
              user ? <Home onLogout={syncAuth} /> : <Navigate to="/signup" replace />
            } 
          />
        </Routes>
      </Router>
  )
}