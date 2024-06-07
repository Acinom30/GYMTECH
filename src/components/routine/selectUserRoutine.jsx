import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, orderBy, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { useUser } from '../../userContext';
import ViewClientList from '../general/viewClientList';

const SelectUserRoutine = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [rutinas, setRutinas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [rutinaToDelete, setRutinaToDelete] = useState(null);
    const { user } = useUser();

    const handleEvaluation = (client) => {
        setSelectedClient(client);
        setModalType('1');
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
        navigate('/addRoutine', { state: { client: selectedClient } });
    };

    const handleDeleteRoutine = (rutinaId) => {
        setRutinaToDelete(rutinaId);
        setConfirmationModalOpen(true);
    };

    const confirmDeleteRoutine = async () => {
        try {
            await deleteDoc(doc(db, 'rutinas', rutinaToDelete));
            setRutinas(prevRutinas => prevRutinas.filter(rutina => rutina.id !== rutinaToDelete));
            setShowModal(false);
            setSelectedClient(null);
            setConfirmationModalOpen(false);
            ToastifySuccess("Rutina eliminada exitosamente.");
        } catch (error) {
            ToastifyError("Error al eliminar la rutina. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    const cancelDeleteRoutine = () => {
        setConfirmationModalOpen(false);
        setRutinaToDelete(null);
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
            ToastifyError("Error obteniendo las rutinas");
        }
    };

    const handleEditRoutine = (routineId) => {
        navigate('/editRoutine', { state: { routineId, clientId: selectedClient } });
    };

    return (
        <>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Rutinas</h1>
            <ViewClientList
                clients={clients}
                handlePrimaryAction={handleEvaluation}
                primaryActionLabel="Agregar rutina"
                handleSecondaryAction={handleClientSelect}
                secondaryActionLabel="Editar rutina"
                user={user}
            />
            {modalType === '2' && showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white rounded-lg p-8 z-10">
                        <h3 className="text-xl font-semibold mb-2">Rutinas de {selectedClient.primerNombre} {selectedClient.primerApellido}</h3>
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
                                                        className="mt-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white mr-5"
                                                    >
                                                        Editar Rutina
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoutine(rutina.id)}
                                                        className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
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
                                            className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
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
                                            className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
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
            {confirmationModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta rutina?</p>
                        <div className="mt-4 flex justify-center gap-5">
                            <button
                                onClick={confirmDeleteRoutine}
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                >Eliminar</button>
                            <button
                                onClick={cancelDeleteRoutine}
                                className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                                >Cancelar</button>
                        </div>
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
                            <div className="mt-4 justify-center gap-5">
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                                >No</button>
                                <button
                                    onClick={handleClick}
                                    className="mt-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white mr-5"
                                >Agregar Rutina</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    handleClick()
                )
            ) : null}
        </>
    );
};

export default SelectUserRoutine;
