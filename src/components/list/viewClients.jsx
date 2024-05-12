import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';

const ViewClients = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

  
    useEffect(() => {
        const fetchClients = async () => {
          const querySnapshot = await getDocs(collection(db, 'usuarios'));
          const clientsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          const filteredClients = clientsData.filter(client => {
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const fullName = normalize(`${client.primerNombre} ${client.primerApellido}`).toLowerCase();
            const cedula = normalize(client.cedula).toLowerCase();
            const searchTermLower = normalize(searchTerm).toLowerCase();
            return fullName.includes(searchTermLower) || cedula.includes(searchTermLower);
          });
          setClients(filteredClients);
        };
      
        fetchClients();
      }, [searchTerm]);
          

    const handleShowDetails = (client) => {
      setSelectedClient(client);
    };

    const handleEditClient = (client) => {
      // editar cliente
    };

    const handleDeleteClient = (client) => {
      // eliminar cliente
    };
  
    return (
      <div className="container mx-auto p-4">
        <Header/>
        <h1 className="text-3xl font-bold text-center mb-4">Clientes</h1>
        <div className="flex items-center justify-between mb-4">
        <input
            type="text"
            placeholder="Buscar por nombre, apellido o cédula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full"
        />
        <button
            onClick={() => setSearchTerm('')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 ml-2 rounded"
        >
            Limpiar
        </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-fixed w-full">
            <thead>
              <tr>
                <th className="w-1/4 px-4 py-2">Nombre</th>
                <th className="w-1/4 px-4 py-2">Apellido</th>
                <th className="w-1/4 px-4 py-2">Cédula</th>
                <th className="w-1/4 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className='text-center'>
                  <td className="border px-4 py-2">{client.primerNombre}</td>
                  <td className="border px-4 py-2">{client.primerApellido}</td>
                  <td className="border px-4 py-2">{client.cedula}</td>
                  <td className="border px-4 py-2">
                    <div className="inline-flex gap-5">
                      <button
                        onClick={() => handleShowDetails(client)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                      >
                        Editar
                      </button>
                      {client.rol === "administrador" && (
                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedClient && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Detalles de {selectedClient.primerNombre} {selectedClient.primerApellido}
              </h2>
              <p><strong>Cédula:</strong> {selectedClient.cedula}</p>
              <p><strong>Nombre Completo:</strong> {selectedClient.primerNombre} {selectedClient.segundoNombre}</p>
              <p><strong>Apellidos:</strong> {selectedClient.primerApellido} {selectedClient.segundoApellido}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Teléfono:</strong> {selectedClient.telefono}</p>
              <p><strong>Observaciones/Enfermedades:</strong><br/> {selectedClient.observaciones}</p>
              <div className="mt-4 flex justify-center">
                <button onClick={() => setSelectedClient(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default ViewClients;
