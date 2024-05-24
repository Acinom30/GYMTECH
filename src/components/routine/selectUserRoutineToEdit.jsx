import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const SelectRoutineToEdit = () => {
    const [clientes, setClientes] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [rutinas, setRutinas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            const clientsSnapshot = await getDocs(collection(db, 'usuarios'));
            const clientsList = clientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setClientes(clientsList);
        };

        fetchClients();
    }, []);

    const handleClientSelect = async (clientId) => {
        setSelectedClient(clientId);
        const rutinasRef = collection(db, 'rutinas');
        const q = query(rutinasRef, orderBy('fechaCreacion', 'desc'));
        const rutinasSnapshot = await getDocs(q);
        const rutinasList = rutinasSnapshot.docs
            .filter(doc => doc.data().clientId.id === clientId)
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        setRutinas(rutinasList);
    };

    const handleEditRoutine = (routineId) => {
        navigate('/editRoutine', { state: { routineId, clientId: selectedClient } });
    };

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Seleccionar Cliente y Rutina</h1>
                <div>
                    <label className="block mb-2">Seleccionar Cliente:</label>
                    <select
                        className="w-full bg-gray-200 rounded-md px-4 py-2 mb-4"
                        onChange={(e) => handleClientSelect(e.target.value)}
                    >
                        <option value="">Seleccionar Cliente</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.primerNombre} {cliente.primerApellido} - Cédula: {cliente.cedula}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedClient && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Rutinas del Cliente</h2>
                        <ul>
                            {rutinas.map(rutina => (
                                <li key={rutina.id} className="mb-2">
                                    <div className="bg-white p-4 rounded shadow">
                                        <p><strong>Fecha de Creación:</strong> {rutina.fechaCreacion}</p>
                                        <button
                                            onClick={() => handleEditRoutine(rutina.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
                                        >
                                            Editar Rutina
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectRoutineToEdit;
