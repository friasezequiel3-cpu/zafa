export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { monto, descripcion } = req.body;

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          {
            title: descripcion || "Descargo formal - ZAFÁ",
            quantity: 1,
            unit_price: monto || 5000,
            currency_id: "ARS"
          }
        ],
        back_urls: {
          success: "https://zafa.vercel.app",
          failure: "https://zafa.vercel.app",
          pending: "https://zafa.vercel.app"
        },
        auto_return: "approved",
        statement_descriptor: "ZAFA Legal"
      })
    });

    const data = await response.json();
    return res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear el pago", detail: error.message });
  }
}
