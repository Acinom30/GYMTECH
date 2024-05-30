import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

const VerRutina = () => {
  const { state } = useLocation();
  const [rutina, setRutina] = useState([]);
  const { clientId } = state;

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const rutinasRef = collection(db, 'rutinas');
        const q = query(rutinasRef, orderBy('fechaCreacion', 'desc'));
        const rutinasSnapshot = await getDocs(q);
        const rutinasList = rutinasSnapshot.docs
          .filter(doc => doc.data().clientId.id === clientId)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        setRutina(rutinasList);
      } catch (error) {
        console.error('Error fetching and filtering rutinas:', error);
      }
    };

    fetchRutinas();

  }, [clientId]);

  
  const handleClose = () => {
    window.history.back();
  };

  return (
    <div>
      <h1>Rutina del Usuario</h1>
      {rutina.length > 0 ? (
        <div>
          {rutina.map((rutinaItem, index) => (
            <div key={index} className="rutina">
              <h2>{rutinaItem.nombre}</h2>
              <table className='min-w-full bg-white border border-gray-300'>
                <thead>
                  <tr className='bg-gray-200'>
                    <th className='py-2 px-4 border-b text-center'>Nombre</th>
                    <th className='py-2 px-4 border-b text-center'>Día</th>
                    <th className='py-2 px-4 border-b text-center'>Series</th>
                    <th className='py-2 px-4 border-b text-center'>Observaciones</th>
                    <th className='py-2 px-4 border-b text-center'>Color</th>
                  </tr>
                </thead>
                <tbody>
                  {rutinaItem.ejercicios.map((ejercicio, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.nombre}</td>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.dia}</td>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.series}</td>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.observaciones}</td>
                      <td className='py-2 px-4 border-b text-center'>
                        <span style={{ backgroundColor: ejercicio.color }}>{ejercicio.color}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <button onClick={handleClose} className='bg-blue-500 text-white px-2 py-1 rounded mt-4'>
            Cerrar
          </button>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default VerRutina;
