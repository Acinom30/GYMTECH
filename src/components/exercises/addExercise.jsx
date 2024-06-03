import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, doc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import Header from '../general/navigationMenu';

const AddExercise = () => {
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        url: '',
    });

    useEffect(() => {
        const obtenerCategorias = async () => {
            const categoriasRef = collection(db, "categorias");
            const categoriasSnapshot = await getDocs(categoriasRef);
            const categoriasData = categoriasSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategorias(categoriasData);
        };
        obtenerCategorias();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: name === 'categorias' ? categorias.find(c => c.id === value).id : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.descripcion || !formData.categoria) {
            ToastifyError("Por favor, complete todos los campos obligatorios");
            return;
        }
        try {
            const categoriaRef = doc(db, "categorias", formData.categoria);
            const dataWithCategoriaRef = {
                ...formData,
                categoria: categoriaRef
            };

            const registerExercise = collection(db, "ejercicios");
            await addDoc(registerExercise, dataWithCategoriaRef);
            ToastifySuccess("Se ha registrado el ejercicio correctamente");
            setFormData({
                nombre: '',
                descripcion: '',
                categoria: '',
                url: '',
            });
        } catch (error) {
            console.error("Error al guardar el ejercicio:", error);
            ToastifyError("Hubo un error al guardar el ejercicio. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    const handleChangeCategoria = (e) => {
        const categoriaId = e.target.value;
        setFormData({
            ...formData,
            categoria: categoriaId
        });
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative">
                <h1 className="text-3xl font-bold mb-10">Registrar Ejercicio</h1>
                    <label htmlFor="nombre" className="block font-semibold mb-5">Nombre del ejercicio</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                        />
                    <label htmlFor="descripcion" className="block font-semibold mb-5">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                        />
                    <div className="flex flex-col gap-6">
                        <label className="block font-semibold text-center">Categoría:</label>
                        <select
                            id="categoria"
                            name="categoria"
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8"

                            value={formData.categoria}
                            onChange={handleChangeCategoria}
                        >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <label htmlFor="url" className="block font-semibold mb-5">Url del ejercicio</label>
                    <input
                        type="text"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                        />
                    <div className="flex justify-center md:justify-end">
                        <Link to="/editExercises" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                            Volver
                        </Link>
                        <button onClick={handleSubmit} type="submit" className="bg-yellow-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4">
                            Guardar
                        </button>
                    </div>
            </div>
        </div>
    );
};

export default AddExercise;
