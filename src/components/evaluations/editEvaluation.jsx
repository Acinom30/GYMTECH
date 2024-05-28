import React, { useState, useEffect } from 'react';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import { useLocation } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const EditEvaluation = () => {
    const location = useLocation();
    const { valoracionId, clientId } = location.state || {};
    const [cliente, setCliente] = useState()
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        objetivo: '',
        diasSemana: '',
        peso: '',
        fechaValoracion: new Date().toISOString().split('T')[0],
        lesionesActuales: '',
        tipoPersona: '',

        grasaCorporal: '',
        grasaBrazoIzq: '',
        grasaBrazoDer: '',
        grasaPiernaDer: '',
        grasaPiernaIzq: '',
        grasaTorso: '',

        musculoCorporal: '',
        musculoBrazoIzq: '',
        musculoBrazoDer: '',
        musculoPiernaIzq: '',
        musculoPiernaDer: '',
        musculoTorso: '',

        porcentajeAgua: '',
        valoracionFisica: '',
        DCI_BMR: '',
        edadMetabolica: '',
        masaOsea: '',
        grasaVisceral: '',

        circunfPecho: '',
        circunfEspalda: '',
        circunfAntebrazoIzq: '',
        circunfAntebrazoDer: '',
        circunfBrazoIzq: '',
        circunfBrazoDer: '',
        circunfPiernaIzq: '',
        circunfPiernaDer: '',
        circunfPantorrillaIzq: '',
        circunfPantorrillaDer: '',
        circunfCintura: '',
        circunfCadera: '',

        plieguesTriceps: '',
        plieguesSubescapular: '',
        plieguesAbdomen: '',
        plieguesIliaco: '',
        plieguesMuslo: '',
    });

    useEffect(() => {
        const fetchEvaluation = async () => {
            try {
                const clientDoc = doc(db, 'usuarios', clientId);
                const docRef = doc(db, "valoraciones", valoracionId);

                const [clientSnap, docSnap] = await Promise.all([getDoc(clientDoc), getDoc(docRef)]);

                if (clientSnap.exists() && docSnap.exists()) {
                    setFormData(docSnap.data());
                    setCliente(clientSnap.data());
                } else {
                    ToastifyError("No se encontraron datos de cliente o de valoración.");
                }
            } catch (error) {
                ToastifyError("Ocurrió un error al cargar la valoración. Por favor, inténtelo de nuevo.");
            }
        };

        fetchEvaluation();
    }, [clientId, valoracionId]);


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
            !formData.objetivo ||
            !formData.diasSemana ||
            !formData.peso ||
            !formData.lesionesActuales ||
            !formData.tipoPersona ||
            !formData.grasaCorporal ||
            !formData.grasaBrazoIzq ||
            !formData.grasaBrazoDer ||
            !formData.grasaPiernaIzq ||
            !formData.grasaPiernaDer ||
            !formData.grasaTorso ||
            !formData.musculoCorporal ||
            !formData.musculoBrazoIzq ||
            !formData.musculoBrazoDer ||
            !formData.musculoPiernaIzq ||
            !formData.musculoPiernaDer ||
            !formData.musculoTorso ||
            !formData.porcentajeAgua ||
            !formData.valoracionFisica ||
            !formData.DCI_BMR ||
            !formData.edadMetabolica ||
            !formData.masaOsea ||
            !formData.grasaVisceral ||
            !formData.circunfPecho ||
            !formData.circunfEspalda ||
            !formData.circunfAntebrazoIzq ||
            !formData.circunfAntebrazoDer ||
            !formData.circunfBrazoIzq ||
            !formData.circunfBrazoDer ||
            !formData.circunfPiernaIzq ||
            !formData.circunfPiernaDer ||
            !formData.circunfPantorrillaIzq ||
            !formData.circunfPantorrillaDer ||
            !formData.circunfCintura ||
            !formData.circunfCadera
        ) {
            ToastifyError("Por favor, complete todos los campos obligatorios");
            return;
        }

        const usuarioRef = doc(db, "usuarios", clientId);

        const dataWithUserRef = {
            ...formData,
            usuario: usuarioRef,
            fechaValoracion: new Date().toISOString().split('T')[0],

        };

        try {
            const docRef = doc(db, "valoraciones", valoracionId);
            await updateDoc(docRef, dataWithUserRef);

            ToastifySuccess("Se ha actualizado la valoración correctamente");
            navigate('/selectUserEvaluation')
        } catch (error) {
            ToastifyError("Ocurrió un error al actualizar la valoración. Por favor, inténtelo de nuevo.");
        }
    };
    return (
        <div>
            <Header />
            <h1 className="text-2xl font-bold mb-2 ml-5">Usuario:</h1>

            <div className="bg-gray-100 p-4 rounded-md shadow-md">
                {cliente ? (
                    <p className="text-lg ml-5">
                        {cliente.primerNombre} {cliente.segundoNombre} {cliente.primerApellido} {cliente.segundoApellido}, Cédula: {cliente.cedula}
                    </p>
                ) : (
                    <p>Cargando datos del cliente...</p>
                )}
            </div>
            <div className="flex flex-col items-center justify-center">

                <div className="md:w-2/3 px-4 py-8">
                    <h1 className="text-3xl font-bold mb-4">Editar Valoración</h1>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* ----------------Columna izquierda------------------ */}
                            <div className="flex flex-col space-y-4">
                                <label className="block font-semibold">Objetivo</label>
                                <input
                                    type="text"
                                    id="objetivo"
                                    name="objetivo"
                                    value={formData.objetivo}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Días a la semana</label>
                                <input
                                    type="text"
                                    id="diasSemana"
                                    name="diasSemana"
                                    value={formData.diasSemana}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Peso</label>
                                <input
                                    type="text"
                                    id="peso"
                                    name="peso"
                                    value={formData.peso}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Lesiones Actuales</label>
                                <input
                                    type="text"
                                    id="lesionesActuales"
                                    name="lesionesActuales"
                                    value={formData.lesionesActuales}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Tipo de persona</label>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoPersona"
                                            value="mujerAtleta"
                                            checked={formData.tipoPersona === 'mujerAtleta'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Mujer Atleta
                                    </label><br />
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoPersona"
                                            value="hombreAtleta"
                                            checked={formData.tipoPersona === 'hombreAtleta'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Hombre Atleta
                                    </label><br />
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoPersona"
                                            value="mujerNormal"
                                            checked={formData.tipoPersona === 'mujerNormal'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Mujer Normal
                                    </label><br />
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoPersona"
                                            value="hombreNormal"
                                            checked={formData.tipoPersona === 'hombreNormal'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        Hombre Normal
                                    </label><br />
                                </div>
                                <label className="block font-semibold">Grasa Corporal</label>
                                <input
                                    type="text"
                                    id="grasaCorporal"
                                    name="grasaCorporal"
                                    value={formData.grasaCorporal}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Brazo Izquierdo</label>
                                <input
                                    type="text"
                                    id="grasaBrazoIzq"
                                    name="grasaBrazoIzq"
                                    value={formData.grasaBrazoIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Brazo Derecho</label>
                                <input
                                    type="text"
                                    id="grasaBrazoDer"
                                    name="grasaBrazoDer"
                                    value={formData.grasaBrazoDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Pierna Izquierda</label>
                                <input
                                    type="text"
                                    id="grasaPiernaIzq"
                                    name="grasaPiernaIzq"
                                    value={formData.grasaPiernaIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Pierna Derecha</label>
                                <input
                                    type="text"
                                    id="grasaPiernaDer"
                                    name="grasaPiernaDer"
                                    value={formData.grasaPiernaDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Torso</label>
                                <input
                                    type="text"
                                    id="grasaTorso"
                                    name="grasaTorso"
                                    value={formData.grasaTorso}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Músculo Corporal</label>
                                <input
                                    type="text"
                                    id="musculoCorporal"
                                    name="musculoCorporal"
                                    value={formData.musculoCorporal}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                            </div>


                            {/* ----------------Columna cenrtal------------------ */}

                            <div className="flex flex-col space-y-4">
                                <label className="block font-semibold">Músculo Brazo Izquierdo</label>
                                <input
                                    type="text"
                                    id="musculoBrazoIzq"
                                    name="musculoBrazoIzq"
                                    value={formData.musculoBrazoIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Músculo Brazo Derecho</label>
                                <input
                                    type="text"
                                    id="musculoBrazoDer"
                                    name="musculoBrazoDer"
                                    value={formData.musculoBrazoDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Músculo Pierna Izquierda</label>
                                <input
                                    type="text"
                                    id="musculoPiernaIzq"
                                    name="musculoPiernaIzq"
                                    value={formData.musculoPiernaIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Músculo Pierna Derecha</label>
                                <input
                                    type="text"
                                    id="musculoPiernaDer"
                                    name="musculoPiernaDer"
                                    value={formData.musculoPiernaDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Músculo Torso</label>
                                <input
                                    type="text"
                                    id="musculoTorso"
                                    name="musculoTorso"
                                    value={formData.musculoTorso}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Porcentaje de Agua</label>
                                <input
                                    type="text"
                                    id="porcentajeAgua"
                                    name="porcentajeAgua"
                                    value={formData.porcentajeAgua}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Valoración Física</label>
                                <input
                                    type="text"
                                    id="valoracionFisica"
                                    name="valoracionFisica"
                                    value={formData.valoracionFisica}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">DCI/BMR</label>
                                <input
                                    type="text"
                                    id="DCI_BMR"
                                    name="DCI_BMR"
                                    value={formData.DCI_BMR}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Edad Metabólica</label>
                                <input
                                    type="text"
                                    id="edadMetabolica"
                                    name="edadMetabolica"
                                    value={formData.edadMetabolica}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Masa Ósea</label>
                                <input
                                    type="text"
                                    id="masaOsea"
                                    name="masaOsea"
                                    value={formData.masaOsea}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Grasa Visceral</label>
                                <input
                                    type="text"
                                    id="grasaVisceral"
                                    name="grasaVisceral"
                                    value={formData.grasaVisceral}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Pecho</label>
                                <input
                                    type="text"
                                    id="circunfPecho"
                                    name="circunfPecho"
                                    value={formData.circunfPecho}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Espalda</label>
                                <input
                                    type="text"
                                    id="circunfEspalda"
                                    name="circunfEspalda"
                                    value={formData.circunfEspalda}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Antebrazo Izq</label>
                                <input
                                    type="text"
                                    id="circunfAntebrazoIzq"
                                    name="circunfAntebrazoIzq"
                                    value={formData.circunfAntebrazoIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                            </div>

                            {/* ----------------Columna derecha------------------ */}

                            <div className="flex flex-col space-y-4">
                                <label className="block font-semibold">Circunferencia de Antebrazo Der</label>
                                <input
                                    type="text"
                                    id="circunfAntebrazoDer"
                                    name="circunfAntebrazoDer"
                                    value={formData.circunfAntebrazoDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Brazo Izq</label>
                                <input
                                    type="text"
                                    id="circunfBrazoIzq"
                                    name="circunfBrazoIzq"
                                    value={formData.circunfBrazoIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Brazo Der</label>
                                <input
                                    type="text"
                                    id="circunfBrazoDer"
                                    name="circunfBrazoDer"
                                    value={formData.circunfBrazoDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Pierna Izq</label>
                                <input
                                    type="text"
                                    id="circunfPiernaIzq"
                                    name="circunfPiernaIzq"
                                    value={formData.circunfPiernaIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Pierna Der</label>
                                <input
                                    type="text"
                                    id="circunfPiernaDer"
                                    name="circunfPiernaDer"
                                    value={formData.circunfPiernaDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Pantorrila Izq</label>
                                <input
                                    type="text"
                                    id="circunfPantorrillaIzq"
                                    name="circunfPantorrillaIzq"
                                    value={formData.circunfPantorrillaIzq}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Pantorrila Der</label>
                                <input
                                    type="text"
                                    id="circunfPantorrillaDer"
                                    name="circunfPantorrillaDer"
                                    value={formData.circunfPantorrillaDer}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Cintura</label>
                                <input
                                    type="text"
                                    id="circunfCintura"
                                    name="circunfCintura"
                                    value={formData.circunfCintura}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Circunferencia de Cadera</label>
                                <input
                                    type="text"
                                    id="circunfCadera"
                                    name="circunfCadera"
                                    value={formData.circunfCadera}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Pliegues Triceps</label>
                                <input
                                    type="text"
                                    id="plieguesTriceps"
                                    name="plieguesTriceps"
                                    value={formData.plieguesTriceps}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Pliegues Subescapular</label>
                                <input
                                    type="text"
                                    id="plieguesSubescapular"
                                    name="plieguesSubescapular"
                                    value={formData.plieguesSubescapular}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Pliegues Abdomen</label>
                                <input
                                    type="text"
                                    id="plieguesAbdomen"
                                    name="plieguesAbdomen"
                                    value={formData.plieguesAbdomen}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Pliegues Iliaco</label>
                                <input
                                    type="text"
                                    id="plieguesIliaco"
                                    name="plieguesIliaco"
                                    value={formData.plieguesIliaco}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                                <label className="block font-semibold">Pliegues Muslo</label>
                                <input
                                    type="text"
                                    id="plieguesMuslo"
                                    name="plieguesMuslo"
                                    value={formData.plieguesMuslo}
                                    onChange={handleChange}
                                    className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-end">
                            <Link to="/selectUserEvaluation" className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </Link>
                            <button onClick={handleSubmit} type="button" className="bg-yellow-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>


    );
};


export default EditEvaluation;