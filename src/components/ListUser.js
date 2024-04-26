import { useEffect, useState } from "react";
//import ItemList from "./ItemList";
//import { useParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";


const ListUser = () => {

    const [usuarios, setUsuarios] = useState([]);

    const [nombre, setNombre] = useState("Usuarios");

    //const categoria = useParams().categoria;

    useEffect(() => {

        const usuariosRef = collection(db, "usuarios");
        //const q = categoria ? query(productosRef, where("categoria", "==", categoria)) : productosRef;

        getDocs(usuariosRef)
            .then((resp) => {
                setUsuarios(
                    resp.docs.map((doc) => {
                        return {...doc.data(), id: doc.id}
                    })
                )
            }
            )


    }, [/*categoria*/])


    return (
        <div>
            <h1>Usuarios Registrados</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Primer Apellido</th>
                        <th>Segundo Apellido</th>

                        {/* Agrega más encabezados según tus datos */}
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                            <td>{usuario.Nombre} {usuario.SegundoNombre}</td>
                            <td>{usuario.PrimerApellido}</td>
                            <td>{usuario.SegundoApellido}</td>

                            {/* Agrega más celdas según tus datos */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListUser;