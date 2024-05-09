import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const handleSelectEjercicio = (id) => {
    console.log("Ejercicio seleccionado:", id);
    // Aquí puedes realizar la lógica para manejar la selección del ejercicio
};

const EjercicioForm = () => {
    const [categorias, setCategorias] = useState([]);
    const [ejercicios, setEjercicios] = useState([]);
    const [formData, setFormData] = useState({
        // Otros campos de formulario
        categoria: "",
        ejercicio: "",
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

    const handleChangeCategoria = async (e) => {
        const categoriaId = e.target.value;
        setFormData({
            ...formData,
            categoria: categoriaId,
            ejercicio: "" // Reiniciar el ejercicio seleccionado al cambiar la categoría
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

    const handleChangeEjercicio = (e) => {
        const ejercicioId = e.target.value;
        setFormData({
            ...formData,
            ejercicio: ejercicioId
        });
    };

    return (
        <div>
            <h2>Formulario de Ejercicio</h2>
            <form>
                {/* Otros campos de formulario */}
                <div className="form-group">
                    <label htmlFor="categoria">Categoría:</label>
                    <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChangeCategoria}>
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="ejercicio">Ejercicio:</label>
                    <select id="ejercicio" name="ejercicio" value={formData.ejercicio} onChange={handleChangeEjercicio}>
                        <option value="">Seleccionar ejercicio</option>
                        {ejercicios.map(ejercicio => (
                            <option key={ejercicio.id} value={ejercicio.id}>{ejercicio.nombre}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">Guardar</button>
            </form>
            <div className="ejercicios-lista" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <ul>
                    {ejercicios.map(ejercicio => (
                        <li key={ejercicio.id}>
                            <button type="button" onClick={() => handleSelectEjercicio(ejercicio.id)}>{ejercicio.nombre}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
    
    
};

export default EjercicioForm;
