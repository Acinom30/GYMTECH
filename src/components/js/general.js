import ToastifyError from "../ui/toastify/toastifyError";

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calcularFechaCambio = (opcion) => {
    let fechaCambio = new Date();
    switch (opcion) {
        case '1 mes':
            fechaCambio.setMonth(fechaCambio.getMonth() + 1);
            break;
        case '1 mes y medio':
            fechaCambio.setMonth(fechaCambio.getMonth() + 1);
            fechaCambio.setDate(fechaCambio.getDate() + 15);
            break;
        case '2 meses':
            fechaCambio.setMonth(fechaCambio.getMonth() + 2);
            break;
        default:
            console.error('Selección de fecha de cambio inválida');
            return null;
    }

    const formattedDate = formatDate(fechaCambio);
    return formattedDate;
};

const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
}

export const calcularEdad = (fechaNacimiento) => {
    if (!isValidDate(fechaNacimiento)) {
        ToastifyError("Error al calcular la edad");
        return;
    }

    const diferenciaFechas = Date.now() - fechaNacimiento.getTime();
    const edad = new Date(diferenciaFechas);
    return Math.abs(edad.getUTCFullYear() - 1970);
};