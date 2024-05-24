import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";

const EditRoutine = () => {
    const location = useLocation();
    const { routineId, clientId } = location.state || {};
    const [categorias, setCategorias] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
    const [rutina, setRutina] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const predefinedColors = [
        '#FFD1DC', '#FFD700', '#90EE90', '#ADD8E6', '#9370DB', '#FFA500', '#D8BFD8', '#4B0082', '#FF00FF',
        '#32CD32', '#FF1493', 'transparent',
    ];
    const [fechaCambio, setFechaCambio] = useState("");

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        categoria: '',
        ejercicio: '',
        series: '',
        observaciones: '',
        color: '',
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

        const obtenerRutina = async () => {
            if (routineId) {
                const rutinaRef = doc(db, "rutinas", routineId);
                const rutinaSnapshot = await getDoc(rutinaRef);
                if (rutinaSnapshot.exists()) {
                    const rutinaData = rutinaSnapshot.data();
                    setRutina(rutinaData.ejercicios);
                    setSelectedColor(rutinaData.color);
                    setFechaCambio(rutinaData.fechaCambio);
                }
            }
        };

        obtenerCategorias();
        obtenerRutina();
    }, [routineId]);

    const handleChangeCategoria = async (e) => {
        const categoriaId = e.target.value;
        console.log(categoriaId)
        setFormData({
            ...formData,
            categoria: categoriaId
        });
        if (categoriaId) {
            const categoriaRef = doc(db, "categorias", categoriaId);
            const ejerciciosRef = collection(db, "ejercicios");
            const q = query(ejerciciosRef, where('categoria', '==', categoriaRef));

            const ejerciciosSnapshot = await getDocs(q);
            const ejerciciosData = ejerciciosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEjercicios(ejerciciosData);
        } else {
            setEjercicios([]);
        }
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleChangeEjercicio = (e, ejercicio) => {
        setEjercicioSeleccionado(ejercicio);
        setFormData((prevFormData) => ({
            ...prevFormData,
            ejercicio: ejercicio.id,
        }));
    };

    const handleAddExercise = async () => {
        if (!formData.ejercicio || !formData.series || !formData.observaciones) {
            console.log("Tiene que ingresar todos los campos obligatorios");
            return;
        }
        const nuevoEjercicio = {
            id: formData.ejercicio,
            nombre: ejercicioSeleccionado.nombre,
            series: formData.series,
            observaciones: formData.observaciones,
            color: '',
        };
        setRutina([...rutina, nuevoEjercicio]);
        setFormData({
            categoria: '',
            ejercicio: '',
            series: '',
            observaciones: '',
            color: '',
        });
        setEjercicios([]);
        setEjercicioSeleccionado(null);
    };

    const handleEditExercise = async (index) => {
        const ejercicio = rutina[index];
        const ejercicioRef = doc(db, 'ejercicios', ejercicio.id);
        const ejercicioSnapshot = await getDoc(ejercicioRef);
        const ejercicioData = ejercicioSnapshot.data();
        const ejercicioSeleccionado = await obtenerEjerciciosSeleccionado(ejercicioData.categoria);
        setEjercicios(ejercicioSeleccionado);
        setFormData({
            ejercicio: ejercicio.id,
            series: ejercicio.series,
            observaciones: ejercicio.observaciones,
        });
        setEjercicioSeleccionado(ejercicio);
        handleDeleteExercise(index);
    };

    const obtenerEjerciciosSeleccionado = async (categoriaId) => {
        const ejerciciosRef = collection(db, "ejercicios");
        const q = query(ejerciciosRef, where('categoria', '==', categoriaId));
        const ejerciciosSnapshot = await getDocs(q);
        return ejerciciosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    };

    const handleDeleteExercise = (index) => {
        const nuevaRutina = rutina.filter((_, i) => i !== index);
        setRutina(nuevaRutina);
    };

    const handleSaveRoutine = async () => {
        try {
            const rutinaRef = doc(db, "rutinas", routineId);
            await updateDoc(rutinaRef, {
                ejercicios: rutina,
                color: selectedColor,
                fechaCambio: fechaCambio
            });
            alert("Rutina actualizada exitosamente.");
            navigate('/selectUserRoutine');
        } catch (error) {
            console.error("Error actualizando la rutina: ", error);
        }
    };

    const handleColorSelection = (color) => {
        setSelectedColor(color);
    };

    const handleExerciseColorSelect = async (index, color) => {
        const updatedRutina = [...rutina];
        updatedRutina[index].color = color;
        setRutina(updatedRutina);
    };

    const handleFechaCambioEdit = (event) => {
        setFechaCambio(event.target.value);
    };

    return (
        <div>
            <Header />
            <h1 className="text-3xl font-bold mb-2 ml-5">Editar Rutina</h1>
            <h3 className="mb-2 ml-5"><strong>Nombre: </strong> {clientId.primerNombre} {clientId.primerApellido}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Categoría</h3>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChangeCategoria}
                            className="w-full bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                        >
                            <option value="">Seleccione una categoría</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Seleccionar ejercicio</h3>
                        <ul className="list-none">
                            {ejercicios.map((ejercicio) => (
                                <li
                                    key={ejercicio.id}
                                    onClick={(e) => handleChangeEjercicio(e, ejercicio)}
                                    className={`p-2 mb-2 rounded-md cursor-pointer transition-colors duration-300 ${ejercicioSeleccionado?.id === ejercicio.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
                                        }`}
                                >
                                    {ejercicio.nombre} - Descripción: {ejercicio.descripcion}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Series</h3>
                        <textarea
                            id="series"
                            name="series"
                            value={formData.series}
                            onChange={handleChange}
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8"
                        />
                    </div>
                    <div className="bg-white rounded-md shadow-md p-4 mt-5">
                        <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8"
                        />
                        <div className="flex justify-end">
                            <button onClick={() => navigate('/selectUserRoutine')} type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ml-4 mt-8">
                                Atrás
                            </button>
                            <button onClick={handleAddExercise} type="button" className="bg-yellow-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4 mt-8">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-4">Rutina Actual</h3>
                        {rutina.length === 0 ? (
                            <p>No hay ejercicios en la rutina.</p>
                        ) : (
                            rutina.map((ejercicio, index) => (
                                <div key={index} className="mb-4">
                                    <div className="p-4 rounded-md shadow-md" style={{ backgroundColor: ejercicio.color || '#f0f0f0' }}>
                                        <h4 className="text-lg font-bold mb-2">{ejercicio.nombre}</h4>
                                        <p className="mb-2">Series: {ejercicio.series}</p>
                                        <p className="mb-2">Observaciones: {ejercicio.observaciones}</p>
                                        <div className='align-items-left'>
                                            <button onClick={() => handleEditExercise(index)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded mr-2">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDeleteExercise(index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded mr-2">
                                                Eliminar
                                            </button>
                                            <button onClick={() => handleExerciseColorSelect(index, selectedColor)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded">
                                                Aplicar Color
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 mt-12">Seleccionar Color</h3>
                            {predefinedColors.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorSelection(color)}
                                    style={{
                                        backgroundColor: color,
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        marginRight: '10px',
                                        border: selectedColor === color ? '4px solid #000' : '1px solid #ccc',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 mt-12">Fecha de cambio</h3>
                        <div className="mt-4">
                            <input
                                type="date"
                                id="fechaCambio"
                                name="fechaCambio"
                                value={fechaCambio}
                                onChange={handleFechaCambioEdit}
                                className="w-50 bg-gray-200 rounded-md px-4 py-3 text-center"
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleSaveRoutine}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4"
                            >
                                Actualizar Rutina
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditRoutine;