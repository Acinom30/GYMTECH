import { useEffect, useState } from 'react';
import Header from "../general/navigationMenu";
import { useUser } from '../../userContext';
import { collection, query, where, getDocs, doc, orderBy } from "firebase/firestore";
import { db } from '../../firebase/config';

const ViewLatestEvaluation = () => {
    const { user } = useUser();
    const [evaluationData, setEvaluationData] = useState(null);
    const [latestEvaluation, setLatestEvaluation] = useState(null);
    const [secondLatestEvaluation, setSecondLatestEvaluation] = useState(null);
    const [noEvaluations, setNoEvaluations] = useState(false);

    useEffect(() => {
        const fetchEvaluationData = async () => {
            try {
                const qUser = query(collection(db, 'usuarios'), where("cedula", "==", user.user.cedula));
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
                    setLatestEvaluation(valoraciones[0]);
                    setSecondLatestEvaluation(valoraciones[1] || null);
                    setNoEvaluations(false);
                } else {
                    setNoEvaluations(true);
                }
            } catch (error) {
                console.error("Error fetching evaluation data: ", error);
                setNoEvaluations(true);
            }
        };

        fetchEvaluationData();
    }, [user.user.rol]);

    const formatAttributeName = (name) => {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const fieldPriority = ['fechaValoracion', 'objetivo', 'peso', 'edadMetabolica'];

    const sortFields = (a, b) => {
        const indexA = fieldPriority.indexOf(a);
        const indexB = fieldPriority.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    };

    return (
        <div>
            <Header />
            <h1 className="text-3xl font-bold text-center mb-4">Mis Valoraciones</h1>
            <div className="mt-8 mx-auto max-w-2xl">
                {noEvaluations ? (
                    <p className="text-center text-gray-500">No hay valoraciones disponibles.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {latestEvaluation && (
                            <div className="bg-white shadow-md rounded-md p-4">
                                <h2 className="text-xl font-bold mb-2">Última valoración:</h2>
                                <ul>
                                    {Object.entries(latestEvaluation)
                                        .filter(([key, value]) =>
                                            !['usuario', 'tipoPersona', 'valoracionFisica', 'diasSemana', 'lesionesActuales', 'showDetails', 'id'].includes(key) && value !== ''
                                        ).sort(([keyA], [keyB]) => sortFields(keyA, keyB))
                                        .map(([key, value]) => (
                                            <li key={key}>
                                                <span className="font-semibold">{formatAttributeName(key)}:</span> {value.toString()}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                        {secondLatestEvaluation && (
                            <div className="bg-white shadow-md rounded-md p-4">
                                <h2 className="text-xl font-bold mb-2">Penúltima valoración:</h2>
                                <ul>
                                    {Object.entries(secondLatestEvaluation)
                                        .filter(([key, value]) =>
                                            !['usuario', 'tipoPersona', 'valoracionFisica', 'diasSemana', 'lesionesActuales', 'showDetails', 'id'].includes(key) && value !== ''
                                        ).sort(([keyA], [keyB]) => sortFields(keyA, keyB))
                                        .map(([key, value]) => (
                                            <li key={key}>
                                                <span className="font-semibold">{formatAttributeName(key)}:</span> {value.toString()}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewLatestEvaluation;
