import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, getDoc, updateDoc, getDocs, doc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import Header from '../general/navigationMenu';

const ExerciseForm = ({ formType, exerciseId }) => {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        url: '',
    });
    const [loading, setLoading] = useState(true);

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

        if (formType === 'edit' && exerciseId) {
            fetchExercise();
        } else {
            setLoading(false);
        }
    }, [formType, exerciseId]);

    const fetchExercise = async () => {
        try {
            const exerciseDoc = await getDoc(doc(db, "ejercicios", exerciseId));
            if (exerciseDoc.exists()) {
                const exerciseData = exerciseDoc.data();
                const categoriaId = exerciseData.categoria.id;
                setFormData({ ...exerciseData, categoria: categoriaId });
                setLoading(false);
            } else {
                ToastifyError("No se encontró el ejercicio.");
                setLoading(false);
            }
        } catch (error) {
            ToastifyError("Error al obtener el ejercicio:", error);
            setLoading(false);
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

            if (formType === 'edit') {
                await updateDoc(doc(db, "ejercicios", exerciseId), dataWithCategoriaRef);
                ToastifySuccess('Los cambios se guardaron exitosamente.');
            } else {
                await addDoc(collection(db, "ejercicios"), dataWithCategoriaRef);
                ToastifySuccess("Se ha registrado el ejercicio correctamente");
                setFormData({
                    nombre: '',
                    descripcion: '',
                    categoria: '',
                    url: '',
                });
            }
            navigate('/editExercises');
        } catch (error) {
            ToastifyError(`Error al ${formType === 'edit' ? 'guardar los cambios' : 'registrar el ejercicio'}. Por favor, inténtalo de nuevo más tarde.`);
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative mb-5 mt-14">
                <h1 className="text-3xl font-bold mb-10">
                    {formType === 'edit' ? 'Editar Ejercicio' : 'Registrar Ejercicio'}
                </h1>
                {loading ? (
                    <p>Cargando ejercicio...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-lg w-full">
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select name="categoria" id="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full">
                                <option value="">Seleccionar categoría</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Url del ejercicio</label>
                            <input type="text" name="url" id="url" value={formData.url} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full" />
                        </div>
                        <div className="flex justify-end">
                            <Link to="/editExercises" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-3">
                                Volver
                            </Link>
                            <button type="submit" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-500 hover:text-white">
                                {formType === 'edit' ? 'Guardar Cambios' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExerciseForm;
