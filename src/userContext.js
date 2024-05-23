import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto de usuario
const UserContext = createContext();

// Hook para usar el contexto de usuario
export const useUser = () => useContext(UserContext);

// Proveedor del contexto de usuario
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Obtener el usuario del almacenamiento local al cargar la página
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const logout = () => {
        setUser(null); // Eliminar el usuario al cerrar sesión
    };

    useEffect(() => {
        // Guardar el usuario en el almacenamiento local cada vez que cambia
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};
