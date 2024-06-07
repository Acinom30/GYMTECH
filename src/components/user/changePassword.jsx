import React, { useState } from 'react';
import { doc, updateDoc, getDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import bcrypt from 'bcryptjs';
import Header from '../general/navigationMenu';
import { useUser } from '../../userContext'
import { useNavigate } from 'react-router-dom';


const ChangePassword = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            ToastifyError("Por favor, complete todos los campos");
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            ToastifyError("Las nuevas contraseñas no coinciden");
            return;
        }

        if (formData.newPassword.length < 8) {
            ToastifyError('La contraseña debe tener mínimo 8 caracterres.');
            return;
        }
        const usersCollection = collection(db, "usuarios");
        const querySnapshot = await getDocs(query(usersCollection, where("cedula", "==", user.user.cedula)));
        const userDoc = querySnapshot.docs[0];

        if (userDoc) {
            const userRef = doc(db, "usuarios", userDoc.id);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const isPasswordCorrect = bcrypt.compareSync(formData.currentPassword, userData.contrasena);

                if (isPasswordCorrect) {
                    const hashedNewPassword = bcrypt.hashSync(formData.newPassword, 10);
                    try {
                        await updateDoc(userRef, { contrasena: hashedNewPassword });
                        ToastifySuccess("Contraseña actualizada correctamente");
                        navigate('/homeClient')
                        setFormData({
                            currentPassword: '',
                            newPassword: '',
                            confirmNewPassword: ''
                        });
                    } catch (error) {
                        ToastifyError("Error al actualizar la contraseña");
                    }
                } else {
                    ToastifyError("La contraseña actual es incorrecta");
                }
            } else {
                ToastifyError("No se encontró el usuario");
            }
        } else {
            ToastifyError("No se encontró el usuario");
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center py-4">
                <div className="md:w-1/3 px-4 py-8">
                    <h1 className="text-3xl font-bold mb-4">Cambiar Contraseña</h1>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label htmlFor="currentPassword" className="block font-semibold">Contraseña Actual</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-200 rounded-md px-4 py-2"
                        />
                        <label htmlFor="newPassword" className="block font-semibold">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-200 rounded-md px-4 py-2"
                        />
                        <label htmlFor="confirmNewPassword" className="block font-semibold">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-200 rounded-md px-4 py-2"
                        />
                        <button type="submit" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-500 hover:text-white">
                            Cambiar Contraseña
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default ChangePassword;