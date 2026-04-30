export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { type, data } = req.body;

  // MP manda muchos tipos de notificación, solo nos interesa "payment"
  if (type !== "payment") return res.status(200).json({ ok: true });

  try {
    // Verificamos el pago directamente con la API de MP
    const pagoRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });
    const pago = await pagoRes.json();

    if (pago.status === "approved") {
      // Acá en el futuro podés guardar en una DB
      // Por ahora solo confirmamos
      console.log("✅ Pago aprobado:", pago.id, pago.external_reference);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Error webhook:", e);
    return res.status(500).json({ error: e.message });
  }
}
