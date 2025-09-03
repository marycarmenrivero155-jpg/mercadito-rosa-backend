


const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅" : "❌");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅" : "❌");

console.log("Token MercadoPago:", process.env.MP_ACCESS_TOKEN ? "✅ Cargado" : "❌ No encontrado");

const app = express();


/*app.use(cors({origin: "https://mercadito-rosa.web.app",
}));*/
app.use(express.json());
const allowedOrigins = [
  "https://mercadito-rosa.web.app",
  "http://localhost:5173",
   "https://marycarmenrivero155-jpg.github.io"
];

app.use(cors({
  origin: function(origin, callback){
    // Para peticiones sin origen (ej. Postman)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `El CORS no está permitido para el origen: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


// 1. Configurar Mercado Pago
const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});



// 2. Ruta para crear una preferencia
app.post("/create_preference", async (req, res) => {
  const productos = req.body.items;
  console.log("📦 Productos recibidos:", productos);
  console.log("📥 Se recibió una petición POST a /create_preference");
  console.log("🧾 Body recibido:", req.body);

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).send({ error: "No se recibieron productos válidos." });
    }

    const items = productos.map((item) => ({
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: "ARS"
    }));

    const preference = new Preference(mp);
   
    
    const result = await preference.create({
  body: {
    items,
     back_urls: {
          success: "https://mercadito-rosa.web.app/success",
          failure: "https://mercadito-rosa.web.app/failure",
          pending: "https://mercadito-rosa.web.app/pending",
        },
       // auto_return: "approved",
  },
});


    console.log("🎯 Preferencia creada con ID:", result.id);
    res.json({ id: result.id });

  } catch (error) {
    console.error("❌ Error al crear la preferencia:", error.message);
    if (error.cause) {
      console.error("Detalles:", JSON.stringify(error.cause, null, 2));
    }else{
      console.error("📌 Stack:", error.stack);
    }
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

const nodemailer =require("nodemailer");
require("dotenv").config();

// Configurar transporter (Nodemailer con Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para enviar mensaje desde formulario de contacto
app.post("/send-email", async (req, res) => {
  const { name, apellido, dni, direccion, telefono, correo, comentario } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Nuevo mensaje de contacto desde tu eCommerce",
    text: `
    Nombre: ${name} ${apellido}
    DNI: ${dni}
    Dirección: ${direccion}
    Teléfono: ${telefono}
    Correo: ${correo}
    Comentario: ${comentario}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado correctamente");
    res.status(200).json({ message: "Mensaje enviado con éxito" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

// Ruta de test
app.get("/test", (req, res) => {
  res.json({ message: "Backend funcionando correctamente!" });
});

/* Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});*/


// Puerto dinámico para Cloud Run o 8080 local
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
