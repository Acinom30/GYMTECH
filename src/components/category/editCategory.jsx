import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';


const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategory();
    }, [id]);

    const fetchCategory = async () => {
        try {
            const categoryDoc = await getDoc(doc(db, "categorias", id));
            if (categoryDoc.exists()) {
                const categoryData = categoryDoc.data();
                setFormData({
                    nombre: categoryData.nombre,
                    descripcion: categoryData.descripcion
                });
                setLoading(false);
            } else {
                ToastifyError("La categoría no existe");
            }
        } catch (error) {
            ToastifyError("Error al obtener la categoría");
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.descripcion) {
            ToastifyError("Por favor, complete todos los campos obligatorios");
            return;
        }
        try {
            await updateDoc(doc(db, 'categorias', id), formData);
            ToastifySuccess('Categoría actualizada correctamente');
            navigate('/categoriesList')
        } catch (error) {
            ToastifyError('Error al actualizar la categoría');
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative mb-5 mt-14">
                <h1 className="text-3xl font-bold mb-10">Editar Categoría</h1>
                {loading ? (
                    <p>Cargando categoría...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full sm:w-96">
                        <label htmlFor="nombre" className="block font-semibold mb-5">Nombre de la categoría</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full bg-gray-200 rounded-md px-4 py-3 mb-8"
                        />
                        <label htmlFor="descripcion" className="block font-semibold mb-5">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="w-full bg-gray-200 rounded-md px-4 py-3 mb-8"
                        />
                        <div className="flex justify-center md:justify-end">
                            <Link to={`/categoriesList`} className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-3">
                                Volver
                            </Link>
                            <button type="submit" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-500 hover:text-white">
                                Guardar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditCategory;