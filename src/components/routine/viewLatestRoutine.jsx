import React, { useEffect, useState } from 'react';
import Header from "../general/navigationMenu";
import { useUser } from '../../userContext';
import { collection, query, where, getDocs, doc, orderBy, getDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifyError from '../ui/toastify/toastifyError';
import { useNavigate } from 'react-router-dom';

const ViewLatestRoutine = () => {
    const { user } = useUser();
    const [routineData, setRoutineData] = useState(null);
    const [latestRoutineIndex, setLatestRoutineIndex] = useState(null);
    const [secondLatestRoutineIndex, setSecondLatestRoutineIndex] = useState(null);
    const [noRoutines, setNoRoutines] = useState(true);
    const [currentRoutineIndex, setCurrentRoutineIndex] = useState("0");
    const [showRoutine, setShowRoutine] = useState(false);
    const [ejerciciosPorDia, setEjerciciosPorDia] = useState({});
    const [showButton, setShowButton] = useState(true)
    const navigate = useNavigate();


    useEffect(() => {
        const fetchRoutineData = async () => {
            try {
                const qUser = query(collection(db, 'usuarios'), where("cedula", "==", user.user.cedula));
                const querySnapshotUser = await getDocs(qUser);
                const userDocSnapshot = querySnapshotUser.docs[0];
                const userId = userDocSnapshot.id;
                const routinesRef = collection(db, 'rutinas');
                const q = query(
                    routinesRef,
                    where('clientId', '==', doc(db, 'usuarios', userId)),
                    orderBy('fechaCreacion', 'desc')
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const routines = querySnapshot.docs.map(doc => doc.data());
                    setRoutineData(routines);
                    setLatestRoutineIndex(0);
                    setSecondLatestRoutineIndex(1);
                    setCurrentRoutineIndex(0);
                    setNoRoutines(false);
                    setShowRoutine(true);
                }
            } catch (error) {
                ToastifyError("Error obteniendo las rutinas");
                console.error(error);
            }
        };
        fetchRoutineData();
    }, [user.user.rol]);

    const obtenerEjercicio = async (id) => {
        const ejercicioRef = doc(db, 'ejercicios', id);
        const ejercicioSnapshot = await getDoc(ejercicioRef);
        return ejercicioSnapshot.exists() ? ejercicioSnapshot.data() : null;
    };

    useEffect(() => {
        if (routineData && routineData[currentRoutineIndex]) {
            const routine = routineData[currentRoutineIndex];
            if (routine && routine.ejercicios) {
                const ejerciciosPorDiaTemp = {};

                Promise.all(routine.ejercicios.map(async (ejercicio) => {
                    const ejercicioData = await obtenerEjercicio(ejercicio.id);
                    const urlEjercicio = ejercicioData ? ejercicioData.url : null;
                    return { ...ejercicio, url: urlEjercicio };
                })).then((ejerciciosConURL) => {

                    ejerciciosConURL.forEach((ejercicio) => {
                        if (!ejerciciosPorDiaTemp[ejercicio.dia]) {
                            ejerciciosPorDiaTemp[ejercicio.dia] = [];
                        }
                        ejerciciosPorDiaTemp[ejercicio.dia].push(ejercicio);
                    });
                    setEjerciciosPorDia(ejerciciosPorDiaTemp);
                }).catch((error) => {
                    console.error("Error obteniendo las URLs de los ejercicios:", error);
                });
            }
        }
    }, [currentRoutineIndex, routineData]);


    const renderRoutine = () => {
        if (routineData && currentRoutineIndex !== null && routineData.length > 0) {
            const isIndexValid = currentRoutineIndex >= 0 && currentRoutineIndex < routineData.length;
            if (isIndexValid) {
                const routine = routineData[currentRoutineIndex];

                const orderedKeys = Object.keys(ejerciciosPorDia);

                return (
                    <div className="bg-white shadow-md rounded-md p-4 mb-4">
                        <h2 className="text-xl font-bold mb-2">Rutina:</h2>
                        <p><strong>Fecha de Cambio:</strong> {routine.fechaCambio}</p>
                        {orderedKeys.map((dia) => (
                            <div key={dia} className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Ejercicios - Día {dia}:</h3>
                                <table className="w-full border-collapse border border-gray-300" style={{ tableLayout: 'fixed' }}>
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-gray-300">
                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Nombre</th>
                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Series</th>
                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '25%' }}>Observaciones</th>
                                            <th className="py-2 px-4 border-r border-gray-300" style={{ width: '10%' }}>Color</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ejerciciosPorDia[dia].map((ejercicio, index) => (
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
                    </div>
                );
            }
        }
        return null;
    };

    const handleShowSecondLatestRoutine = (secondLatestRoutineIndex) => {
        setCurrentRoutineIndex(secondLatestRoutineIndex);
        setShowRoutine(true);
        setShowButton(false);
    };

    const handleBack = () => {
        navigate('/home');
    };

    return (
        <div>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Mis Rutinas</h1>
            <div className="mt-8 mx-auto max-w-4xl">
                {showRoutine && renderRoutine()}
            </div>
            {noRoutines ? (
                <p className="text-center text-gray-500">No hay rutinas disponibles.</p>
            ) : (
                <div className="flex justify-center mt-4">
                    <button onClick={handleBack} className="bg-gray-500 text-white py-2 px-4 rounded-md mr-5">Atrás</button>

                    {secondLatestRoutineIndex !== null && showButton && (
                        <button onClick={() => handleShowSecondLatestRoutine(secondLatestRoutineIndex)} className="bg-blue-500 text-white py-2 px-4 rounded-md mr-5">Penúltima Rutina</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewLatestRoutine;
