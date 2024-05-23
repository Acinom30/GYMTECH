import React, { useEffect, useState } from 'react';
import Header from './navigationMenu';
import gymLogo from '../../image/logo.jpg';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Home = () => {
    const location = useLocation();
    const cedula = location.state?.cedula;


    return (
        <div>
            <Header />
            <div className='text-center text-extrabold'>
                <h1 className='text-black text-4xl font-extrabold tracking-tight'>Sistema de Gestión de Rutinas</h1>
                <br />
                <br />
            </div>
            <div className='flex items-center justify-center'>
                <img src={gymLogo} alt="GYMTECH Logo" className="w-60 h-60 mb-16 sm:w-68 sm:h-68" />
            </div>
        </div>
    );
};

export default Home;
