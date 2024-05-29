import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, orderBy, query, where, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';

const SelectUserEvaluation = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isMounted = useRef(false);
    const [modalType, setModalType] = useState(null);
    const [valoraciones, setValoraciones] = useState([]);
    const [showModal, setShowModal] = useState(false);

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

    const calculateDays = (client) => {
        if (client && client.fechaRegistro) {
            const fechaRegistroDate = new Date(client.fechaRegistro);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - fechaRegistroDate.getTime();
            return differenceInTime / (1000 * 3600 * 24);
        }
        return null;
    };

    const handleClickAdd = () => {
        if (isMounted.current) {
            navigate('/assignEvaluation', { state: { client: selectedClient } });
        }
    };

    const handleAddEvent = (client) => {
        setSelectedClient(client);
        setModalType('1');
        setShowModal(true);
    };

    const handleEditEvent = (client) => {
        setSelectedClient(client);
        obtenerValoraciones(client);
        setModalType('2');
    };

    const obtenerValoraciones = async (client) => {
        setSelectedClient(client);
        const clientId = client.id;
        setModalType('2');
        setShowModal(true);
        const valoracionesRef = collection(db, 'valoraciones');
        const q = query(valoracionesRef, orderBy('fechaValoracion', 'desc'));
        const valoracionesSnapshot = await getDocs(q);
        const valoracionesList = valoracionesSnapshot.docs
            .filter(doc => doc.data().usuario.id === clientId)
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setValoraciones(valoracionesList)
    };

    const handleEditEvaluation = (valoracionId) => {
        navigate('/editEvaluation', { state: { valoracionId, clientId: selectedClient.id } });
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
                                                    onClick={() => handleAddEvent(client)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                                                >
                                                    Agregar Valoración
                                                </button>
                                                <button
                                                    onClick={() => handleEditEvent(client)}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded"
                                                >
                                                    Editar Valoración
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
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Últimas Evaluaciones de {selectedClient.primerNombre} {selectedClient.primerApellido}</h2>
                        <ul>
                            {valoraciones.length > 0 ? (
                                valoraciones.map(valoracion => (
                                    <li key={valoracion.id} className="mb-2">
                                        <div className="bg-white p-4 rounded shadow">
                                            <p><strong>Fecha de Valoración:</strong> {valoracion.fechaValoracion}</p>
                                            <button
                                                onClick={() => handleEditEvaluation(valoracion.id)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded mt-2"
                                            >
                                                Editar Valoración
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>No hay valoraciones disponibles para mostrar.</p>
                            )}
                        </ul>
                        <div className="mt-4 flex justify-center gap-5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalType === '1' && selectedClient ? (
                calculateDays(selectedClient) < 3 ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4 text-center">ATENCIÓN</h2>
                            <p>
                                {selectedClient.primerNombre} {selectedClient.primerApellido} no tiene
                                los tres días de acondicionamiento para la toma de la valoración
                                física.
                            </p>
                            <br />
                            <p>
                                <strong>
                                    ¿Quiere agregar una valoración a {selectedClient.primerNombre}?
                                </strong>
                            </p>
                            <div className="mt-4 flex justify-center gap-5">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedClient(null);
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >No</button>
                                <button
                                    onClick={handleClickAdd}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                                >Agregar Valoración</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    handleClickAdd()
                )
            ) : null}
        </div>
    );
};

export default SelectUserEvaluation;
