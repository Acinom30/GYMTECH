import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify';

const ToastifyError = (message) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition:  typeof Bounce,
  });
};

export default ToastifyError;