import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDoc, getDocs, orderBy, query, where, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { formatDate } from '../js/general'

const ViewRoutineRecord = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = location.state || {};

    const [IDValoracionMasReciente, setIDValoracionMasReciente] = useState(null);
    const [rutinas, setRutinas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [expandedRoutines, setExpandedRoutines] = useState({});
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [rutinaToDelete, setRutinaToDelete] = useState(null);
    //const [ejerciciosPorDia, setEjerciciosPorDia] = useState({});
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClientForCopy, setSelectedClientForCopy] = useState(null);
    const [rutinaToCopy, setRutinaToCopy] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    //const [evaluationData, setEvaluationData] = useState([]);
    const [noEvaluations, setNoEvaluations] = useState(false);
    const [userSelection, setUserSelection] = useState([]);
    const [showUserSelection, setShowUserSelection] = useState(false);
    //const [userData, setUserData] = useState(null)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showConfirmCopy, setShowConfirmCopy] = useState(false);
    const [fechaCambio, setFechaCambio] = useState(null);





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

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // const obtenerEjercicio = async (id) => {
    //     const ejercicioRef = doc(db, 'ejercicios', id);
    //     const ejercicioSnapshot = await getDoc(ejercicioRef);
    //     return ejercicioSnapshot.exists() ? ejercicioSnapshot.data() : null;
    // };

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

                const rutinasList = await Promise.all(
                    rutinasSnapshot.docs.map(async (doc) => {
                        const rutina = doc.data();
                        const ejerciciosPorDiaTemp = {};

                        await Promise.all(
                            rutina.ejercicios.map(async (ejercicio) => {
                                const urlEjercicio = ejercicio.url;
                                const ejercicioConURL = { ...ejercicio, url: urlEjercicio };
                                const dia = ejercicioConURL.dia;
                                if (!ejerciciosPorDiaTemp[dia]) {
                                    ejerciciosPorDiaTemp[dia] = [];
                                }
                                ejerciciosPorDiaTemp[dia].push(ejercicioConURL);

                            })
                        );

                        return { id: doc.id, ...rutina, ejerciciosPorDia: ejerciciosPorDiaTemp };
                    })
                );

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

    const handleCopyRoutine = (rutinaId) => {
        setRutinaToCopy(rutinaId);
        setCopyModalOpen(true);
    };

    const searchByName = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const searchTermNormalized = searchTerm.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            const filteredUsers = usersData.filter(user => {
                const fullNameNormalized = `${user.primerNombre} ${user.segundoNombre || ''} ${user.primerApellido} ${user.segundoApellido || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const cedula = user.cedula.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return fullNameNormalized.includes(searchTermNormalized) || cedula.includes(searchTermNormalized);
            });

            if (filteredUsers.length > 0) {
                setUserSelection(filteredUsers);
                setShowUserSelection(true);
                setClientes(filteredUsers);
            } else {
                setUserSelection([]);
                setShowUserSelection(false);
                setClientes([]);
            }
        } catch (error) {
            console.error('Error searching user: ', error);
        }
    };

    const searchByDocument = async () => {
        try {
            const qUser = query(
                collection(db, 'usuarios'),
                where('cedula', '==', searchTerm)
            );
            const querySnapshotUser = await getDocs(qUser);

            if (!querySnapshotUser.empty) {
                const usersData = querySnapshotUser.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setClientes(usersData);
            } else {
                setUserSelection([]);
            }
        } catch (error) {
            console.error('Error searching user: ', error);
            setNoEvaluations(true);
        }
    };

    const handleSearch = () => {
        const searchTermTrimmed = searchTerm.trim();
        if (isCedulaOrPassport(searchTermTrimmed)) {
            setShowUserSelection(false);
            searchByDocument();
        } else {
            searchByName();
        }
    };

    const isCedulaOrPassport = (str) => {
        const cedulaOrPassportRegex = /^[0-9]{7,10}$|^[a-zA-Z]{1}[0-9]{6}[a-zA-Z]{1}$/;
        return cedulaOrPassportRegex.test(str);
    };

    
    const confirmCopyRoutine = async () => {
        try {
            setShowConfirmationModal(true);
            const rutinaRef = doc(db, 'rutinas', rutinaToCopy);
            const rutinaDoc = await getDoc(rutinaRef);

            if (rutinaDoc.exists()) {
                const userRef = doc(db, "usuarios", selectedClientForCopy.id);
                const valoracionesRef = collection(db, "valoraciones");

                const q = query(valoracionesRef, where("usuario", "==", userRef));

                let fechaActual = formatDate(new Date());

                const snapshot = await getDocs(q);
                const valoraciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (valoraciones.length > 0) {
                    const valoracionMasReciente = valoraciones.reduce((max, val) => {
                        const fechaMax = new Date(max.fechaValoracion);
                        const fechaVal = new Date(val.fechaValoracion);
                        return fechaVal > fechaMax ? val : max;
                    });
                    console.log(valoracionMasReciente.id);
                    setIDValoracionMasReciente(valoracionMasReciente.id);
                    if (fechaCambio === null) {
                        ToastifyError("Debe colocar una fecha de cambio");
                        return;
                    }

                    const newRutina = { ...rutinaDoc.data(), clientId: userRef, fechaCreacion: fechaActual, fechaCambio: fechaCambio, valoracion: valoracionMasReciente.id };
                    await addDoc(collection(db, 'rutinas'), newRutina);
                } else {
                    const newRutina = { ...rutinaDoc.data(), clientId: userRef, fechaCreacion: fechaActual, fechaCambio: fechaCambio, valoracion: null };
                    await addDoc(collection(db, 'rutinas'), newRutina);
                }
                setCopyModalOpen(false);
                setSelectedClientForCopy(null);
                navigate('/selectUserRoutine')
                ToastifySuccess("Rutina copiada exitosamente.");
            }
        } catch (error) {
            ToastifyError("Error al copiar la rutina. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    const cancelCopyRoutine = () => {
        setCopyModalOpen(false);
        setSelectedClientForCopy(null);
    };

    // const cancelConfirmationModal = () => {
    //     showConfirmationModal(false);
    // };


    const confirmCopy = () => {
        setShowConfirmCopy(true);
    };

    const cancelConfirmCopy = () => {
        setShowConfirmCopy(false);
    };

    const handleFechaCambioEdit = (event) => {
        setFechaCambio(event.target.value);
    };

    return (
        <div className="container mx-auto">
            <Header />
            <div className="flex justify-start mb-4">
                <button
                    onClick={handleBack}
                    className="mr-3 ml-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
                >
                    Volver
                </button>
            </div>
            <h1 className="text-3xl font-bold text-center mb-4">
                Rutinas de: {selectedClient?.primerNombre} {selectedClient?.primerApellido}
            </h1>
            {rutinas.length > 0 ? (
                <ul className='w-3/4 mx-auto'>
                    {rutinas.map(rutina => (
                        <li key={rutina.id} className="mb-8">
                            <div className="justify-center bg-white p-4 rounded shadow">
                                <p><strong>Fecha de Creación:</strong> {rutina.fechaCreacion}</p>
                                <p><strong>Fecha de Cambio:</strong> {rutina.fechaCambio}</p>
                                {expandedRoutines[rutina.id] && (
                                    <>
                                        {Object.keys(rutina.ejerciciosPorDia).map((dia) => (
                                            <div key={dia} className="mt-4 mb-4">
                                                <h3 className="text-lg font-semibold mb-2">Ejercicios - Día {dia}:</h3>
                                                <table className="w-full border-collapse border border-gray-300" style={{ tableLayout: 'fixed' }}>
                                                    <thead>
                                                        <tr className="bg-gray-100 border-b border-gray-300">
                                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Nombre</th>
                                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Series</th>
                                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Observaciones</th>
                                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '10%' }}>Alternado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rutina.ejerciciosPorDia[dia].map((ejercicio, index) => (
                                                            <tr key={index} className="border-b border-gray-300">
                                                                <td className="py-2 px-4 border-r border-gray-300">
                                                                    {ejercicio.url ? (
                                                                        <a href={ejercicio.url} target="_blank" rel="noopener noreferrer" className="font-bold underline text-blue-500">{ejercicio.nombre}</a>
                                                                    ) : (
                                                                        <p className="font-bold underline text-blue-500">{ejercicio.nombre}</p>
                                                                    )}
                                                                </td>
                                                                <td className="py-2 px-4 border-r border-gray-300">{ejercicio.series}</td>
                                                                <td className="py-2 px-4 border-r border-gray-300">{ejercicio.observaciones}</td>
                                                                <td className="py-2 px-4 border-r border-gray-300" style={{ backgroundColor: ejercicio.color }}></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <button
                                    onClick={() => toggleExpand(rutina.id)}
                                    className="mr-3 mt-4 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white"
                                >
                                    {expandedRoutines[rutina.id] ? 'Ver menos' : 'Ver más'}
                                </button>
                                <button
                                    onClick={() => handleEditRoutine(rutina.id)}
                                    className="mr-3 mt-4 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
                                >
                                    Editar Rutina
                                </button>
                                <button
                                    onClick={() => handleDeleteRoutine(rutina.id)}
                                    className="mr-3 text-black mt-4 font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                >
                                    Eliminar Rutina
                                </button>
                                <button
                                    onClick={() => handleCopyRoutine(rutina.id)}
                                    className="text-black mt-4 font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                >
                                    Copiar
                                </button>

                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center">No hay rutinas disponibles para mostrar.</p>
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
            {copyModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Copiar Rutina</h2>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            placeholder="Buscar por nombre o cédula"
                        />
                        <button
                            onClick={handleSearch}
                            className="w-full text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white mb-4"
                        >
                            Buscar
                        </button>
                        <ul className="max-h-40 overflow-y-auto">
                            {clientes.map(cliente => (
                                <li
                                    key={cliente.id}
                                    onClick={() => setSelectedClientForCopy(cliente)}
                                    className={`cursor-pointer p-2 border-b border-gray-300 ${selectedClientForCopy?.id === cliente.id ? 'bg-gray-300' : ''}`}
                                >
                                    {cliente.primerNombre} {cliente.segundoNombre} {cliente.primerApellido} {cliente.segundoApellido} - {cliente.cedula}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex justify-center gap-5">
                            <button
                                onClick={confirmCopy}
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-700 hover:text-white"
                                disabled={!selectedClientForCopy}
                            >Copiar</button>
                            <button
                                onClick={cancelCopyRoutine}
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                            >Cancelar</button>

                            {showConfirmCopy && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                                        <h2 className="text-xl font-bold mb-4">Confirmar la copia</h2>
                                        <p>¿Estás seguro de que deseas copiar la rutina de {selectedClient?.primerNombre} {selectedClient?.segundoNombre} {selectedClient?.primerApellido} {selectedClient?.segundoApellido} a {selectedClientForCopy.primerNombre} {selectedClientForCopy.segundoNombre} {selectedClientForCopy.primerApellido} {selectedClientForCopy.segundoApellido}</p>
                                        <h2 className="text-xl font-bold mb-4">Seleccione fecha de cambio:</h2>
                                        <div className="mt-4">
                                            <input
                                                type="date"
                                                id="fechaCambio"
                                                name="fechaCambio"
                                                value={fechaCambio}
                                                onChange={handleFechaCambioEdit}
                                                className="w-50 bg-gray-200 rounded-md px-4 py-3 text-center"
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-center gap-5">
                                            <button
                                                onClick={cancelConfirmCopy}
                                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                            >Cancelar</button>
                                            <button
                                                onClick={confirmCopyRoutine}
                                                className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                                            >Aceptar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewRoutineRecord;
