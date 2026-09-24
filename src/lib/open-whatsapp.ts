export async function openWhatsApp(
  phone: string,
  message: string,
  beforeOpen: () => Promise<unknown>,
) {
  // Open during the click, before awaiting the request, to avoid popup blocking.
  const tab = window.open("about:blank", "_blank");
  if (!tab)
    throw new Error(
      "Permití las ventanas emergentes para abrir WhatsApp y volvé a intentar. Tu lista se conserva.",
    );
  tab.opener = null;
  try {
    await beforeOpen();
    if (tab.closed)
      throw new Error(
        "Cerraste la pestaña de WhatsApp. Volvé a intentar; tu lista se conserva.",
      );
    tab.location.replace(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    );
  } catch (error) {
    tab.close();
    throw error;
  }
}
