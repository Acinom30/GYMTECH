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

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesRef = collection(db, "categorias");
            const categoriesSnapshot = await getDocs(categoriesRef);
            const categoriesData = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesData);
            setLoading(false);
        } catch (error) {
            ToastifyError("Error al obtener las categorías");
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        confirmAlert({
            title: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar la categoría ${category.nombre}?`,
            buttons: [
                {
                    label: 'Sí',
                    onClick: async () => {
                        try {
                            await deleteDoc(doc(db, 'categorias', category.id));
                            ToastifySuccess('Categoría eliminada correctamente');
                            fetchCategories();
                        } catch (error) {
                            ToastifyError('Error al eliminar la categoría');
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
            <div className="flex flex-col items-center justify-center relative mr-10 ml-10 mt-14">
                <div className="flex flex-col items-center w-full mb-4">
                    <div className="flex justify-center w-full mb-4">
                        <h1 className="text-3xl font-bold">Lista de Categorías</h1>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="flex space-x-4">
                            <Link to="/home" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-1">
                                Volver
                            </Link>
                            <Link to="/addCategory" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white">
                                Agregar Categoria
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <br />
            {loading ? (
                <p>Cargando categorías...</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 p-10">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto">Descripción</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-normal">{category.nombre}</td>
                                <td className="px-6 py-4 whitespace-normal">{category.descripcion}</td>
                                <td className="px-6 py-4 flex justify-center">
                                    <Link
                                        to={`/editCategory/${category.id}`}
                                        className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white mr-5"
                                        >
                                        Editar
                                    </Link>
                                    {user.user.rol === 'administrador' && (
                                        <button
                                            onClick={() => handleDeleteCategory(category)}
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
    );
};

export default CategoriesList;
