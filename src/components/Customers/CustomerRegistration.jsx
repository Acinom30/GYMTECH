import React, { useState } from 'react';
import { updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { db } from '../../firebase/config';
import gymLogo from '../../image/logo.jpg';
import ToastifyError from '../ui/toastify/toastifyError';
import ToastifySuccess from '../ui/toastify/toastifySuccess';

const CustomerRegistration = () => {
    const [cedula, setCedula] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleRegister = async () => {

        const cedulaFormat = /^[1-9]\d{0,2}\d{3}\d{4}$/;
        if (!cedulaFormat.test(cedula) && cedula != '1') {
            ToastifyError('Formato de cédula incorrecto.');
            return;
        }

        try {
            const q = query(collection(db, 'usuarios'), where("cedula", "==", cedula));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                ToastifyError('Usuario no encontrado.');
                return;
            }

            const userDocSnapshot = querySnapshot.docs[0];
            const userDocRef = userDocSnapshot.ref;
            const userData = userDocSnapshot.data();

            const isMatch = await bcrypt.compare(tempPassword, userData.contrasena);
            if (!isMatch) {
                ToastifyError('Contraseña temporal incorrecta.');
                return;
            }

            if (newPassword === '' || confirmPassword === '') {
                ToastifyError('Debe ingresar una contraseña nueva');
                return;
            } else {
                if (newPassword !== confirmPassword) {
                    ToastifyError('Las contraseñas nuevas no coinciden.');
                    return;
                } else {
                    if (newPassword.length < 8) {
                        ToastifyError('La contraseña debe tener mínimo 8 caracterres.');
                        return;
                    }
                }
            };
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await updateDoc(userDocRef, {
                contrasena: hashedNewPassword,
            });

            const ccc = await bcrypt.compare(tempPassword, userData.contrasena);

            ToastifySuccess('Contraseña actualizada exitosamente.');
            navigate(-1);

        } catch (error) {
            ToastifyError('Error al registrar cliente.');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative mt-10">
            <h1 className="text-3xl font-bold text-center mb-4">Registrar Cliente</h1>
            <img src={gymLogo} alt="GYMTECH Logo" className="w-24 h-24 mb-16 sm:w-32 sm:h-32 mb-10" />
            <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Cédula</h3>
                <input
                    type="text"
                    placeholder="Cédula (X0XXX0XXX)"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                />
                <h3 className="text-lg font-semibold mb-2">Contraseña temporal</h3>
                <input
                    type="password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                />
                <h3 className="text-lg font-semibold mb-2">Nueva contraseña</h3>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                />
                <h3 className="text-lg font-semibold mb-2">Confirmar contraseña</h3>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full sm:w-96 bg-gray-200 rounded-md px-4 py-3 mb-8 text-center"
                />
                <div>
                    <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded  mr-5">
                        Regresar
                    </button>
                    <button
                        onClick={handleRegister}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
                    >
                        Registrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegistration;
