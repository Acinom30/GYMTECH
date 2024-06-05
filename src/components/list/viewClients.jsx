import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import { useUser } from '../../userContext';

const ViewClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();
  const [viewRoutine, setViewRoutine] = useState([]);


  useEffect(() => {
    fetchClients();
  }, [searchTerm]);

  const fetchClients = async () => {
    try {
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
    } catch (error) {
      ToastifyError('Error obteniendo los usuarios');
    }
  };

  const fetchRoutines = async (client) => {
    try {
      const userRef = doc(db, 'usuarios', client.id);
      const rutinasQuery = query(collection(db, 'rutinas'), where('clientId', '==', userRef));
      const rutinasSnapshot = await getDocs(rutinasQuery);
      const routinesData = rutinasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setViewRoutine(routinesData);
      if (routinesData.length === 0) {
        ToastifyError('El cliente no tiene rutinas registradas');
      }
    } catch (error) {
      ToastifyError('Error obteniendo las rutinas');
    }
  };

  const handleShowDetails = (client) => {
    setSelectedClient(client);
  };

  const handleViewRoutines = (client) => {
    fetchRoutines(client);
  };

  const handleEditClient = (client) => {
    navigate('/userUpdate', { state: { client } });
  };

  const handleDeleteClient = async (client) => {
    const nombre = client.primerNombre + ' ' + client.primerApellido;
    confirmAlert({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el cliente ${nombre} y todas sus valoraciones y rutinas?`,
      buttons: [
        {
          label: 'Sí',
          onClick: async () => {
            try {
              await deleteClientData(client.id);
              ToastifySuccess('Cliente eliminado correctamente');
              fetchClients();
              navigate('/viewListClients');
            } catch (error) {
              ToastifyError('Error al eliminar el cliente');
              console.error('Error al eliminar el cliente: ', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const deleteClientData = async (clientId) => {
    const userRef = doc(db, 'usuarios', clientId);

    try {
      const valoracionesQuery = query(collection(db, 'valoraciones'), where('usuario', '==', userRef));
      const valoracionesSnapshot = await getDocs(valoracionesQuery);

      const deleteValoracionesPromises = valoracionesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deleteValoracionesPromises);
    } catch (error) {
      ToastifyError('Error eliminando las valoraciones');
      throw error;
    }

    try {
      const rutinasQuery = query(collection(db, 'rutinas'), where('clientId', '==', userRef));
      const rutinasSnapshot = await getDocs(rutinasQuery);

      const deleteRutinasPromises = rutinasSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deleteRutinasPromises);
    } catch (error) {
      ToastifyError('Error eliminando las rutinas');
      throw error;
    }

    try {
      await deleteDoc(doc(db, 'usuarios', clientId));
    } catch (error) {
      ToastifyError('Error eliminando el usuario');
      throw error;
    }
  };

  return (
    <>
      <Header />
      <h1 className="text-3xl font-bold text-center mb-4">Clientes</h1>
      <div className="flex items-center justify-between mb-4 w-96 mx-auto">
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
                {client.cedula !== '1' && (
                  <>
                    <td className="border px-4 py-2">{client.primerNombre}</td>
                    <td className="border px-4 py-2">{client.primerApellido}</td>
                    <td className="border px-4 py-2">{client.cedula}</td>
                    <td className="border px-4 py-2">
                      <div className="inline-flex gap-5">
                        <button
                          onClick={() => handleShowDetails(client)}
                          className="bg-yellow-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded"
                        >
                          Detalles
                        </button>

                        <button
                          onClick={() => handleEditClient(client)}
                          className="bg-yellow-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                        >
                          Editar
                        </button>
                        {user.user.rol === 'administrador' && (
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="bg-yellow-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
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
            <p><strong>Observaciones/Enfermedades:</strong><br /> {selectedClient.observaciones}</p>
            <button
              onClick={() => handleViewRoutines(selectedClient)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
            >
              Ver historial rutinas
            </button>
            <div className="mt-4 flex justify-center">
              <button onClick={() => setSelectedClient(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {viewRoutine.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Historial de Rutinas
            </h2>
            <div className="overflow-y-auto max-h-60">
              {viewRoutine.map((routine, index) => (
                <div key={routine.id} className="mb-4">
                  <p><strong>Rutina #{index + 1}</strong></p>
                  <p><strong>Fecha de Creación:</strong> {routine.fechaCreacion}</p>
                  <p><strong>Fecha de Cambio:</strong> {routine.fechaCambio}</p>
                  <ul>
                    {routine.ejercicios.map((ejercicio, ejIndex) => (
                      <li key={ejercicio.id}>
                        <p><strong>Ejercicio #{ejIndex + 1}</strong></p>
                        <p><strong>ID:</strong> {ejercicio.id}</p>
                        <p><strong>Nombre:</strong> {ejercicio.nombre}</p>
                        <p><strong>Día:</strong> {ejercicio.dia}</p>
                        <p><strong>Color:</strong> {ejercicio.color}</p>
                        <p><strong>Observaciones:</strong> {ejercicio.observaciones}</p>
                        <p><strong>Series:</strong> {ejercicio.series}</p>

                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button onClick={() => setViewRoutine([])} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cerrar Historial</button>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default ViewClients;
