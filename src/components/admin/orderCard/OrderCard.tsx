"use client";

import { useRef, useState } from "react";

import { formatAmount } from "@/components/sections/consultation/consultationUtils";
import Modal from "@/components/ui/modal/Modal";

import { statusLabels } from "../adminOverview/AdminOverview";
import { useAdmin } from "../AdminProvider";
import InlineFields from "../inlineFields/InlineFields";

import type { AdminRecord } from "../adminModels";

import "./_orderCard.scss";

export default function OrderCard({ order }: { order: AdminRecord }) {
  const { data, save } = useAdmin();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const phone = String(order.customerPhone ?? "").replace(/\D/g, "");
  const whatsapp = phone.length === 10 ? `549${phone}` : phone;
  const message = `Hola ${order.customerName}, te contactamos de El Arcángel por tu consulta CONS-${String(order.number).padStart(4, "0")}.`;
  async function changeStatus(status: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const failure = await save("Order", { id: order.id, status });
      if (failure) setError(failure);
      else setConfirming(false);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const items = data.OrderItem.filter((item) => item.orderId === order.id);
  return (
    <article className="orderCardContent">
      <div className="orderCardHeader">
        <div>
          <strong>{order.customerName}</strong>{" "}
          <span className="adminBadge">
            {statusLabels[String(order.purchaseType)]}
          </span>
          <p>
            CONS-{String(order.number).padStart(4, "0")} · {order.customerPhone}
            {order.businessName ? ` · ${order.businessName}` : ""}
          </p>
        </div>
        <div className="orderCardActions">
          {/^[0-9]{8,15}$/.test(whatsapp) && (
            <a
              className="orderCardWhatsapp"
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir WhatsApp de ${order.customerName} en una nueva pestaña`}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" />
                <path d="M8 7.5c0 4.5 4 8.5 8.5 8.5l1-2.5-3-1-1 1a8 8 0 0 1-3-3l1-1-1-3Z" />
              </svg>
              <span>WhatsApp del cliente</span>
              <span aria-hidden="true" className="orderCardWhatsappArrow">
                ↗
              </span>
            </a>
          )}
          <select
            disabled={busy || order.status === "COMPLETED"}
            aria-label={`Estado de la consulta de ${order.customerName}`}
            value={String(order.status)}
            onChange={(event) => {
              if (event.target.value === "COMPLETED") setConfirming(true);
              else void changeStatus(event.target.value);
            }}
          >
            {["PENDING", "COMPLETED", "INQUIRY_ONLY", "CANCELLED"].map(
              (status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
      {order.customerNote && (
        <p className="orderCardComment">“{order.customerNote}”</p>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              <strong>{item.productName}</strong>{" "}
              <small>
                {item.variantName} · {item.sku}
              </small>
            </span>
            <span>
              {item.quantity} ×{" "}
              {item.unitPrice === null
                ? "A confirmar"
                : formatAmount(Number(item.unitPrice))}
            </span>
          </li>
        ))}
      </ul>
      <p className="orderCardTotal">
        Total estimado:{" "}
        <strong>
          {order.estimatedTotal === null
            ? "A confirmar"
            : formatAmount(Number(order.estimatedTotal))}
        </strong>
      </p>
      {error && !confirming && (
        <p role="alert" className="adminError">
          {error}
        </p>
      )}
      {confirming && (
        <Modal
          title="Completar venta"
          dismissible={!busy}
          onClose={() => setConfirming(false)}
        >
          <p>
            Confirmá solo si la venta se concretó. Se revisará el stock actual
            de cada variante y se descontarán las cantidades de esta consulta.
            Todos los artículos deben tener stock definido y suficiente; si
            falta alguno, no se completará la venta ni se descontará ningún
            artículo.
          </p>
          <p>
            La consulta quedará cerrada; no se podrá cambiar su estado después.
          </p>
          {error && (
            <p role="alert" className="adminError">
              {error}
            </p>
          )}
          <div className="orderCardActions">
            <button
              className="adminButton"
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
            <button
              className="adminButton"
              disabled={busy}
              onClick={() => void changeStatus("COMPLETED")}
            >
              {busy ? "Guardando…" : "Confirmar venta y descontar stock"}
            </button>
          </div>
        </Modal>
      )}
      <details>
        <summary>Nota interna y cierre</summary>
        <InlineFields
          record={order}
          onSave={(record) => save("Order", record)}
          fields={[
            {
              name: "adminNote",
              label: "Nota interna",
              type: "textarea",
              optional: true,
              full: true,
            },
            {
              name: "finalTotal",
              label: "Importe final acordado ($)",
              type: "number",
              optional: true,
              step: "0.01",
            },
          ]}
        />
      </details>
    </article>
  );
}
