import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './userContext';
import LoginForm from './components/auth/loginForm';
import RegisterForm from './components/user/registerForm';
import ViewClients from './components/list/viewClients';
import Home from './components/general/home';
import SelectUserEvaluation from './components/evaluations/selectUserEvaluation';
import AssignEvaluation from './components/evaluations/assignEvaluation';
import AddRoutine from './components/routine/addRoutine';
import SelectUserRoutine from './components/routine/selectUserRoutine';
import UserUpdate from './components/user/userUpdate';
import AddExercise from './components/exercises/addExercise';
import EditExercise from './components/exercises/editExercise';
import ExercisesList from './components/exercises/exerciseList';
import CustomerRegistration from './components/customers/customerRegistration';
import EditRoutine from './components/routine/editRoutine';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/viewListClients" element={<ViewClients />} />
          <Route path="/home" element={<Home />} />
          <Route path="/selectUserEvaluation" element={<SelectUserEvaluation />} />
          <Route path="/assignEvaluation" element={<AssignEvaluation />} />
          <Route path='/addRoutine' element={<AddRoutine />} />
          <Route path='/selectUserRoutine' element={<SelectUserRoutine />} />
          <Route path='/userUpdate' element={<UserUpdate />} />
          <Route path="/addExercises" element={<AddExercise />} /> 
          <Route path="/editExercises" element={<ExercisesList />} />
          <Route path="/editExercise/:id" element={<EditExercise />} />
          <Route path="/customerRegistration" element={<CustomerRegistration />} />
          <Route path="/editRoutine" element={<EditRoutine />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
