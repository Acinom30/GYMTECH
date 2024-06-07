import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, orderBy, query, doc, getDoc, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const VerRutina = () => {
  const { state } = useLocation();
  const [rutina, setRutina] = useState(null);
  const { clientId } = state;

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const userRef = doc(db, 'usuarios', clientId);
        const userSnapshot = await getDoc(userRef);

        // Verificar si el documento del usuario existe
        if (userSnapshot.exists()) {
          const rutinasRef = collection(db, 'rutinas');
          const q = query(
            rutinasRef,
            where('clientId', '==', userRef),
            orderBy('fechaCreacion', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const routines = querySnapshot.docs.map(doc => doc.data());
            console.log('Routines:', routines);
            setRutina(routines[0]);
          } else {
            console.log('No routines found');
            setRutina(null);
          }
        } else {
          console.log('User not found');
          setRutina(null);
        }
      } catch (error) {
        console.error('Error fetching and filtering rutinas:', error);
        setRutina(null);
      }
    };

    fetchRutinas();
  }, [clientId]);

  const handleClose = () => {
    window.history.back();
  };

  const agruparEjerciciosPorDia = (rutina) => {
    const ejerciciosPorDia = {};
    rutina.ejercicios.forEach((ejercicio) => {
      if (!ejerciciosPorDia[ejercicio.dia]) {
        ejerciciosPorDia[ejercicio.dia] = [];
      }
      ejerciciosPorDia[ejercicio.dia].push(ejercicio);
    });
    return ejerciciosPorDia;
  };

  let ejerciciosPorDia = {};
  if (rutina && rutina.ejercicios) {
    ejerciciosPorDia = agruparEjerciciosPorDia(rutina);
  }

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-4">
      <h1 className="text-2xl font-bold mb-4">Rutina del Usuario</h1>
      {rutina ? (
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
                      <div>
                      <span style={{ backgroundColor: ejercicio.color, padding: '0.5em', borderRadius: '0.2em', display: 'inline-block', width: '50px', height: '25px' }}></span>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className='flex justify-end mt-4'>
            <button onClick={handleClose} className='text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-3'>
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
