import React, { useState } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';
import ViewClientList from '../general/viewClientList';
import { useUser } from '../../userContext';
import ToastifySuccess from '../ui/toastify/toastifySuccess';

const SelectUserEvaluation = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [valoraciones, setValoraciones] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [valoracionToDelete, setValoracionToDelete] = useState(null);
    const { user } = useUser();


    const handleDeleteEvaluation = async (valoracionId) => {
        setShowModal(false)
        setConfirmationModalOpen(true);
        setValoracionToDelete(valoracionId);
    };

    const confirmDeleteEvaluation = async () => {
        try {
            console.log(valoracionToDelete)
            await deleteDoc(doc(db, 'valoraciones', valoracionToDelete));
            setValoraciones(prevValoraciones => prevValoraciones.filter(valoracion => valoracion.id !== valoracionToDelete));
            setConfirmationModalOpen(false);
            ToastifySuccess("Valoración eliminada satisfactoriamente.")
        } catch (error) {
            console.error('Error al eliminar la valoración:', error);
        }
    };

    const cancelDeleteEvaluation = () => {
        setConfirmationModalOpen(false);
        setValoracionToDelete(null);
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

    const handleClickAdd = () => {
        navigate('/assignEvaluation', { state: { client: selectedClient } });
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

    const handleRecordEvent = (client) => {
        setSelectedClient(client);
        navigate('/viewEvaluationHistory',{ state: { clientId: client.id } })
    }

    return (
        <>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Valoraciones</h1>
            <ViewClientList
                clients={clients}
                handlePrimaryAction={handleAddEvent}
                primaryActionLabel="Agregar"
                handleSecondaryAction={handleEditEvent}
                secondaryActionLabel="Editar"
                handleTertiaryAction={handleRecordEvent}
                tertiaryActionLabel="Historial"
                user={user}
            />
            {confirmationModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta valoración?</p>
                        <div className="mt-4 flex justify-center gap-5">
                            <button
                                onClick={confirmDeleteEvaluation}
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                >Eliminar</button>
                            <button
                                onClick={cancelDeleteEvaluation}
                                className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                                >Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {modalType === '2' && showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Últimas Evaluaciones de {selectedClient.primerNombre} {selectedClient.primerApellido}</h2>
                        <ul>
                            {valoraciones.length > 0 ? (
                                valoraciones.slice(0, 2).map(valoracion => (
                                    <li key={valoracion.id} className="mb-2">
                                        <div className="bg-white p-4 rounded shadow">
                                            <p><strong>Fecha de Valoración:</strong> {valoracion.fechaValoracion}</p>
                                            <button
                                                onClick={() => handleEditEvaluation(valoracion.id)}
                                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white mr-5"
                                            >
                                                Editar
                                            </button>
                                            {user.user.rol === 'administrador' && (
                                                <button
                                                    onClick={() => handleDeleteEvaluation(valoracion.id)}
                                                    className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
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
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
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
                            <div className="mt-4 justify-center gap-5">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedClient(null);
                                    }}
                                    className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                                >No</button>
                                <button
                                    onClick={handleClickAdd}
                                    className="mt-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white mr-5"
                                >Agregar Valoración</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    handleClickAdd()
                )
            ) : null}
        </>
    );
};

export default SelectUserEvaluation;
