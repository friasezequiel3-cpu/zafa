// api/crear-pago.js
// Este archivo va en la carpeta /api dentro de tu proyecto en GitHub

export default async function handler(req, res) {
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
          success: process.env.NEXT_PUBLIC_URL + "/gracias",
          failure: process.env.NEXT_PUBLIC_URL,
          pending: process.env.NEXT_PUBLIC_URL
        },
        auto_return: "approved",
        statement_descriptor: "ZAFA Legal",
        notification_url: process.env.NEXT_PUBLIC_URL + "/api/webhook-mp"
      })
    });

    const data = await response.json();
    res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el pago" });
  }
}
