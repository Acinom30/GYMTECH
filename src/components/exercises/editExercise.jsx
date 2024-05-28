import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';

const EditExercise = () => {
    const { id } = useParams();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: ''
    });
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const exerciseDoc = await getDoc(doc(db, "ejercicios", id));
                if (exerciseDoc.exists()) {
                    setExercise({ id: exerciseDoc.id, ...exerciseDoc.data() });
                    setFormData({ ...exerciseDoc.data() });
                } else {
                    ToastifyError("No se encontró el ejercicio.");
                }
                setLoading(false);
            } catch (error) {
                ToastifyError("Error al obtener el ejercicio:", error);
                setLoading(false);
            }
        };
        fetchExercise();
    }, [id]);

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

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const categoriaRef = doc(db, "categorias", formData.categoria);
            const categoriaDoc = await getDoc(categoriaRef);
            if (categoriaDoc.exists()) {
                await updateDoc(doc(db, "ejercicios", id), {
                    ...formData,
                    categoria: categoriaRef
                });
                ToastifySuccess('Los cambios se guardaron exitosamente.');
                navigate('/editExercises')
            } else {
                ToastifyError('Hubo un error al guardar los cambios. La categoría seleccionada no existe.');
            }
        } catch (error) {
            ToastifyError('Hubo un error al guardar los cambios. Por favor inténtalo de nuevo más tarde.');
        }
    };

    if (loading) {
        return <p>Cargando ejercicio...</p>;
    }

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center relative">
                <h1 className="text-3xl font-bold mb-10">Editar Ejercicio</h1>
                <form onSubmit={handleSubmit} className="max-w-lg w-full">
                    <div className="mb-4">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange} className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select name="categoria" id="categoria" value={formData.categoria} onChange={handleInputChange} className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full">
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <Link to="/editExercises" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">Volver</Link>
                        <button type="submit"className="bg-indigo-500 text-white font-bold py-2 px-4 rounded">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExercise;
