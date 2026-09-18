'use client';

import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';
import '@/components/ui/consultationToast/_consultationToast.scss';

export const ToastProvider = () => (
    <ToastContainer
        position="bottom-right"
        toastClassName="consultationToast"
        autoClose={3200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
    />
);
