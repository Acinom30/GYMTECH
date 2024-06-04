import React, { useState, useEffect } from 'react';
import Header from "../general/navigationMenu";
import { useUser } from '../../userContext';
import { collection, query, where, getDocs, doc, orderBy } from "firebase/firestore";
import { db } from '../../firebase/config';

const ViewEvaluationHistory = () => {
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [evaluationData, setEvaluationData] = useState([]);
    const [noEvaluations, setNoEvaluations] = useState(false);

    const fetchEvaluationData = async () => {
        try {
            const qUser = query(collection(db, 'usuarios'), where("cedula", "==", searchTerm));
            const querySnapshotUser = await getDocs(qUser);
            const userDocSnapshot = querySnapshotUser.docs[0];
            const userId = userDocSnapshot.id;

            const valoracionesRef = collection(db, 'valoraciones');
            const q = query(
                valoracionesRef,
                where('usuario', '==', doc(db, 'usuarios', userId)),
                orderBy('fechaValoracion', 'desc')
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const valoraciones = querySnapshot.docs.map(doc => doc.data());
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

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            fetchEvaluationData();
        }
    }, [searchTerm]);

    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const renderEvaluationList = () => {
        return (
            <div className="mt-8 mx-auto max-w-2xl">
                {noEvaluations ? (
                    <p className="text-center text-gray-500">No hay valoraciones disponibles para la búsqueda actual.</p>
                ) : (
                    evaluationData.map((evaluation, index) => (
                        <div key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
                            <h2 className="text-xl font-bold mb-2">Valoración {index + 1}:</h2>
                            <p className="mb-2">Fecha de Valoración: {evaluation.fechaValoracion}</p>
                            <button className="bg-green-500 text-white px-4 py-2 rounded-md mb-2" onClick={() => handleShowDetails(index)}>Mostrar Detalles</button>
                            {evaluation.showDetails && (
                                <ul>
                                    {Object.entries(evaluation)
                                        .filter(([key]) => !['usuario', 'fechaValoracion'].includes(key))
                                        .map(([key, value]) => (
                                            <li key={key}>
                                                <span className="font-semibold">{key}:</span> {value.toString()}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </div>
        );
    };

    const handleShowDetails = (index) => {
        const updatedEvaluationData = [...evaluationData];
        updatedEvaluationData[index].showDetails = !updatedEvaluationData[index].showDetails;
        setEvaluationData(updatedEvaluationData);
    };

    return (
        <div>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Historial de Valoraciones</h1>
            <div className="flex justify-center items-center mb-4">
                <input
                    type="text"
                    placeholder="Buscar por cédula"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="border border-gray-300 rounded-md p-2 mr-2"
                />
                <button onClick={fetchEvaluationData} className="bg-blue-500 text-white px-4 py-2 rounded-md">Buscar</button>
            </div>
            {renderEvaluationList()}
        </div>
    );
}

export default ViewEvaluationHistory;
