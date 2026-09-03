const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json());


/* =========================================
   INICIO
========================================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================================
   IA
========================================= */

app.post("/ia", async (req, res) => {

    try {

        const {
            texto,
            herramienta,
            longitud,
            idioma
        } = req.body;


        /* -------------------------------------
           COMPROBAR TEXTO
        ------------------------------------- */

        if (!texto || texto.trim() === "") {

            return res.status(400).json({
                error: "No has enviado ningún texto."
            });

        }


        let instruccion = "";


        /* =====================================
           RESUMIR
        ===================================== */

        if (herramienta === "summarize") {

            let instruccionLongitud;

            if (longitud === "short") {

                instruccionLongitud =
                    "Haz un resumen muy breve, quedándote solo con las ideas principales.";

            } else if (longitud === "medium") {

                instruccionLongitud =
                    "Haz un resumen de longitud media, incluyendo las ideas principales y los detalles importantes.";

            } else {

                instruccionLongitud =
                    "Haz un resumen bastante completo, pero sin repetir información innecesaria.";

            }


            instruccion = `
Eres un asistente especializado en resumir textos en español.

Resume el siguiente texto.

${instruccionLongitud}

Mantén el significado original.
No inventes información.
No añadas opiniones personales.
Escribe el resultado de forma clara y fácil de leer.
`;

        }


        /* =====================================
           TRADUCIR
        ===================================== */

        else if (herramienta === "translate") {

            instruccion = `
Eres un traductor profesional.

Traduce el siguiente texto al idioma indicado.

IDIOMA DESTINO:
${idioma || "Inglés"}

Mantén el significado original.
Conserva el tono y el formato cuando sea posible.
No añadas explicaciones.
No añadas opiniones.

Devuelve únicamente la traducción.
`;

        }


        /* =====================================
           CORREGIR
        ===================================== */

        else if (herramienta === "correct") {

            instruccion = `
Eres un corrector profesional de textos en español.

Corrige los errores ortográficos, gramaticales y de puntuación del siguiente texto.

Mantén el estilo original siempre que sea posible.
No cambies las ideas.
No inventes información.
No añadas explicaciones.

Devuelve únicamente el texto corregido.
`;

        }


        /* =====================================
           MEJORAR
        ===================================== */

        else if (herramienta === "improve") {

            instruccion = `
Eres un editor profesional de textos.

Mejora el siguiente texto para que sea más claro,
natural, fluido y profesional.

Mantén las ideas y el significado original.
No inventes información.
No añadas opiniones personales.

Devuelve únicamente el texto mejorado.
`;

        }


        /* =====================================
           ESTUDIAR
        ===================================== */

        else if (herramienta === "study") {

            let instruccionLongitud;

            if (longitud === "short") {

                instruccionLongitud =
                    "Hazlo breve y céntrate en los conceptos fundamentales.";

            } else if (longitud === "medium") {

                instruccionLongitud =
                    "Crea un material de estudio de longitud media, incluyendo los conceptos y detalles importantes.";

            } else {

                instruccionLongitud =
                    "Crea un material de estudio completo, bien organizado y detallado.";

            }


            instruccion = `
Eres un profesor especializado en ayudar a estudiantes.

Convierte los siguientes apuntes o texto en material de estudio.

${instruccionLongitud}

Organiza la información de forma clara.
Utiliza títulos, apartados y listas cuando sean útiles.
Explica los conceptos importantes de manera sencilla.
No inventes información que no aparezca en el texto.
`;

        }


        /* =====================================
           GENERAR IDEAS
        ===================================== */

        else if (herramienta === "ideas") {

            instruccion = `
Eres un asistente creativo especializado en generar ideas.

A partir del siguiente tema, genera varias ideas útiles,
originales y diferentes entre sí.

Organiza las ideas en una lista clara.
Explica brevemente cada idea cuando sea necesario.
Evita repetir ideas.
`;

        }


        /* =====================================
           HERRAMIENTA NO VÁLIDA
        ===================================== */

        else {

            return res.status(400).json({
                error: "Herramienta no válida."
            });

        }


        /* =====================================
           CREAR PROMPT
        ===================================== */

        const prompt = `

${instruccion}

TEXTO DEL USUARIO:

${texto}

`;


        /* =====================================
           GEMINI
        ===================================== */

        const response =
            await ai.models.generateContent({

                model: "gemini-3.6-flash",

                contents: prompt

            });


        /* =====================================
           RESPUESTA
        ===================================== */

        const resultado =
            response.text;


        res.json({

            resultado: resultado

        });


    } catch (error) {

        console.error(
            "ERROR COMPLETO DE GEMINI:"
        );

        console.error(error);


        res.status(500).json({

            error:
                "No se ha podido procesar el texto.",

            detalle:
                error.message

        });

    }

});


/* =========================================
   ARRANCAR SERVIDOR
========================================= */

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Servidor de Resumia funcionando en el puerto ${PORT}`
    );
});