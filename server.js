import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

//  information for WhatsApp API    
const WHATSAPP_TOKEN = "EAASpCFQuO3kBPM5pQvibTgYLCZCNgxp5enG4xCiEwD2QAS0dJ053l9y0zYqtSsEj73C5IOf6wdRUuklljx35uSgqXFr2mbDuZAQZB0LkcFHHERK47BtbNLvubWymLdT2hVh1wC3mNq0O3kCW7mprvuqpS2uVmuF4hP6nG33tm1xmdEGkZB8YbilqjVRohuz6JVMgETIPDAarDlb2UV7E4UnysclwPSz9V8FI6ZBJFZCHJ0TAZDZD"; // access token from Meta
const WHATSAPP_PHONE_ID = "1448176859709782"; // number ID of your WhatsApp Business Account
const STORE_URL = "https://novella-sally.com"; //  url of your store
const DISCOUNT_CODE = "WELCOME15"; // discount code 

app.post("/customer-created", async (req, res) => {
  const customer = req.body;
  const phone = customer.phone?.replace(/\D/g, ""); // remove non-numeric characters 
  const name = customer.first_name || "عميلنا العزيز";

  if (!phone) {
    return res.status(400).send("No phone number found.");
  }

  const message = `مرحباً ${name}! 🎉
شكرًا لتسجيلك في Novella.
هديتك الترحيبية: خصم 15٪ على أول طلب.
استخدم الكود: ${DISCOUNT_CODE}
تسوق الآن: ${STORE_URL}/discount/${DISCOUNT_CODE}`;

  try {
    await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
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

    res.status(200).send("WhatsApp message sent!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending WhatsApp message.");
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp Automation is running!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
