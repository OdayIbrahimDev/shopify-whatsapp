export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed. Use POST.'});
  }

  // Shopify قد ترسل JSON مختلف حسب الإعداد
  const customer = req.body?.id ? req.body : req.body?.customer || {};
  const name = customer.first_name || "عميلنا العزيز";

  // Shopify قد تستخدم phone أو phone_number أو addresses[]
  let phone = customer.phone || customer.phone_number;
  if (!phone && Array.isArray(customer.addresses) && customer.addresses.length) {
    phone = customer.addresses[0].phone;
  }

  if (!phone) {
    console.log("No phone number found in payload:", JSON.stringify(req.body));
    return res.status(200).json({status: "no_phone", message: "Customer created but no phone. Skipped WhatsApp."});
  }

  // تنظيف الرقم
  phone = phone.replace(/\D/g, "");

  const DISCOUNT_CODE = process.env.DISCOUNT_CODE || "WELCOME15";
  const STORE_URL = process.env.STORE_URL || "https://YOURSHOPIFYSTORE.com";
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.error("Missing WhatsApp env vars.");
    return res.status(500).json({error: "Missing WhatsApp config"});
  }

  const message = `مرحباً ${name}! 🎉
شكرًا لتسجيلك في Novella.
هديتك الترحيبية: خصم 15٪ على أول طلب.
استخدم الكود: ${DISCOUNT_CODE}
تسوق الآن: ${STORE_URL}/discount/${DISCOUNT_CODE}`;

  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await r.json();
    console.log("WhatsApp API response:", data);

    if (!r.ok) {
      return res.status(500).json({error: "WhatsApp send failed", details: data});
    }

    return res.status(200).json({status: "sent", to: phone, wa_response: data});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: "Server error", details: err.message});
  }
}
