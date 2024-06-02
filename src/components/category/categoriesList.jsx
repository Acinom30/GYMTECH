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
        <div >
        <Header />
            <div className="flex flex-col items-center justify-center relative mr-5 ml-5">
                <h1 className="text-3xl font-bold mb-10">Lista de Categorías</h1>
                {loading ? (
                    <p>Cargando categorías...</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 p-10">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map(category => (
                                <tr key={category.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{category.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{category.descripcion}</td>
                                    <td className="px-6 py-4 flex justify-center">
                                    <Link
                                            to={`/editCategory/${category.id}`}
                                            className="bg-yellow-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded mr-2"
                                        >
                                            Editar
                                        </Link>
                                        {user.rol === 'administrador' && (
                                            <button
                                                onClick={() => handleDeleteCategory(category)}
                                                className="bg-yellow-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
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
                    <Link to="/home" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-4">
                        Volver
                    </Link>
                    <Link to="/addCategory" className="bg-yellow-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Agregar Categoria
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CategoriesList;
