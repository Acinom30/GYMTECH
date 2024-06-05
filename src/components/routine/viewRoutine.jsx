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

  const agruparEjerciciosPorDia = (rutina) => {
    const ejerciciosPorDia = {};
    rutina.forEach((rutinaItem) => {
      rutinaItem.ejercicios.forEach((ejercicio) => {
        if (!ejerciciosPorDia[ejercicio.dia]) {
          ejerciciosPorDia[ejercicio.dia] = [];
        }
        ejerciciosPorDia[ejercicio.dia].push(ejercicio);
      });
    });
    return ejerciciosPorDia;
  };

  const ejerciciosPorDia = agruparEjerciciosPorDia(rutina);

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-4">
      <h1 className="text-2xl font-bold mb-4">Rutina del Usuario</h1>
      {rutina.length > 0 ? (
        <div>
          {Object.entries(ejerciciosPorDia).map(([dia, ejercicios], index) => (
            <div key={index} className="dia-rutina mb-6">
              <h2 className="text-lg font-bold mb-2">Día {dia}</h2>
              <table className='min-w-full bg-white border border-gray-300'>
                <thead>
                  <tr className='bg-gray-200'>
                    <th className='py-2 px-4 border-b text-center'>Nombre</th>
                    <th className='py-2 px-4 border-b text-center'>Series</th>
                    <th className='py-2 px-4 border-b text-center'>Observaciones</th>
                    <th className='py-2 px-4 border-b text-center'>Color</th>
                  </tr>
                </thead>
                <tbody>
                  {ejercicios.map((ejercicio, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.nombre}</td>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.series}</td>
                      <td className='py-2 px-4 border-b text-center'>{ejercicio.observaciones}</td>
                      <td className='py-2 px-4 border-b text-center'>
                        <span style={{ backgroundColor: ejercicio.color, padding: '0.2em', borderRadius: '0.2em' }}>{ejercicio.color}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className='flex justify-end mt-4'>
            <button onClick={handleClose} className='bg-blue-500 text-white px-4 py-2 rounded'>
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default VerRutina;
