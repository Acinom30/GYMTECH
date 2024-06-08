import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDoc, getDocs, orderBy, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';


const ViewRoutineRecord = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = location.state || {};

    const [rutinas, setRutinas] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [selectedClient, setSelectedClient] = useState(null);
    const [expandedRoutines, setExpandedRoutines] = useState({});
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [rutinaToDelete, setRutinaToDelete] = useState(null);

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

    useEffect(() => {
        const fetchClientAndRoutines = async () => {
            try {
                const clientDocRef = doc(db, 'usuarios', clientId);
                const clientDoc = await getDoc(clientDocRef);
                if (clientDoc.exists()) {
                    setSelectedClient({ id: clientDoc.id, ...clientDoc.data() });
                }

                const rutinasRef = collection(db, 'rutinas');
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
                ToastifyError("Error obteniendo las rutinas y los datos del cliente");
            }
        };

        if (clientId) {
            fetchClientAndRoutines();
        }
    }, [clientId]);

    const handleEditRoutine = (routineId) => {
        navigate('/editRoutine', { state: { routineId, clientId: selectedClient.id } });
    };


    const toggleExpand = (id) => {
        setExpandedRoutines(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleBack = () => {
        navigate('/selectUserRoutine');
    };

    return (
        <div className="container mx-auto p-4">
            <Header />
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleBack}
                    className="mr-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
                    >
                    Volver
                </button>
            </div>
            <h1 className="text-3xl font-bold text-center mb-4">
                Rutinas de: {selectedClient?.primerNombre} {selectedClient?.primerApellido}
            </h1>
            {rutinas.length > 0 ? (
                <ul>
                    {rutinas.map(rutina => (
                        <li key={rutina.id} className="mb-2">
                            <div className="bg-white p-4 rounded shadow">
                                <p><strong>Fecha de Creación:</strong> {rutina.fechaCreacion}</p>
                                <p><strong>Fecha de Cambio:</strong> {rutina.fechaCambio}</p>
                                {expandedRoutines[rutina.id] && (
                                    <>
                                        {rutina.ejercicios.map((ejercicio, ejIndex) => (
                                            <li key={ejercicio.id}>
                                                <p><strong>Ejercicio #{ejIndex + 1}</strong></p>
                                                <p><strong>ID:</strong> {ejercicio.id}</p>
                                                <p><strong>Nombre:</strong> {ejercicio.nombre}</p>
                                                <p><strong>Día:</strong> {ejercicio.dia}</p>
                                                <p><strong>Color:</strong> {ejercicio.color}</p>
                                                <p><strong>Observaciones:</strong> {ejercicio.observaciones}</p>
                                                <p><strong>Series:</strong> {ejercicio.series}</p>
                                            </li>
                                        ))}
                                    </>
                                )}
                                <button
                                    onClick={() => toggleExpand(rutina.id)}
                                    className="mr-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white"
                                    >
                                    {expandedRoutines[rutina.id] ? 'Ver menos' : 'Ver más'}
                                </button>
                                <button
                                    onClick={() => handleEditRoutine(rutina.id)}
                                    className="mr-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
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
            ) : (
                <p>No hay rutinas disponibles para mostrar.</p>
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
        </div>
    );
};

export default ViewRoutineRecord;
