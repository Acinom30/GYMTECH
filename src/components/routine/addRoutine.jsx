import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';


const AddRoutine = () => {
    const location = useLocation();
    const client = location.state?.client;
    const [mostrarVentana, setMostrarVentana] = useState(false);
    const [valoracionMasReciente, setValoracionMasReciente] = useState(null);
    const [IDValoracionMasReciente, setIDValoracionMasReciente] = useState(null);

    const [edad, setEdad] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
    const [rutina, setRutina] = useState([]);
    const [seleccionFechaCambio, setSeleccionFechaCambio] = useState("");

    const predefinedColors = [
        '#FFD1DC', '#FFD700', '#90EE90', '#ADD8E6', '#9370DB', '#FFA500', '#D8BFD8', '#4B0082', '#FF00FF',
        '#32CD32', '#FF1493', 'transparent',
    ];
    const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);


    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        categoria: '',
        ejercicio: '',
        series: '',
        observaciones: '',
        color: '',
    });

    useEffect(() => {
        const obtenerValoracionMasReciente = async () => {
            try {
                const valoracionesRef = collection(db, "valoraciones");
                const snapshot = await getDocs(valoracionesRef);
                const valoraciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (valoraciones.length > 0) {
                    const valoracionMasReciente = valoraciones.reduce((max, val) => {
                        const fechaMax = new Date(max.fechaValoracion);
                        const fechaVal = new Date(val.fechaValoracion);
                        return fechaVal > fechaMax ? val : max;
                    });
                    setValoracionMasReciente(valoracionMasReciente);
                    if (valoracionMasReciente && valoracionMasReciente.id) {
                        setIDValoracionMasReciente(valoracionMasReciente.id);
                    } else {
                        console.error("ID de valoración más reciente no encontrado.");
                    }
                } else {
                    console.log("No se encontraron valoraciones.");
                }
            } catch (error) {
                console.error("Error al obtener la valoración más reciente:", error);
            }
        };

        if (client && client.id) {
            obtenerValoracionMasReciente();
        }

        // Calcular la edad
        if (client && client.fechaNacimiento) {
            const fechaNacimiento = new Date(client.fechaNacimiento);
            const edadCalculada = calcularEdad(fechaNacimiento);
            setEdad(edadCalculada);
        }
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

    }, [client]);

    const toggleVentana = () => {
        setMostrarVentana(!mostrarVentana);
    };

    const calcularEdad = (fechaNacimiento) => {
        const diferenciaFechas = Date.now() - fechaNacimiento.getTime();
        const edad = new Date(diferenciaFechas);
        return Math.abs(edad.getUTCFullYear() - 1970);
    };

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
        console.log(formData)
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
            console.log("Tiene que ingresar todos los campos obligatorios")
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
        setFormData({
            ejercicio: ejercicio.id,
            series: ejercicio.series,
            observaciones: ejercicio.observaciones,
        });
        setEjercicioSeleccionado(ejercicio);
        handleDeleteExercise(index);
    };

    const handleDeleteExercise = (index) => {
        const nuevaRutina = rutina.filter((_, i) => i !== index);
        setRutina(nuevaRutina);
    };

    const handleSaveRoutine = async () => {
        try {
            if (seleccionFechaCambio === "") {
                console.log("Tiene que ingresar todos los campos obligatorios")
                return;
            }
            const fechaCambio = calcularFechaCambio(seleccionFechaCambio);
            const rutinaRef = collection(db, "rutinas");
            const usuarioRef = doc(db, "usuarios", client.id);
            await addDoc(rutinaRef, {
                clientId: usuarioRef,
                valoracion: IDValoracionMasReciente,
                ejercicios: rutina,
                fechaCreacion: new Date().toISOString().split('T')[0],
                fechaCambio: fechaCambio,
            });
            alert("Rutina guardada exitosamente.");
            navigate('/selectUserRoutine')

            setRutina([]);

        } catch (error) {
            console.error("Error guardando la rutina: ", error);
        }
    };

    const handleOptionChange = (event) => {
        setSeleccionFechaCambio(event.target.value);
    };

    const calcularFechaCambio = (opcion) => {
        let fechaCambio = new Date();

        switch (opcion) {
            case '1 mes':
                fechaCambio.setMonth(fechaCambio.getMonth() + 1);
                break;
            case '1 mes y medio':
                fechaCambio.setMonth(fechaCambio.getMonth() + 1);
                fechaCambio.setDate(fechaCambio.getDate() + 15);
                break;
            case '2 meses':
                fechaCambio.setMonth(fechaCambio.getMonth() + 2);
                break;
            default:
                console.error('Selección de fecha de cambio inválida');
                return null;
        }

        const formattedDate = fechaCambio.toISOString().split('T')[0];
        return formattedDate;
    };

    const handleColorSelection = (color) => {
        setSelectedColor(color);
    };

    const handleExerciseColorSelect = async (index, color) => {
        const updatedRutina = [...rutina];
        updatedRutina[index].color = color;
        setRutina(updatedRutina);
    };

    //Tal vez se pueda implemtentar.
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(rutina);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setRutina(items);
    };

    const limpiarRutina = () => {
        setRutina([]);
        //setSeleccionFechaCambio = ""
    };

    return (
        <div>
            <Header />
            <h1 className="text-2xl font-bold mb-2 ml-5">Usuario:</h1>
            <div className="bg-gray-100 p-4 rounded-md shadow-md">
                <p className="text-lg ml-5">
                    {client?.primerNombre} {client?.segundoNombre} {client?.primerApellido} {client?.segundoApellido}, Cédula:{' '}
                    {client?.cedula}
                    <span onClick={toggleVentana} style={{ cursor: 'pointer', marginLeft: '10px' }}>
                        &#9432;
                    </span>
                </p>
            </div>
            {mostrarVentana && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Detalles de valoración {client?.primerNombre} {client?.primerApellido}
                        </h2>
                        {valoracionMasReciente && (
                            <div>
                                <p>
                                    <strong>Fecha de Valoración:</strong> {valoracionMasReciente.fechaValoracion}
                                </p>
                                <p>
                                    <strong>Objetivo:</strong> {valoracionMasReciente.objetivo}
                                </p>
                                {edad && (
                                    <p>
                                        <strong>Edad:</strong> {edad} años
                                    </p>
                                )}
                                <p>
                                    <strong>Enfermedades:</strong> {client.observaciones}
                                </p>
                                <p>
                                    <strong>Lesiones:</strong> {valoracionMasReciente.lesionesActuales}
                                </p>
                                <p>
                                    <strong>Días por semana:</strong> {valoracionMasReciente.diasSemana}
                                </p>
                                <p>
                                    <strong>Peso:</strong> {valoracionMasReciente.peso}
                                </p>
                                <p>
                                    <strong>Altura:</strong> {client?.altura}
                                </p>
                                <p>
                                    <strong>Porcentaje Grasa Corporal:</strong> {valoracionMasReciente.grasaCorporal}
                                </p>
                                <p>
                                    <strong>Porcentaje Músculo Corporal:</strong> {valoracionMasReciente.musculoCorporal}
                                </p>

                            </div>
                        )}
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={toggleVentana}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cerrar
                            </button>
                        </div>

                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-white rounded-md shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2">Categoría</h3>
                    <select
                        id="categoria"
                        name="categoria"
                        className="w-full bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                        value={formData.categoria}
                        onChange={handleChangeCategoria}
                    >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
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
                    <div className="bg-white rounded-md shadow-md p-4 mt-5">
                        <h3 className="text-lg font-semibold mb-2">Series</h3>
                        <textarea
                            id="series"
                            name="series"
                            value={formData.series}
                            onChange={handleChange}
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8" // Centra el placeholder y el valor del input
                        />
                    </div>
                    <div className="bg-white rounded-md shadow-md p-4 mt-5">
                        <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8" // Centra el placeholder y el valor del input
                        />
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
                <div className="bg-white rounded-md shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2">Rutina</h3>
                    {rutina.length > 0 ? (
                        <ul>
                            {rutina.map((ejercicio, index) => (
                                <li
                                    key={index}
                                    className="mb-4 p-2 rounded-md shadow-sm"
                                    style={{ backgroundColor: ejercicio.color || 'transparent' }}
                                >       <div className="flex justify-between items-center">
                                        <div>
                                            <p><strong>Ejercicio:</strong> {ejercicio.nombre}</p>
                                            <p><strong>Series:</strong> {ejercicio.series}</p>
                                            <p><strong>Observaciones:</strong> {ejercicio.observaciones}</p>
                                        </div>
                                        <div>
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
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay ejercicios en la rutina.</p>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 mt-12">Fecha de cambio</h3>
                        <div className="flex items-center space-x-4">
                            <input
                                type="radio"
                                id="cambioUnMes"
                                name="cambioFecha"
                                value="1 mes"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                onChange={handleOptionChange}
                            />
                            <label htmlFor="cambioUnMes">1 mes</label>

                            <input
                                type="radio"
                                id="cambioUnMesMedio"
                                name="cambioFecha"
                                value="1 mes y medio"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                onChange={handleOptionChange}

                            />
                            <label htmlFor="cambioUnMesMedio">1 mes y medio</label>

                            <input
                                type="radio"
                                id="cambioDosMeses"
                                name="cambioFecha"
                                value="2 meses"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                onChange={handleOptionChange}

                            />
                            <label htmlFor="cambioDosMeses">2 meses</label>
                        </div>
                    </div>
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
                    <button onClick={limpiarRutina} type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4 mr-5">
                        Limpiar
                    </button>

                    <button onClick={handleSaveRoutine} type="button" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4">
                        Guardar Rutina
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRoutine;
