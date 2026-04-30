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
          success: "https://zafa.vercel.app/?pago=ok",  
    failure: "https://zafa.vercel.app/?pago=error",
    pending: "https://zafa.vercel.app/?pago=pendiente"
  },
  auto_return: "approved",
  notification_url: "https://zafa.vercel.app/api/webhook-mp",
  external_reference: Date.now().toString(),  //
  statement_descriptor: "ZAFA Legal"
      })
    });

    const data = await response.json();
    return res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear el pago", detail: error.message });
  }
}
