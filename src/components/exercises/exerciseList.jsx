import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { useUser } from '../../userContext'

const ExercisesList = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState({});
    const navigate = useNavigate();
    const { user } = useUser();


    useEffect(() => {
        fetchExercises();
    }, []);

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

    const handleDeleteExercise = async (exercise) => {
        confirmAlert({
            title: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar el ejercicio ${exercise.nombre}?`,
            buttons: [
                {
                    label: 'Sí',
                    onClick: async () => {
                        try {
                            await deleteDoc(doc(db, 'ejercicios', exercise.id));
                            ToastifySuccess('Ejercicio eliminado correctamente');
                            fetchExercises();
                        } catch (error) {
                            ToastifyError('Error al eliminar el ejercicio');
                            console.error('Error al eliminar el ejercicio: ', error);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exercises.map(exercise => (
                                <tr key={exercise.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{exercise.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{exercise.descripcion}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{categories[exercise.categoria.id]}</td>
                                    <td className="px-6 py-4 flex justify-center">
                                        <Link
                                            to={`/editExercise/${exercise.id}`}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded mr-2"
                                        >
                                            Editar
                                        </Link>
                                        {user.rol === 'administrador' && (
                                            <button
                                                onClick={() => handleDeleteExercise(exercise)}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                                            >
                                                Eliminar
                                            </button>
                                        )}
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
