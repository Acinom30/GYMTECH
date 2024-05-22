import React, { useState } from 'react';
import gymLogo from '../../image/logo.jpg';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { db } from '../../firebase/config';
import { useUser } from '../../userContext'; 


const LoginForm = () => {
  const [title] = useState("GYMTECH");
  const [cedula, setCedula] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChangeCedula = (event) => {
    setCedula(event.target.value);
  };

  const handleChangeContraseña = (event) => {
    setContraseña(event.target.value);
  };

  const handleSubmit = async () => {
    const q = query(collection(db, 'usuarios'), where("cedula", "==", cedula));
    const querySnapshot = await getDocs(q);
    if (!cedula || !contraseña) {
      console.log('Ingrese los datos de cedula y contraseña')
      return;
    }
    if (querySnapshot.empty) {
      console.log('Usuario no encontrado.');
      return;
    } else {
      const userDocSnapshot = querySnapshot.docs[0];
      const userData = userDocSnapshot.data();
      const isMatch = await bcrypt.compare(contraseña, userData.contrasena);
      if (!isMatch) {
        console.log('La contraseña no coincide');
        return;
      }
      setUser({ rol: userData.rol }); 
    }
    navigate('/home')
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative mt-16">
      <h1 className="text-4xl font-bold mb-16">{title}</h1>
      <img src={gymLogo} alt="GYMTECH Logo" className="w-24 h-24 mb-16 sm:w-32 sm:h-32" />
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={handleChangeCedula}
        className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={handleChangeContraseña}
        className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-16 text-center"
      />
        <button onClick={handleSubmit} className="w-full sm:w-80 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full mb-16">Entrar</button>

      <Link to="/customerRegistration" className="w-full sm:w-80 border text-gray-700 font-bold py-3 px-6 rounded-full mb-6 text-center hover:border-gray-400">
        Registrar
      </Link>
    </div>
  );
};

export default LoginForm;
