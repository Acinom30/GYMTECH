import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/auth/loginForm';
import RegisterForm from './components/auth/registerForm';
import ViewClients from './components/list/viewClients';
import Home from './components/general/home';
import SelectUserEvaluation from './components/evaluations/selectUserEvaluation';
import AssignEvaluation from './components/evaluations/assignEvaluation';
import AddExercise from './components/exercises/addExercise';
import AddRoutine from './components/routine/addRoutine'

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
        <Route path='/addExercise' element={<AddExercise />} />
        <Route path='/addRoutine' element={<AddRoutine />} />

      </Routes>
    </Router>
  );
}

export default App;
