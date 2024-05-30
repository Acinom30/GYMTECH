import React, { useEffect, useState } from 'react';
import Header from './navigationMenu';
import ToastifyError from '../ui/toastify/toastifyError';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(() => {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    });

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(results));
    }, [results]);

    const handleSearch = async () => {
        const [firstName, lastName] = searchTerm.split(' ');
        if (!firstName || !lastName) {
            ToastifyError('Por favor, ingrese tanto el nombre como los apellidos');
            return;
        }
        const q = query(collection(db, 'usuarios'), where('primerNombre', '==', firstName), where('primerApellido', '==', lastName));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            ToastifyError('Usuario no encontrado.');
            setResults([]);
        } else {
            const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResults(prevResults => [...prevResults, ...users.filter(user => !prevResults.some(r => r.id === user.id))]);
        }
    }

    const handleBorrar = (id) => {
        setResults(results.filter(user => user.id !== id))
    }

    const handleVerRutina = (id) => {
        navigate(`/rutina`, { state: { clientId: id }});
    };

    return (
        <div>
            <Header />
            <div className='text-center text-extrabold'>
                <h1 className='text-black text-4xl font-extrabold tracking-tight'>Sistema de Gestión de Rutinas</h1>
            </div>
            <br />
            <div className='flex items-center justify-center mt-8'>
                <div className='relative w-full max-w-md'>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:border-yellow-500'
                        placeholder="Buscar por nombre y apellidos"
                    />
                    <i className='fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                </div>
                <button
                    onClick={handleSearch}
                    className='ml-4 py-2 px-4 bg-yellow-500 text-white font-bold rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50'
                >
                    Buscar
                </button>
            </div>
            <br />
            <div className='mt-8 px-8'>
                {results.length > 0 && (
                    <table className='min-w-full bg-white border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='py-2 px-4 border-b text-center'>Nombre</th>
                                <th className='py-2 px-4 border-b text-center'>Apellidos</th>
                                <th className='py-2 px-4 border-b text-center'>Cédula</th>
                                <th className='py-2 px-4 border-b text-center'>Estado</th>
                                <th className='py-2 px-4 border-b text-center'>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                    <td className='py-2 px-4 border-b text-center'>{user.primerNombre}</td>
                                    <td className='py-2 px-4 border-b text-center'>{user.primerApellido}</td>
                                    <td className='py-2 px-4 border-b text-center'>{user.cedula}</td>
                                    <td className='py-2 px-4 border-b text-center'>{user.estado}</td>
                                    <td className='py-2 px-4 border-b text-center'>
                                        <button className='bg-blue-500 text-white px-2 py-1 rounded mr-2' onClick={() => handleVerRutina(user.id)}>Ver Rutina</button>
                                        <button onClick={() => handleBorrar(user.id)} className='bg-red-500 text-white px-2 py-1 rounded'>Borrar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Home;
