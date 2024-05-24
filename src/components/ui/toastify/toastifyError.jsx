import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

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
  return (
    <div>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          style={{ fontSize: '14px' }}
          className="toastify-container"
        >
        <ToastifyError>Error</ToastifyError>
        </ToastContainer>
    </div>
  )
};

export default ToastifyError;