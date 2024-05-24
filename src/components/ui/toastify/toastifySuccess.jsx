import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify';

const ToastifySuccess = (message) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  });
};

export default ToastifySuccess;
