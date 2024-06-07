import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';


const AddCategory = () => {
    const navigate = useNavigate();
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
            navigate('/categoriesList')
        } catch (error) {
            console.error("Error al guardar la categoría:", error);
            ToastifyError("Hubo un error al guardar la categoría. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative mb-5 mt-14">
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
                        <Link to="/categoriesList" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-3">
                            Volver
                        </Link>
                        <button type="submit" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-500 hover:text-white">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;
