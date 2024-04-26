import { useEffect, useState } from "react";
//import ItemList from "./ItemList";
//import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { addDoc } from "firebase/firestore";

const AddUser = () => {
    const [formData, setFormData] = useState({
        primerNombre: "",
        segundoNombre: "",
        apellido1: "",
        apellido2: "",
        cedula: "",
        fechaNacimiento: "",
        enfermedades: "",
        telefono: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const usuariosRef = collection(db, "usuarios");
        await addDoc(usuariosRef, formData);

        // Limpiar el formulario después de enviar los datos
        setFormData({
            primerNombre: "",
            segundoNombre: "",
            apellido1: "",
            apellido2: "",
            cedula: "",
            fechaNacimiento: "",
            enfermedades: "",
            telefono: ""
        });
    };

    return (
        <div>
            <h1>Agregar Usuario</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="Nombre">Primer Nombre:</label>
                <input type="text" id="Nombre" name="Nombre" value={formData.Nombre} onChange={handleChange} />
                <label htmlFor="SegundoNombre">Segundo Nombre:</label>
                <input type="text" id="SegundoNombre" name="SegundoNombre" value={formData.SegundoNombre} onChange={handleChange} />
                <label htmlFor="PrimerApellido">Primer Apellido:</label>
                <input type="text" id="PrimerApellido" name="PrimerApellido" value={formData.PrimerApellido} onChange={handleChange} />
                <label htmlFor="SegundoApellido">Segundo Apellido:</label>
                <input type="text" id="SegundoApellido" name="SegundoApellido" value={formData.SegundoApellido} onChange={handleChange} />
                {/* Otros campos de formulario similares para los otros datos del usuario */}

                <button type="submit">Guardar</button>
            </form>
        </div>
    );
};

export default AddUser;
