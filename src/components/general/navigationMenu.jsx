import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../userContext'
import { useNavigate } from 'react-router-dom';


const Header = () => {
    const [showRutinaMenu, setShowRutinaMenu] = useState(false);
    const [showMantenimientoMenu, setShowMantenimientoMenu] = useState(false);
    const [showValoracionesMenu, setShowValoracionesMenu] = useState(false);
    const [showClientesMenu, setShowClientesMenu] = useState(false);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/')
    };

    const toggleRutinaMenu = () => {
        setShowRutinaMenu(!showRutinaMenu);
        setShowMantenimientoMenu(false);
        setShowValoracionesMenu(false);
        setShowClientesMenu(false)
    };

    const toggleClienteMenu = () => {
        setShowClientesMenu(!showClientesMenu)
        setShowRutinaMenu(false);
        setShowMantenimientoMenu(false);
        setShowValoracionesMenu(false);
    };

    const toggleMantenimientoMenu = () => {
        setShowMantenimientoMenu(!showMantenimientoMenu);
        setShowRutinaMenu(false);
        setShowValoracionesMenu(false);
        setShowClientesMenu(false)

    };

    const toggleValoracionesMenu = () => {
        setShowValoracionesMenu(!showValoracionesMenu);
        setShowRutinaMenu(false);
        setShowMantenimientoMenu(false);
        setShowClientesMenu(false)
    };

    return (
        <div>
            {(user.user.rol === 'administrador' || user.user.rol === 'entrenador') && (
                <nav style={{ backgroundColor: '#fff323' }} className="p-4 shadow-lg">
                    <div className="mx-auto p-0 flex justify-between items-center">
                        <div>
                            <Link to='/home'>
                                <h1 className="text-black text-2xl font-bold tracking-tight">GYMTECH</h1>
                            </Link>
                        </div>
                        <nav className="space-x-4">

                            <Link to="/home" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Inicio</Link>

                            <div className="relative inline-block text-left">
                                <button type="button" onClick={toggleClienteMenu} className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">
                                    Usuarios
                                    <svg className="w-4 h-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {showClientesMenu && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Agregar Usuario</Link>
                                            <Link to="/viewListClients" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Lista de Usuarios</Link>

                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative inline-block text-left">
                                <button type="button" onClick={toggleValoracionesMenu} className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">
                                    Valoraciones
                                    <svg className="w-4 h-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {showValoracionesMenu && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <Link to="/selectUserEvaluation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Valoraciones</Link>
                                            <Link to="/viewLatestEvaluation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Mis valoraciones</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative inline-block text-left">
                                <button type="button" onClick={toggleRutinaMenu} className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">
                                    Rutinas
                                    <svg className="w-4 h-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {showRutinaMenu && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <Link to="/selectUserRoutine" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Rutinas</Link>
                                            <Link to="/viewLatestRoutine" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Mis rutinas</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative inline-block text-left">
                                <button type="button" onClick={toggleMantenimientoMenu} className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">
                                    Mantenimiento
                                    <svg className="w-4 h-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {showMantenimientoMenu && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <Link to="/editExercises" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Gestionar Ejercicios</Link>
                                            <Link to="/categoriesList" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Gestionar Categorias</Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Cerrar Sesión</Link>
                        </nav>
                    </div>
                </nav>
            )}

            {user.user.rol === 'cliente' && (
                <nav style={{ backgroundColor: '#fff323' }} className="p-4 shadow-lg">
                    <div className="mx-auto p-0 flex justify-between items-center">
                        <div>
                            <Link to='/homeClient'>
                                <h1 className="text-black text-2xl font-bold tracking-tight">GYMTECH</h1>
                            </Link>
                        </div>
                        <nav className="space-x-4">

                            <Link to="/homeClient" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Inicio</Link>

                            <Link to="/viewLatestEvaluation" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Ver mis valoraciones</Link>

                            <Link to="/viewLatestRoutine" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Ver mis Rutinas</Link>

                            <Link to="/changePassword" className="text-black hover:bg-gray-700 hover:text-white rounded-full px-4 py-2">Cambiar contraseña</Link>

                            <button onClick={handleLogout}>Cerrar Sesión</button>
                        </nav>
                    </div>
                </nav>
            )}
            <br />
            <br />
        </div>


    );
};

export default Header;
