import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { useUser } from '../../userContext'

const ExercisesList = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState({});
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
            ToastifyError("Error al obtener los ejercicios y categorías:");
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
                            const rutinasRef = collection(db, 'rutinas');
                            const rutinasSnapshot = await getDocs(rutinasRef);

                            rutinasSnapshot.forEach(async (rutinaDoc) => {
                                const rutinaData = rutinaDoc.data();
                                const ejercicios = rutinaData.ejercicios.filter(ej => ej.id !== exercise.id);

                                await updateDoc(doc(db, 'rutinas', rutinaDoc.id), { ejercicios });
                            });

                            await deleteDoc(doc(db, 'ejercicios', exercise.id));

                            ToastifySuccess('Ejercicio eliminado correctamente');
                            fetchExercises();
                        } catch (error) {
                            ToastifyError('Error al eliminar el ejercicio');
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
        <div >
            <Header />
            <div className="flex flex-col items-center justify-center relative mr-5 ml-5 mt-14">
                <div className="flex flex-col items-center w-full mb-4">
                    <div className="flex justify-center w-full mb-4">
                        <h1 className="text-3xl font-bold">Lista de Ejercicios</h1>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="flex space-x-4">
                            <Link to="/home" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-1">
                                Volver
                            </Link>
                            <Link to="/addExercises" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white">
                                Agregar Ejercicio
                            </Link>
                        </div>
                    </div>
                </div>
                <br />
                {loading ? (
                    <p>Cargando ejercicios...</p>
                ) : (

                    <table className="min-w-full divide-y divide-gray-200 p-10">
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
                                            className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white mr-5"
                                        >
                                            Editar
                                        </Link>
                                        {user.user.rol === 'administrador' && (
                                            <button
                                                onClick={() => handleDeleteExercise(exercise)}
                                                className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
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

            </div>
        </div>
    );
};


export default ExercisesList;
