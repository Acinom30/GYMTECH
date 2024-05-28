import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../firebase/config';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import bcrypt from 'bcryptjs';
import Header from '../general/navigationMenu';
import { useNavigate } from 'react-router-dom';


const UserUpdate = () => {
    const location = useLocation();
    const clientToUpdate = location.state?.client || {};
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        cedula: clientToUpdate.cedula || '',
        primerNombre: clientToUpdate.primerNombre || '',
        segundoNombre: clientToUpdate.segundoNombre || '',
        primerApellido: clientToUpdate.primerApellido || '',
        segundoApellido: clientToUpdate.segundoApellido || '',
        fechaNacimiento: clientToUpdate.fechaNacimiento || '',
        telefono: clientToUpdate.telefono || '',
        email: clientToUpdate.email || '',
        rol: clientToUpdate.rol || '',
        observaciones: clientToUpdate.observaciones || '',
        estado: clientToUpdate.estado || 'ACTIVO',
        resetPassword: 'no',
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
        if (
            !formData.cedula ||
            !formData.primerNombre ||
            !formData.primerApellido ||
            !formData.fechaNacimiento ||
            !formData.telefono ||
            !formData.email ||
            !formData.rol ||
            !formData.observaciones
        ) {
            ToastifyError("Por favor, complete todos los campos obligatorios");
            return;
        } else {
            const cedulaFormat = /^(?:\d{9}|\d{11,12}|[A-Za-z0-9]{5,20})$/;
            if (!cedulaFormat.test(formData.cedula)) {
                ToastifyError('Formato de cédula incorrecto.');
                return;
            }
        }

        if (formData.resetPassword === 'si') {
            const hashedPassword = bcrypt.hashSync('12345678', 10);
            try {
                const userRef = doc(db, "usuarios", clientToUpdate.id);
                await setDoc(userRef, { ...formData, contrasena: hashedPassword }, { merge: true });
                ToastifySuccess("Se ha actualizado el cliente correctamente");
                navigate('/home')
            } catch (error) {
                ToastifyError("Error al actualizar el cliente");
            }
        }
        setFormData({
            cedula: '',
            primerNombre: '',
            segundoNombre: '',
            primerApellido: '',
            segundoApellido: '',
            fechaNacimiento: '',
            telefono: '',
            email: '',
            rol: '',
            observaciones: '',
            resetPassword: ''
        });
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="md:w-2/3 px-4 py-8">
                    <h1 className="text-3xl font-bold mb-4">Actualizar Cliente</h1>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-4">
                                <label htmlFor="cedula" className="block font-semibold">Cédula</label>
                                <input
                                    type="text"
                                    id="cedula"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="primerNombre" className="block font-semibold">Primer Nombre</label>
                                <input
                                    type="text"
                                    id="primerNombre"
                                    name="primerNombre"
                                    value={formData.primerNombre}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="segundoNombre" className="block font-semibold">Segundo Nombre</label>
                                <input
                                    type="text"
                                    id="segundoNombre"
                                    name="segundoNombre"
                                    value={formData.segundoNombre}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="primerApellido" className="block font-semibold">Primer Apellido</label>
                                <input
                                    type="text"
                                    id="primerApellido"
                                    name="primerApellido"
                                    value={formData.primerApellido}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="segundoApellido" className="block font-semibold">Segundo Apellido</label>
                                <input
                                    type="text"
                                    id="segundoApellido"
                                    name="segundoApellido"
                                    value={formData.segundoApellido}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="fechaNacimiento" className="block font-semibold">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    id="fechaNacimiento"
                                    name="fechaNacimiento"
                                    value={formData.fechaNacimiento}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                            </div>
                            <div className="flex flex-col space-y-4">
                                <label htmlFor="telefono" className="block font-semibold">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label htmlFor="email" className="block font-semibold">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Restablecer contraseña por defecto</label>
                                <select
                                    name="resetPassword"
                                    value={formData.resetPassword}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                >
                                    <option value="no">No</option>
                                    <option value="si">Sí</option>
                                </select>
                                <label className="block font-semibold">Rol</label>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="rol"
                                            value="cliente"
                                            checked={formData.rol === 'cliente'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Cliente
                                    </label>
                                    <label className="ml-4">
                                        <input
                                            type="radio"
                                            name="rol"
                                            value="administrador"
                                            checked={formData.rol === 'administrador'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Administrador
                                    </label>
                                    <label className="ml-4">
                                        <input
                                            type="radio"
                                            name="rol"
                                            value="entrenador"
                                            checked={formData.rol === 'entrenador'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Entrenador
                                    </label>
                                </div>
                                <label htmlFor="observaciones" className="block font-semibold">Observaciones/Enfermedades</label>
                                <textarea
                                    id="observaciones"
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    className="w-full bg-gray-200 rounded-md px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <Link to="/viewListClients" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </Link>
                            <button type="submit" className="bg-yellow-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserUpdate;
