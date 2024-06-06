import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';

const SelectUserRoutine = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        const fetchClients = async () => {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const clientsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            const filteredClients = clientsData.filter(client => {
                const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const fullName = normalize(`${client.primerNombre} ${client.primerApellido}`).toLowerCase();
                const cedula = normalize(client.cedula).toLowerCase();
                const searchTermLower = normalize(searchTerm).toLowerCase();
                return fullName.includes(searchTermLower) || cedula.includes(searchTermLower);
            });
            setClients(filteredClients);
        };

        fetchClients();
        return () => {
            isMounted.current = false;
        };
    }, [searchTerm]);

    const handleAddRoutine = (client) => {
        navigate('/addRoutine', { state: { clientId: client.id } });
    };

    const handleEditRoutine = (client) => {
        navigate('/editRoutine', { state: { clientId: client.id } });
    };

    const handleHistory = (client) => {
        navigate('/viewRoutineRecord', { state: { clientId: client.id } });
    };

    return (
        <div className="container mx-auto p-4">
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Clientes</h1>
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-full"
                />
                <button
                    onClick={() => setSearchTerm('')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 ml-2 rounded"
                >
                    Limpiar
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="w-1/4 px-4 py-2">Nombre</th>
                            <th className="w-1/4 px-4 py-2">Apellido</th>
                            <th className="w-1/4 px-4 py-2">Cédula</th>
                            <th className="w-1/4 px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className='text-center'>
                                {client.cedula !== '1' && (
                                    <>
                                        <td className="border px-4 py-2">{client.primerNombre}</td>
                                        <td className="border px-4 py-2">{client.primerApellido}</td>
                                        <td className="border px-4 py-2">{client.cedula}</td>
                                        <td className="border px-4 py-2">
                                            <div className="inline-flex gap-5">
                                                <button
                                                    onClick={() => handleAddRoutine(client)}
                                                    className="bg-yellow-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded mt-2"
                                                >
                                                    Agregar Rutina
                                                </button>
                                                <button
                                                    onClick={() => handleEditRoutine(client)}
                                                    className="bg-yellow-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
                                                >
                                                    Editar Rutina
                                                </button>
                                                <button
                                                    onClick={() => handleHistory(client)}
                                                    className="bg-yellow-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded mt-2"
                                                >
                                                    Historial
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SelectUserRoutine;
