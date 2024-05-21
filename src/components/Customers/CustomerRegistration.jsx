// CustomerRegistration.jsx
import React, { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Cambiado a useNavigate
import { db } from '../../firebase/config';

const CustomerRegistration = () => {
    const [cedula, setCedula] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate(); // Cambiado a useNavigate

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        const cedulaFormat = /^[1-9]\d{0,2}\d{3}\d{4}$/;
        if (!cedulaFormat.test(cedula)) {
            setError('Formato de cédula incorrecto.');
            return;
        }

        try {
            const userDoc = doc(db, 'usuarios', cedula);
            const userSnapshot = await getDoc(userDoc);

            if (!userSnapshot.exists()) {
                setError('Usuario no encontrado.');
                return;
            }

            const userData = userSnapshot.data();
            if (userData.tempPassword !== tempPassword) {
                setError('Contraseña temporal incorrecta.');
                return;
            }

            if (newPassword !== confirmPassword) {
                setError('Las contraseñas nuevas no coinciden.');
                return;
            }

            await updateDoc(userDoc, {
                password: newPassword,
                tempPassword: ''
            });

            setSuccess('Contraseña actualizada exitosamente.');
        } catch (error) {
            setError('Error al registrar cliente.');
        }
    };

    const handleBack = () => {
        navigate(-1); // Cambiado a navigate con -1 para ir a la página anterior
    };

    return (
        <div className="container mx-auto p-4" style={{ backgroundColor: 'yellow' }}>
            <h1 className="text-3xl font-bold text-center mb-4">Registrar Cliente</h1>
            <div className="flex flex-col items-center">
                <input
                    type="text"
                    placeholder="Cédula (X0XXX0XXX)"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md mb-4 w-1/2"
                />
                <input
                    type="password"
                    placeholder="Contraseña Temporal"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md mb-4 w-1/2"
                />
                <input
                    type="password"
                    placeholder="Nueva Contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md mb-4 w-1/2"
                />
                <input
                    type="password"
                    placeholder="Confirmar Nueva Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md mb-4 w-1/2"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <button
                    onClick={handleRegister}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                >
                    Registrar
                </button>
                <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Regresar
                </button>
            </div>
        </div>
    );
};

export default CustomerRegistration;
