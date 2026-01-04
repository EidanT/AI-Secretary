import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signup from './screens/signup';
import Home from './screens/home';

import './app.css'

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
  )
}