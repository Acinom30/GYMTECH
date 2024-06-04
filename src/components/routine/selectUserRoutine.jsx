import React, { useState, useEffect, useRef } from 'react';

import { collection, getDocs, orderBy, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';



const SelectUserRoutine = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rutinas, setRutinas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null)

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
        setModalType('1')
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
            navigate('/addRoutine', { state: { client: selectedClient } });
        }
    };
    const handleDeleteRoutine = async (rutinaId) => {
        try {
            await deleteDoc(doc(db, 'rutinas', rutinaId));
            setShowModal(false);
            setSelectedClient(null);
            ToastifySuccess("Rutina eliminada exitosamente.");
        } catch (error) {
            ToastifyError("Error al eliminar la rutina. Por favor, inténtalo de nuevo más tarde.");
        }
    };
    



    const handleClientSelect = async (client) => {
        setSelectedClient(client);
        setModalType('2');
        setShowModal(true);
        const rutinasRef = collection(db, 'rutinas');
        try {
            const clientDocRef = doc(db, 'usuarios', client.id);
            const q = query(
                rutinasRef,
                where('clientId', '==', clientDocRef),
                orderBy('fechaCreacion', 'desc')
            );
            const rutinasSnapshot = await getDocs(q);
            const rutinasList = rutinasSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRutinas(rutinasList);
        } catch (error) {
            ToastifyError("Error obteniendo las rutinas")
        }
    };

    const handleEditRoutine = (routineId) => {
        navigate('/editRoutine', { state: { routineId, clientId: selectedClient } });
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
                                                    onClick={() => handleEvaluation(client)}
                                                    className="bg-yellow-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
                                                >
                                                    Agregar Rutina
                                                </button>
                                                <button
                                                    onClick={() => handleClientSelect(client)}
                                                    className="bg-yellow-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded mt-2"
                                                >
                                                    Editar Rutina
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
            {modalType === '2' && showModal && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 z-10">
                        <h3 className="text-xl font-semibold mb-2">Rutinas del {selectedClient.primerNombre} {selectedClient.primerApellido}</h3>
                        <ul>
                            {rutinas.length > 0 ? (
                                <>
                                    <ul>
                                        {rutinas.slice(0, 2).map(rutina => (
                                            <li key={rutina.id} className="mb-2">
                                                <div className="bg-white p-4 rounded shadow">
                                                    <p><strong>Fecha de Creación:</strong> {rutina.fechaCreacion}</p>
                                                    <p><strong>Fecha de Cambio:</strong> {rutina.fechaCambio}</p>

                                                    <button
                                                        onClick={() => handleEditRoutine(rutina.id)}
                                                        className="bg-yellow-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
                                                    >
                                                        Editar Rutina
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoutine(rutina.id)}
                                                        className="bg-yellow-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2 ml-2"
                                                    >
                                                        Eliminar Rutina
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex justify-center gap-5">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>No hay rutinas disponibles para mostrar.</p>
                                    <div className="mt-4 flex justify-center gap-5">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}
            {modalType === '1' && selectedClient ? (
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
                                    className="bg-yellow-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
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
