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
import ViewClientList from '../general/viewClientList'

const ViewClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();
  const [viewRoutine, setViewRoutine] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const clientsCollection = collection(db, 'usuarios');
      const clientsSnapshot = await getDocs(clientsCollection);
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsData);
    } catch (error) {
      ToastifyError('Error obteniendo los clientes');
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
      message: `¿Estás seguro de que deseas eliminar el cliente ${nombre} con todas sus valoraciones y rutinas?`,
      buttons: [
        {
          label: 'Sí',
          onClick: async () => {
            try {
              await deleteClientData(client.id);
              //await fetchClients(); // Actualizar la lista de clientes después de eliminar con éxito el cliente
              ToastifySuccess('Cliente eliminado correctamente');
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
      await deleteDoc(userRef);
      fetchClients();

    } catch (error) {
      ToastifyError('Error eliminando el usuario');
      throw error;
    };

  };

    return (
      <>
        <Header />
        <h1 className="text-3xl font-bold text-center mb-4">Usuarios</h1>

        <ViewClientList
          clients={clients}
          handlePrimaryAction={handleShowDetails}
          primaryActionLabel="Detalles"
          handleSecondaryAction={handleEditClient}
          secondaryActionLabel="Editar"
          handleTertiaryAction={handleDeleteClient}
          tertiaryActionLabel='Eliminar'
          user={user}
        />
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
