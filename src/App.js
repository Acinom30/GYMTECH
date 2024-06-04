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
import CustomerRegistration from './components/customers/CustomerRegistration';
import EditRoutine from './components/routine/editRoutine';
import EditEvaluation from './components/evaluations/editEvaluation'
import ViewLatestEvaluation from './components/evaluations/viewLatestEvaluation';
import ViewLatestRoutine from './components/routine/viewLatestRoutine';
import AddCategory from './components/category/addCategory';
import CategoriesList from './components/category/categoriesList';
import EditCategory from './components/category/editCategory';

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
          <Route path="/editEvaluation" element={<EditEvaluation />} />
          <Route path="/viewLatestEvaluation" element={<ViewLatestEvaluation />} />
          <Route path="/viewLatestRoutine" element={<ViewLatestRoutine />} />
          <Route path="/addCategory" element={<AddCategory />} />
          <Route path="/categoriesList" element={<CategoriesList />} />
          <Route path="/editCategory/:id" element={<EditCategory />} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
