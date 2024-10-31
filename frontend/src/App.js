import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Connexion/Login';
import Register from './components/Connexion/Register';
import ProtectedRoutes from './components/Connexion/ProtectedRoutes';
import { UserProvider } from './components/Connexion/UserProvider';
import NotFoundPage from "./components/Connexion/Error Pages/NotFoundPage";
import ForgotPassword from './components/Connexion/ForgotPassword';
import ResetPassword from './components/Connexion/ResetPassword';
import SelectionClient from './components/Dashboard/SelectionClient';
const App = () => {
  return (
    <UserProvider>
      <Router>  
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/selection-client" element={<SelectionClient />} />
          <Route path="/*" element={<ProtectedRoutes />} />
          <Route path="/forget_pass" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> 
         

          {/* Page NotFound */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Redirection vers /404 si aucune route ne correspond */}
          <Route path="*" element={<Navigate to="/404" />} />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
