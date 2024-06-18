import React, { useState } from 'react';
import ToastifySuccess from '../ui/toastify/toastifySuccess';
import ToastifyError from '../ui/toastify/toastifyError';
import { useLocation } from 'react-router-dom';
import Header from '../general/navigationMenu';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { addDoc, collection, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../js/general';


const AssignEvaluation = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const client = location.state?.client;
  const [formData, setFormData] = useState({
    objetivo: '',
    diasSemana: '',
    peso: '',
    fechaValoracion: formatDate(new Date()),
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

  const handleChangeNumber = (event) => {
    const { name, value } = event.target;
    if (value >= 0) {
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      ToastifyError('El valor debe ser positivo');
    }
  };

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
      !formData.grasaTorso
    ) {
      ToastifyError("Por favor complete los campos obligatorios");
      return;
    }

    const usuarioRef = doc(db, "usuarios", client.id);

    const dataWithUserRef = {
      ...formData,
      usuario: usuarioRef
    };

    try {
      const registerEvaluation = collection(db, "valoraciones");
      await addDoc(registerEvaluation, dataWithUserRef);
      ToastifySuccess("Se ha registrado la valoración correctamente");
      navigate('/selectUserEvaluation');

      setFormData({
        objetivo: '',
        diasSemana: '',
        peso: '',
        fechaValoracion: formatDate(new Date),
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
    } catch (error) {
      ToastifyError("Ocurrió un error al guardar la valoración. Por favor, inténtelo de nuevo.");

    }
  };
  return (
    <div>
      <Header />
      <h1 className="text-2xl font-bold mb-2 ml-5">Usuario:</h1>
      <div className="bg-gray-100 p-4 rounded-md shadow-md">
        <p className="text-lg ml-5">
          {client.primerNombre} {client.segundoNombre} {client.primerApellido} {client.segundoApellido}, Cédula: {client.cedula}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="md:w-2/3 px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Registrar Valoración</h1>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* ----------------Columna izquierda------------------ */}
              <div className="flex flex-col space-y-4">
                <label className="block font-semibold">Objetivo *</label>
                <textarea
                  type="text"
                  id="objetivo"
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleChange}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Días a la semana *</label>
                <input
                  type="number"
                  id="diasSemana"
                  name="diasSemana"
                  value={formData.diasSemana}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Peso *</label>
                <input
                  type="number"
                  id="peso"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Lesiones Actuales *</label>
                <input
                  type="text"
                  id="lesionesActuales"
                  name="lesionesActuales"
                  value={formData.lesionesActuales}
                  onChange={handleChange}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Tipo de persona *</label>
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
                <label className="block font-semibold">Grasa Corporal *</label>
                <input
                  type="number"
                  id="grasaCorporal"
                  name="grasaCorporal"
                  value={formData.grasaCorporal}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Brazo Izquierdo *</label>
                <input
                  type="number"
                  id="grasaBrazoIzq"
                  name="grasaBrazoIzq"
                  value={formData.grasaBrazoIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Brazo Derecho *</label>
                <input
                  type="number"
                  id="grasaBrazoDer"
                  name="grasaBrazoDer"
                  value={formData.grasaBrazoDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Pierna Izquierda *</label>
                <input
                  type="number"
                  id="grasaPiernaIzq"
                  name="grasaPiernaIzq"
                  value={formData.grasaPiernaIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Pierna Derecha *</label>
                <input
                  type="number"
                  id="grasaPiernaDer"
                  name="grasaPiernaDer"
                  value={formData.grasaPiernaDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Torso *</label>
                <input
                  type="number"
                  id="grasaTorso"
                  name="grasaTorso"
                  value={formData.grasaTorso}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Músculo Corporal</label>
                <input
                  type="number"
                  id="musculoCorporal"
                  name="musculoCorporal"
                  value={formData.musculoCorporal}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
              </div>


              {/* ----------------Columna cenrtal------------------ */}

              <div className="flex flex-col space-y-4">
                <label className="block font-semibold">Músculo Brazo Izquierdo</label>
                <input
                  type="number"
                  id="musculoBrazoIzq"
                  name="musculoBrazoIzq"
                  value={formData.musculoBrazoIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Músculo Brazo Derecho</label>
                <input
                  type="number"
                  id="musculoBrazoDer"
                  name="musculoBrazoDer"
                  value={formData.musculoBrazoDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Músculo Pierna Izquierda</label>
                <input
                  type="number"
                  id="musculoPiernaIzq"
                  name="musculoPiernaIzq"
                  value={formData.musculoPiernaIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Músculo Pierna Derecha</label>
                <input
                  type="number"
                  id="musculoPiernaDer"
                  name="musculoPiernaDer"
                  value={formData.musculoPiernaDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Músculo Torso</label>
                <input
                  type="number"
                  id="musculoTorso"
                  name="musculoTorso"
                  value={formData.musculoTorso}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Porcentaje de Agua</label>
                <input
                  type="number"
                  id="porcentajeAgua"
                  name="porcentajeAgua"
                  value={formData.porcentajeAgua}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Valoración Física</label>
                <input
                  type="number"
                  id="valoracionFisica"
                  name="valoracionFisica"
                  value={formData.valoracionFisica}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">DCI/BMR</label>
                <input
                  type="number"
                  id="DCI_BMR"
                  name="DCI_BMR"
                  value={formData.DCI_BMR}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Edad Metabólica</label>
                <input
                  type="number"
                  id="edadMetabolica"
                  name="edadMetabolica"
                  value={formData.edadMetabolica}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Masa Ósea</label>
                <input
                  type="number"
                  id="masaOsea"
                  name="masaOsea"
                  value={formData.masaOsea}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Grasa Visceral</label>
                <input
                  type="text"
                  id="grasaVisceral"
                  name="grasaVisceral"
                  value={formData.grasaVisceral}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Pecho</label>
                <input
                  type="number"
                  id="circunfPecho"
                  name="circunfPecho"
                  value={formData.circunfPecho}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Espalda</label>
                <input
                  type="number"
                  id="circunfEspalda"
                  name="circunfEspalda"
                  value={formData.circunfEspalda}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Antebrazo Izq</label>
                <input
                  type="number"
                  id="circunfAntebrazoIzq"
                  name="circunfAntebrazoIzq"
                  value={formData.circunfAntebrazoIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
              </div>

              {/* ----------------Columna derecha------------------ */}

              <div className="flex flex-col space-y-4">
                <label className="block font-semibold">Circunferencia de Antebrazo Der</label>
                <input
                  type="number"
                  id="circunfAntebrazoDer"
                  name="circunfAntebrazoDer"
                  value={formData.circunfAntebrazoDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Brazo Izq</label>
                <input
                  type="number"
                  id="circunfBrazoIzq"
                  name="circunfBrazoIzq"
                  value={formData.circunfBrazoIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Brazo Der</label>
                <input
                  type="number"
                  id="circunfBrazoDer"
                  name="circunfBrazoDer"
                  value={formData.circunfBrazoDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Pierna Izq</label>
                <input
                  type="number"
                  id="circunfPiernaIzq"
                  name="circunfPiernaIzq"
                  value={formData.circunfPiernaIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Pierna Der</label>
                <input
                  type="number"
                  id="circunfPiernaDer"
                  name="circunfPiernaDer"
                  value={formData.circunfPiernaDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Pantorrila Izq</label>
                <input
                  type="number"
                  id="circunfPantorrillaIzq"
                  name="circunfPantorrillaIzq"
                  value={formData.circunfPantorrillaIzq}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Pantorrila Der</label>
                <input
                  type="number"
                  id="circunfPantorrillaDer"
                  name="circunfPantorrillaDer"
                  value={formData.circunfPantorrillaDer}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Cintura</label>
                <input
                  type="number"
                  id="circunfCintura"
                  name="circunfCintura"
                  value={formData.circunfCintura}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Circunferencia de Cadera</label>
                <input
                  type="number"
                  id="circunfCadera"
                  name="circunfCadera"
                  value={formData.circunfCadera}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Pliegues Triceps</label>
                <input
                  type="number"
                  id="plieguesTriceps"
                  name="plieguesTriceps"
                  value={formData.plieguesTriceps}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Pliegues Subescapular</label>
                <input
                  type="number"
                  id="plieguesSubescapular"
                  name="plieguesSubescapular"
                  value={formData.plieguesSubescapular}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Pliegues Abdomen</label>
                <input
                  type="number"
                  id="plieguesAbdomen"
                  name="plieguesAbdomen"
                  value={formData.plieguesAbdomen}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Pliegues Iliaco</label>
                <input
                  type="number"
                  id="plieguesIliaco"
                  name="plieguesIliaco"
                  value={formData.plieguesIliaco}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
                <label className="block font-semibold">Pliegues Muslo</label>
                <input
                  type="number"
                  id="plieguesMuslo"
                  name="plieguesMuslo"
                  value={formData.plieguesMuslo}
                  onChange={handleChangeNumber}
                  className="w-full max-w-md bg-gray-200 rounded-md px-4 py-2"
                />
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link to="/selectUserEvaluation" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-gray-700 hover:bg-gray-500 hover:text-white mr-3">
                Cancelar
              </Link>
              <button onClick={handleSubmit} type="button" className="text-black font-bold py-2 px-4 rounded-full focus:outline-none shadow-md transition-transform duration-300 transform hover:scale-105 border border-green-700 hover:bg-green-500 hover:text-white">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>


  );
};

export default AssignEvaluation;


