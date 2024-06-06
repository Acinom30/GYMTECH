import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EditRoutine = () => {
    const location = useLocation();
    const { routineId, clientId } = location.state || {};
    const [categorias, setCategorias] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
    const [rutina, setRutina] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const predefinedColors = [
        '#FFD1DC', '#FFD700', '#90EE90', '#ADD8E6', '#9370DB', '#FFA500', '#D8BFD8', '#4B0082', '#FF00FF',
        '#32CD32', '#FF1493', 'transparent',
    ];
    const [fechaCambio, setFechaCambio] = useState("");
    const navigate = useNavigate();
    const [cantidadDias, setCantidadDias] = useState(null);

    const [formData, setFormData] = useState({
        categoria: '',
        ejercicio: '',
        series: '',
        observaciones: '',
        color: '',
        dia: '',
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
            obtenerRutina();
            setIsLoading(false)
        };

        const obtenerRutina = async () => {
            if (routineId) {
                setIsLoading(true);
                const rutinaRef = doc(db, "rutinas", routineId);
                const rutinaSnapshot = await getDoc(rutinaRef);
                if (rutinaSnapshot.exists()) {
                    const rutinaData = rutinaSnapshot.data();
                    setRutina(rutinaData.ejercicios);
                    setSelectedColor(rutinaData.color);
                    setFechaCambio(rutinaData.fechaCambio);
                    if (rutinaData.valoracion != null) {
                        const valoracionRef = doc(db, 'valoraciones', rutinaData.valoracion);
                        const snapShotValoracion = await getDoc(valoracionRef);
                        if (snapShotValoracion.exists()) {
                            const valoracionData = snapShotValoracion.data();
                            setCantidadDias(valoracionData.diasSemana);
                        }
                    } else {
                        setCantidadDias(6);
                    }
                }
            }
        };
        obtenerCategorias();
        obtenerRutina();
    }, [routineId]);



    const handleChangeCategoria = async (e) => {
        const categoriaId = e.target.value;
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
        if (!formData.ejercicio || !formData.series || !formData.observaciones || !formData.dia) {
            ToastifyError("Tiene que ingresar todos los campos obligatorios");
            return;
        }
        const nuevoEjercicio = {
            id: formData.ejercicio,
            nombre: ejercicioSeleccionado.nombre,
            series: formData.series,
            observaciones: formData.observaciones,
            color: formData.color,
            dia: formData.dia,
        };
        setRutina([...rutina, nuevoEjercicio]);
        setFormData({
            categoria: '',
            ejercicio: '',
            series: '',
            observaciones: '',
            color: '',
            dia: null,
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
        console.log(ejercicio);
        console.log(ejercicio.nombre)
        console.log(ejercicio.observaciones)

        setFormData({
            ejercicio: ejercicio.id,
            series: ejercicio.series,
            observaciones: ejercicio.observaciones,
            dia: ejercicio.dia,
            color: ejercicio.color
        });
        setEjercicioSeleccionado(ejercicio);
        //setDiaSeleccionado(diaSeleccionado); // Si es necesario, establece el día seleccionado en el estado
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
                fechaCambio: fechaCambio
            });
            ToastifySuccess("Rutina actualizada exitosamente.");
            navigate('/selectUserRoutine');
        } catch (error) {
            ToastifyError("Error actualizando la rutina");
            console.log(error)
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

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(rutina);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setRutina(items);
    };

    const handleDiaChange = (e) => {
        const diaSeleccionado = parseInt(e.target.value);
        setFormData((prevFormData) => ({
            ...prevFormData,
            dia: diaSeleccionado,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Header />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Seleccionar categoría</h3>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChangeCategoria}
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8"
                        >
                            <option value="">Seleccionar categoría</option>
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
                        <h3 className="text-lg font-semibold mb-2">Día correspondiente</h3>
                        <div className="flex items-center space-x-4">
                            {
                                Array.from({ length: cantidadDias }, (_, i) => (
                                    <div key={i} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`dia-${i + 1}`}
                                            name="dia"
                                            value={i + 1}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            onChange={handleDiaChange}
                                            checked={formData.dia === i + 1}
                                        />
                                        <label htmlFor={`dia-${i + 1}`} className="ml-2">
                                            {i + 1}
                                        </label>
                                    </div>
                                ))
                            }
                        </div>
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
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                        {rutina.map((ejercicio, index) => (
                                            <Draggable key={index} draggableId={index.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white rounded-md shadow-md p-4 flex items-center justify-between"
                                                    >
                                                        <div className="flex flex-col">
                                                            <p className="text-lg font-bold underline">Día: {ejercicio.dia}</p>
                                                            <p className="text-lg font-semibold">{ejercicio.nombre}</p>
                                                            <p className="max-w-xs overflow-ellipsis overflow-hidden">Series: {ejercicio.series}</p>
                                                            <p className="max-w-xs overflow-ellipsis overflow-hidden">Obs: {ejercicio.observaciones}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-4">

                                                            <button onClick={() => handleEditExercise(index)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded mt-4 mr-2 text-xs">Editar</button>
                                                            <button onClick={() => handleDeleteExercise(index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded mt-4 mr-2 text-xs">Eliminar</button>
                                                            <button onClick={() => handleExerciseColorSelect(index, selectedColor)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded mt-4 mr-2 text-xs">Asignar color</button>
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-black"
                                                                style={{
                                                                    backgroundColor: ejercicio.color || 'transparent',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

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
                                className="bg-yellow-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
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
