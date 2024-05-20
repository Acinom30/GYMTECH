import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';


const SelectUserRoutine = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
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

    const handleEvaluation = (client) => {
        setSelectedClient(client);
    };

    const calculateDays = (client) => {
        if (client && client.fechaRegistro) {
            const fechaRegistroDate = new Date(client.fechaRegistro);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - fechaRegistroDate.getTime();
            return differenceInTime / (1000 * 3600 * 24);
        }
        return null;
    };

    const handleClick = () => {
        if (isMounted.current) {
            //Para pruebas de rutina
            navigate('/addRoutine', {state: { client: selectedClient } });
            //Este de abajo es el que va
            //navigate('/assignEvaluation', { state: { client: selectedClient } });
        }
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
                                <td className="border px-4 py-2">{client.primerNombre}</td>
                                <td className="border px-4 py-2">{client.primerApellido}</td>
                                <td className="border px-4 py-2">{client.cedula}</td>
                                <td className="border px-4 py-2">
                                    <div className="inline-flex gap-5">
                                        <button
                                            onClick={() => handleEvaluation(client)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                                        >
                                            Agregar Rutina
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedClient ? (
                calculateDays(selectedClient) < 7 ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4 text-center">ATENCIÓN</h2>
                            <p>
                                {selectedClient.primerNombre} {selectedClient.primerApellido} no tiene
                                la semana de acondicionamiento para el registro de la rutina.
                            </p>
                            <br />
                            <p>
                                <strong>
                                    ¿Quiere agregar una rutina a {selectedClient.primerNombre}?
                                </strong>
                            </p>
                            <div className="mt-4 flex justify-center gap-5">
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >No</button>
                                <button
                                    onClick={handleClick}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                                >Agregar Rutina</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    handleClick()
                )
            ) : null}
        </div>
    );
};

export default SelectUserRoutine;
