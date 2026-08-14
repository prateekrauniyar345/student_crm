import { createContext, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    CircleCheck,
    TriangleAlert,
    CircleX,
    Info
} from "lucide-react";

// meaning of each parameter in the toast function
// - **title**: Short heading text shown in toast.  
// - **position**: Screen corner where toast appears.  
// - **autoClose**: Milliseconds before toast closes automatically.  
// - **hideProgressBar**: Hide the closing progress bar.  
// - **closeOnClick**: Whether clicking dismisses the toast.  
// - **pauseOnHover**: Pause auto-close when hovering.  
// - **draggable**: Allow user to drag toast around.  
// - **progress**: Fraction (0–1) of remaining progress.  
// - **theme**: Visual style: light, dark, or colored.




const ToastContext = createContext();

export function ToastProvider({ children }) {

    const toastOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
    };

    const success = (message) => {
        toast.success(message, {
            ...toastOptions,
            icon: <CircleCheck size={22} />
        });
    };

    const warning = (message) => {
        toast.warning(message, {
            ...toastOptions,
            icon: <TriangleAlert size={22} />
        });
    };

    const error = (message) => {
        toast.error(message, {
            ...toastOptions,
            icon: <CircleX size={22} />
        });
    };

    const info = (message) => {
        toast.info(message, {
            ...toastOptions,
            icon: <Info size={22} />
        });
    };

    return (
        <ToastContext.Provider
            value={{
                success,
                warning,
                error,
                info
            }}
        >
            {children}

            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const toastContext = useContext(ToastContext);

    if (!toastContext) {
        throw new Error(
            "useToast must be used within a ToastProvider"
        );
    }

    return toastContext;
}