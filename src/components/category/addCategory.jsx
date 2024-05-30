import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import Header from '../general/navigationMenu';

const AddCategory = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

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
            const categoriasRef = collection(db, "categorias");
            await addDoc(categoriasRef, formData);
            ToastifySuccess("Se ha registrado la categoría correctamente");
            setFormData({
                nombre: '',
                descripcion: ''
            });
        } catch (error) {
            console.error("Error al guardar la categoría:", error);
            ToastifyError("Hubo un error al guardar la categoría. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative">
                <h1 className="text-3xl font-bold mb-10">Registrar Categoría</h1>
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
                        <Link to="/categoriesList" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                            Volver
                        </Link>
                        <button type="submit" className="bg-yellow-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;
