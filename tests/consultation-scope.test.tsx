// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import ConsultationProvider, {
  useConsultation,
} from "@/components/providers/ConsultationProvider";

vi.mock("@/components/ui/consultationToast/ConsultationToast", () => ({
  notifyConsultationAdded: vi.fn(),
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function Cart() {
  const { count, addItem, clearItems } = useConsultation();
  return (
    <>
      <output aria-label="Cantidad">{count}</output>
      <button onClick={() => addItem({ id: "variant", name: "Producto" })}>
        Agregar
      </button>
      <button onClick={clearItems}>Vaciar</button>
    </>
  );
}

test("Separa la lista minorista y cada cuenta; restaura al volver y vacía solo la activa", async () => {
  localStorage.setItem(
    "el-arcangel:consultation:v1",
    JSON.stringify({
      items: [{ id: "variant", name: "Producto", quantity: 3 }],
    }),
  );
  const user = userEvent.setup();
  const view = render(
    <ConsultationProvider>
      <Cart />
    </ConsultationProvider>,
  );
  const count = () => screen.getByLabelText("Cantidad").textContent;
  await waitFor(() => expect(count()).toBe("3"));
  view.rerender(
    <ConsultationProvider accountId="account-a">
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("0"));
  await user.click(screen.getByText("Agregar"));
  expect(count()).toBe("1");
  view.rerender(
    <ConsultationProvider accountId="account-b">
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("0"));
  await user.click(screen.getByText("Agregar"));
  await user.click(screen.getByText("Agregar"));
  view.rerender(
    <ConsultationProvider accountId="account-a">
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("1"));
  await user.click(screen.getByText("Vaciar"));
  view.rerender(
    <ConsultationProvider>
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("3"));
  view.rerender(
    <ConsultationProvider accountId="account-b">
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("2"));
  view.rerender(
    <ConsultationProvider accountId="account-a">
      <Cart />
    </ConsultationProvider>,
  );
  await waitFor(() => expect(count()).toBe("0"));
});
