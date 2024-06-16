import React, { useRef, useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';



const ViewClientList = ({ handlePrimaryAction, primaryActionLabel, handleSecondaryAction, secondaryActionLabel, handleTertiaryAction, tertiaryActionLabel, user }) => {
  const isMounted = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    isMounted.current = true;
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
    return () => {
      isMounted.current = false;
    };
  }, [searchTerm]);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4 w-96 mx-auto">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o cédula"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:border-yellow-500"
        />
        <button
          onClick={() => setSearchTerm('')}
          className="---ml-4 py-2 px-4 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ml-5"
        >
          Limpiar
        </button>
      </div>
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
                        onClick={() => handlePrimaryAction(client)}
                        className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-gray-500 hover:text-white"
                      >
                        {primaryActionLabel}
                      </button>
                      <button
                        onClick={() => handleSecondaryAction(client)}
                        className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
                        >
                        {secondaryActionLabel}
                      </button>
                        <button
                          onClick={() => handleTertiaryAction(client)}
                          className={`text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 ${tertiaryActionLabel === 'Eliminar' &&  user.user.rol === 'administrador' 
                              ? "text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-red-700 hover:bg-red-700 hover:text-white"
                              : "text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-blue-700 hover:bg-gray-500 hover:text-white"
                            }`}
                        >
                          {tertiaryActionLabel}
                        </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewClientList;
