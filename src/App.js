import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/auth/loginForm';
import RegisterForm from './components/auth/registerForm';
import ViewClients from './components/list/viewClients';
import Home from './components/general/home';
import SelectUserEvaluation from './components/evaluations/selectUserEvaluation';
import AssignEvaluation from './components/evaluations/assignEvaluation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/viewListClients" element={<ViewClients />} />
        <Route path="/home" element={<Home />} />
        <Route path="/selectUserEvaluation" element={<SelectUserEvaluation />} />
        <Route path="/assignEvaluation" element={<AssignEvaluation />} />

        assignEvaluation
      </Routes>
    </Router>
  );
}

export default App;
