import React, { useState, useEffect } from 'react';
import Header from "../general/navigationMenu";
import { collection, query, where, getDocs, doc, orderBy, deleteDoc, getDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import { useUser } from '../../userContext';
import { useLocation, useNavigate } from 'react-router-dom';

const ViewEvaluationHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [evaluationData, setEvaluationData] = useState([]);
    const [noEvaluations, setNoEvaluations] = useState(false);
    const [userSelection, setUserSelection] = useState([]);
    const [showUserSelection, setShowUserSelection] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userID, setUserID] = useState(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [evaluationToDelete, setEvaluationToDelete] = useState(null); // Nuevo estado para almacenar la evaluación que se desea eliminar
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const { clientId } = location.state || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (clientId) {
                    const refUser = doc(db, 'usuarios', clientId);
                    const snapshotUser = await getDoc(refUser);

                    if (snapshotUser.exists()) {
                        const userInfo = snapshotUser.data();
                        setUserData(userInfo);
                        fetchEvaluationData(clientId);
                    } else {
                        console.log('No se encontró el usuario con el ID proporcionado.');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        fetchData(); // Llama a la función fetchData dentro de useEffect

    }, [clientId]);

    const fetchEvaluationData = async (userId) => {
        try {
            setUserID(userId);
            const valoracionesRef = collection(db, 'valoraciones');
            const q = query(
                valoracionesRef,
                where('usuario', '==', doc(db, 'usuarios', userId)),
                orderBy('fechaValoracion', 'desc')
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const valoraciones = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    showDetails: false
                }));
                setEvaluationData(valoraciones);
                setNoEvaluations(false);
            } else {
                setEvaluationData([]);
                setNoEvaluations(true);
            }
        } catch (error) {
            console.error("Error fetching evaluation data: ", error);
            setNoEvaluations(true);
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
                const userId = querySnapshotUser.docs[0].id;
                setUserData(querySnapshotUser.docs[0].data());
                fetchEvaluationData(userId);
            } else {
                setEvaluationData([]);
                setNoEvaluations(true);
                setUserSelection([]);
            }
        } catch (error) {
            console.error('Error searching user: ', error);
            setNoEvaluations(true);
        }
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
                setUserData(userSelection);
                setEvaluationData([]);
                setNoEvaluations(false);
                setShowUserSelection(true);
            } else {
                setEvaluationData([]);
                setNoEvaluations(true);
                setUserSelection([]);
                setShowUserSelection(false);
            }
        } catch (error) {
            console.error('Error searching user: ', error);
            setNoEvaluations(true);
        }
    };


    const handleSearch = () => {
        setUserData(null);
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

    const fieldPriority = ['objetivo', 'peso', 'edadMetabolica'];

    const sortFields = (a, b) => {
        const indexA = fieldPriority.indexOf(a);
        const indexB = fieldPriority.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    };

    const formatAttributeName = (name) => {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const handleUserSelection = (userId) => {
        fetchEvaluationData(userId);
        const selectedUser = userSelection.find(user => user.id === userId);
        if (selectedUser) {
            setUserData(selectedUser);
        } else {
            console.error('El usuario seleccionado no se encontró en la lista actual de usuarios seleccionados.');
        }
        setUserSelection([]);
        setShowUserSelection(false);
    };


    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEditEvaluation = (valoracionId) => {
        navigate('/editEvaluation', { state: { valoracionId, clientId: userID } });

    };

    const handleDeleteEvaluation = (evaluationId) => {
        setEvaluationToDelete(evaluationId);
        setConfirmationModalOpen(true); 
    };

    const confirmDeleteEvaluation = async () => {
        try {
            await deleteDoc(doc(db, 'valoraciones', evaluationToDelete));
            setConfirmationModalOpen(false);
            fetchEvaluationData(userID);
        } catch (error) {
            console.error("Error deleting evaluation: ", error);
        }
    };

    const cancelDeleteEvaluation = () => {
        setConfirmationModalOpen(false); 
        setEvaluationToDelete(null); 
    };

    const handleShowDetails = (index) => {
        const updatedEvaluationData = [...evaluationData];
        updatedEvaluationData[index].showDetails = !updatedEvaluationData[index].showDetails;
        setEvaluationData(updatedEvaluationData);
    };

    const renderEvaluationList = () => {
        return (
            <div className="mt-8 mx-auto max-w-2xl">
                {noEvaluations ? (
                    <p className="text-center text-gray-500">No hay valoraciones disponibles para la búsqueda actual.</p>
                ) : (
                    <>
                        {userData !== null && showUserSelection === false && (
                            <h3 className="text-xl font-bold mb-2">Valoraciones de {userData.primerNombre} {userData.segundoNombre} {userData.primerApellido} {userData.segundoApellido}</h3>
                        )}
                        {evaluationData.map((evaluation, index) => (
                            <div key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
                                <h3 className="text-xl font-bold mb-2">Valoración {index + 1}:</h3>
                                <p className="mb-2">Fecha de Valoración: {evaluation.fechaValoracion}</p>
                                <button className="mb-5 mr-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white" onClick={() => handleShowDetails(index)}>Mostrar Detalles</button>
                                <button className="mb-5 mr-3 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white" onClick={() => handleEditEvaluation(evaluation.id)}>Editar</button>
                                {user.user.rol === 'administrador' && (
                                    <button
                                        onClick={() => handleDeleteEvaluation(evaluation.id)}
                                        className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                                    >
                                        Eliminar
                                    </button>
                                )}
                                {evaluation.showDetails && (
                                    <ul>
                                        {Object.entries(evaluation)
                                            .filter(([key, value]) =>
                                                !['usuario', 'tipoPersona', 'valoracionFisica', 'diasSemana', 'lesionesActuales', 'showDetails', 'id'].includes(key) && value !== ''
                                            )
                                            .sort(([keyA], [keyB]) => sortFields(keyA, keyB))
                                            .map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-semibold">{formatAttributeName(key)}:</span> {value.toString()}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                )}
                            </div>
                        ))}
                    </>
                )}

            </div>
        );
    };

    return (
        <div>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Historial de Valoraciones</h1>
            <div className="flex items-center justify-between mb-4 w-96 mx-auto">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:border-yellow-500"
                />
                <button onClick={handleSearch} className="---ml-4 py-2 px-4 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ml-5">Buscar</button>
            </div>
            {userSelection.length > 0 && showUserSelection && (

                <div className="flex justify-center items-center">
                    <div className="max-w-md border rounded-lg p-4 shadow-md min-w-[300px] w-full">
                        <h2 className="text-lg font-semibold mb-2">Resultados de la búsqueda:</h2>
                        {userSelection.map(user => (
                            <div key={user.id} onClick={() => handleUserSelection(user.id)} className="border-b py-2 cursor-pointer hover:bg-gray-100">
                                <div className="max-w-md border rounded-lg p-4 shadow-md">
                                    <div className="mb-2">
                                        <span className="font-semibold">Nombre:</span> {user.primerNombre} {user.segundoNombre} {user.primerApellido} {user.segundoApellido}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Cédula:</span> {user.cedula}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {confirmationModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-75">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar esta valoración?</p>
                        <div className="mt-4 flex justify-center gap-5">
                            <button
                                onClick={confirmDeleteEvaluation}
                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={cancelDeleteEvaluation}
                                className="mr-5 text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {renderEvaluationList()}
        </div>
    );
}

export default ViewEvaluationHistory;