import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [showRutinaMenu, setShowRutinaMenu] = useState(false);
    const [showMantenimientoMenu, setShowMantenimientoMenu] = useState(false);
    const [showValoracionesMenu, setShowValoracionesMenu] = useState(false);

    const toggleRutinaMenu = () => {
        setShowRutinaMenu(!showRutinaMenu);
        setShowMantenimientoMenu(false);
        setShowValoracionesMenu(false);
    };

    const toggleMantenimientoMenu = () => {
        setShowMantenimientoMenu(!showMantenimientoMenu);
        setShowRutinaMenu(false);
        setShowValoracionesMenu(false);

    };

    const toggleValoracionesMenu = () => {
        setShowValoracionesMenu(!showValoracionesMenu);
        setShowRutinaMenu(false);
        setShowMantenimientoMenu(false);
    };

    return (
        <div>
        <nav className="bg-yellow-500 p-4 shadow-lg">
            <div className="mx-auto p-0 flex justify-between items-center">
            <div>
                <h1 className="text-black text-2xl font-bold tracking-tight">GYMTECH</h1>
            </div>  
                <nav className="space-x-4">
                    <Link to="/home" className="text-black hover:text-white">Inicio</Link>
                    <div className="relative inline-block text-left">
                        <button type="button" onClick={toggleRutinaMenu} className="text-black hover:text-white focus:outline-none">
                            Rutina
                            <svg className="w-4 h-4 inline ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {showRutinaMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <div className="py-1" role="none">
                                    <Link to="/crear-rutina" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Crear Rutina</Link>
                                    <Link to="/editar-rutina" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Editar Rutina</Link>
                                    <Link to="/ver-historial-rutinas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ver Historial de Rutinas</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative inline-block text-left">
                        <button type="button" onClick={toggleMantenimientoMenu} className="text-black hover:text-white focus:outline-none">
                            Mantenimiento
                            <svg className="w-4 h-4 inline ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {showMantenimientoMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <div className="py-1" role="none">
                                    <Link to="/agregar-ejercicios" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Agregar Ejercicios</Link>
                                    <Link to="/editar-ejercicios" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Editar Ejercicios</Link>
                                    <Link to="/eliminar-ejercicios" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Eliminar Ejercicios</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative inline-block text-left">
                        <button type="button" onClick={toggleValoracionesMenu} className="text-black hover:text-white focus:outline-none">
                            Valoraciones Físicas
                            <svg className="w-4 h-4 inline ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {showValoracionesMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <div className="py-1" role="none">
                                    <Link to="/ingresar-valoracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Ingresar Valoración</Link>
                                    <Link to="/editar-valoracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Editar Valoración</Link>
                                    <Link to="/mostrar-valoracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Mostrar Valoración</Link>
                                    <Link to="/eliminar-valoracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Eliminar Valoración</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </nav> 
        <br/><br/><br/>
        </div>

    );
};

export default Header;
