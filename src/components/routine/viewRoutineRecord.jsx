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
    const [selectedClient, setSelectedClient] = useState(null);
    const [expandedRoutines, setExpandedRoutines] = useState({});

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

    const handleDeleteRoutine = async (rutinaId) => {
        try {
            await deleteDoc(doc(db, 'rutinas', rutinaId));
            setRutinas(prevRoutines => prevRoutines.filter(routine => routine.id !== rutinaId));
            ToastifySuccess("Rutina eliminada exitosamente.");
        } catch (error) {
            ToastifyError("Error al eliminar la rutina. Por favor, inténtalo de nuevo más tarde.");
        }
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
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-2"
                                >
                                    {expandedRoutines[rutina.id] ? 'Ver menos' : 'Ver más'}
                                </button>
                                <button
                                    onClick={() => handleEditRoutine(rutina.id)}
                                    className="bg-yellow-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 ml-2"
                                >
                                    Editar Rutina
                                </button>
                                <button
                                    onClick={() => handleDeleteRoutine(rutina.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2 ml-2"
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
        </div>
    );
};

export default ViewRoutineRecord;
