import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';

const ExercisesList = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState({});


    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const exercisesRef = collection(db, "ejercicios");
                const exercisesSnapshot = await getDocs(exercisesRef);
                const exercisesData = exercisesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const categoriesRef = collection(db, "categorias");
                const categoriesSnapshot = await getDocs(categoriesRef);
                const categoriesData = categoriesSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = doc.data().nombre;
                    return acc;
                }, {});
                setExercises(exercisesData);
                setCategories(categoriesData);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener los ejercicios y categorías:", error);
                setLoading(false);
            }
        };
        fetchExercises();
    }, []);


    const handleDeleteExercise = async (exerciseId) => {
        try {
            await deleteDoc(doc(db, "ejercicios", exerciseId));
            setExercises(prevExercises => prevExercises.filter(exercise => exercise.id !== exerciseId));
        } catch (error) {
            console.error("Error al eliminar el ejercicio:", error);
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative mr-5 ml-5">
                <h1 className="text-3xl font-bold mb-10">Lista de Ejercicios</h1>
                {loading ? (
                    <p>Cargando ejercicios...</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exercises.map(exercise => (
                                <tr key={exercise.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{exercise.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{exercise.descripcion}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{categories[exercise.categoria.id]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/editExercise/${exercise.id}`} className="text-indigo-600 hover:text-indigo-900 mr-2">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDeleteExercise(exercise.id)} className="text-red-600 hover:text-red-900">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="flex justify-center md:justify-end mt-6">
                    <Link to="/home" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        Volver
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExercisesList;