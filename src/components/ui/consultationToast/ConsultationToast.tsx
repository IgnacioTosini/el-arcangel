import Link from "next/link";
import { toast, type ToastContentProps } from "react-toastify";

import "./_consultationToast.scss";

type Props = { name: string; quantity: number; onClose: () => void };

export default function ConsultationToast({ name, quantity, onClose }: Props) {
  return (
    <div className="consultationToastContent">
      <span className="consultationToastIcon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <div className="consultationToastText">
        <strong>Agregado a tu consulta</strong>
        <p>
          {quantity} × {name}
        </p>
        <Link href="/mi-consulta" onClick={onClose}>
          Ver mi consulta <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function notifyConsultationAdded(name: string, quantity: number) {
  const id = "consultation-added";
  const content = ({ closeToast }: ToastContentProps) => (
    <ConsultationToast
      name={name}
      quantity={quantity}
      onClose={() => closeToast()}
    />
  );
  if (toast.isActive(id))
    toast.update(id, { render: content, autoClose: 4000 });
  else
    toast(content, {
      toastId: id,
      className: "consultationToast",
      progressClassName: "consultationToastProgress",
      position: "bottom-right",
      icon: false,
      closeOnClick: false,
      autoClose: 4000,
      role: "status",
    });
}
