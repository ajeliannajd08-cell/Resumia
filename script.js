/* =========================================
   RESUMIA
   Aplicación de herramientas IA
   ========================================= */


/* -----------------------------------------
   CONFIGURACIÓN DE HERRAMIENTAS
----------------------------------------- */

const tools = {

    summarize: {
        icon: "📝",
        title: "Resumir texto",
        description: "Convierte un texto largo en un resumen claro y conciso.",
        button: "Resumir texto",
        placeholder: "Pega aquí el texto que quieras resumir..."
    },

    translate: {
        icon: "🌍",
        title: "Traducir",
        description: "Traduce tus textos rápidamente a diferentes idiomas.",
        button: "Traducir texto",
        placeholder: "Pega aquí el texto que quieras traducir..."
    },

    correct: {
        icon: "✍️",
        title: "Corregir texto",
        description: "Corrige errores ortográficos y gramaticales.",
        button: "Corregir texto",
        placeholder: "Pega aquí el texto que quieras corregir..."
    },

    improve: {
        icon: "✨",
        title: "Mejorar texto",
        description: "Haz que tu texto sea más claro, natural y profesional.",
        button: "Mejorar texto",
        placeholder: "Pega aquí el texto que quieras mejorar..."
    },

    study: {
        icon: "📚",
        title: "Estudiar",
        description: "Convierte tus apuntes en material de estudio.",
        button: "Crear resumen de estudio",
        placeholder: "Pega aquí tus apuntes o el contenido que quieras estudiar..."
    },

    ideas: {
        icon: "💡",
        title: "Generar ideas",
        description: "Obtén nuevas ideas para proyectos, contenido y mucho más.",
        button: "Generar ideas",
        placeholder: "Escribe el tema sobre el que quieres obtener ideas..."
    }

};


/* -----------------------------------------
   ELEMENTOS HTML
----------------------------------------- */

const homePage = document.getElementById("homePage");
const toolPage = document.getElementById("toolPage");

const inputText = document.getElementById("inputText");
const resultText = document.getElementById("resultText");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

const processButton = document.getElementById("processButton");
const processButtonText = document.getElementById("processButtonText");

const toolTitle = document.getElementById("toolTitle");
const toolDescription = document.getElementById("toolDescription");
const toolHeaderIcon = document.getElementById("toolHeaderIcon");

const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const backButton = document.getElementById("backButton");

const lengthOption = document.getElementById("lengthOption");
const languageOption = document.getElementById("languageOption");
const languageSelect = document.getElementById("languageSelect");

const toast = document.getElementById("toast");

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");


/* -----------------------------------------
   ESTADO
----------------------------------------- */

let currentTool = "summarize";
let selectedLength = "medium";


/* -----------------------------------------
   CAMBIAR DE HERRAMIENTA
----------------------------------------- */

function openTool(toolName) {

    if (!tools[toolName]) {
        return;
    }

    currentTool = toolName;

    const tool = tools[toolName];

    homePage.classList.add("hidden");
    toolPage.classList.remove("hidden");

    toolTitle.textContent = tool.title;

    toolDescription.textContent = tool.description;

    toolHeaderIcon.textContent = tool.icon;

    processButtonText.textContent = tool.button;

    inputText.placeholder = tool.placeholder;

    resultText.innerHTML = `
        <div class="empty-result">

            <div class="empty-icon">
                ✦
            </div>

            <p>
                El resultado aparecerá aquí.
            </p>

            <small>
                Introduce un texto y pulsa el botón de arriba.
            </small>

        </div>
    `;

    inputText.value = "";

    updateCounters();

    updateOptions();

    updateNavigation(toolName);

    sidebar.classList.remove("open");
}


/* -----------------------------------------
   OPCIONES SEGÚN HERRAMIENTA
----------------------------------------- */

function updateOptions() {

    if (
        currentTool === "summarize" ||
        currentTool === "study"
    ) {

        lengthOption.classList.remove("hidden");

    } else {

        lengthOption.classList.add("hidden");

    }


    if (currentTool === "translate") {

        languageOption.classList.remove("hidden");

    } else {

        languageOption.classList.add("hidden");

    }

}


/* -----------------------------------------
   NAVEGACIÓN
----------------------------------------- */

function updateNavigation(toolName) {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.tool === toolName) {
                button.classList.add("active");
            }

        });

}


function goHome() {

    toolPage.classList.add("hidden");

    homePage.classList.remove("hidden");

    updateNavigation("home");

}


/* -----------------------------------------
   CONTADORES
----------------------------------------- */

function updateCounters() {

    const text = inputText.value.trim();

    const characters = inputText.value.length;

    let words = 0;

    if (text.length > 0) {
        words = text.split(/\s+/).length;
    }

    wordCount.textContent =
        `${words} ${words === 1 ? "palabra" : "palabras"}`;

    charCount.textContent =
        `${characters} ${characters === 1 ? "carácter" : "caracteres"}`;

}


/* -----------------------------------------
   SELECCIÓN DE LONGITUD
----------------------------------------- */

document
    .querySelectorAll(".option-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".option-button")
                .forEach(btn => {
                    btn.classList.remove("selected");
                });

            button.classList.add("selected");

            selectedLength =
                button.dataset.length;

        });

    });


/* -----------------------------------------
   BOTONES DE NAVEGACIÓN
----------------------------------------- */

document
    .querySelectorAll("[data-tool]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const tool = button.dataset.tool;

            if (tool === "home") {

                goHome();

            } else {

                openTool(tool);

            }

        });

    });


/* -----------------------------------------
   VOLVER
----------------------------------------- */

backButton.addEventListener("click", () => {

    goHome();

});


/* -----------------------------------------
   CONTADORES EN TIEMPO REAL
----------------------------------------- */

inputText.addEventListener("input", () => {

    updateCounters();

});


/* -----------------------------------------
   LIMPIAR
----------------------------------------- */

clearButton.addEventListener("click", () => {

    inputText.value = "";

    updateCounters();

    inputText.focus();

});


/* -----------------------------------------
   COPIAR
----------------------------------------- */

copyButton.addEventListener("click", async () => {

    const text =
        resultText.innerText.trim();

    if (
        !text ||
        text.includes("El resultado aparecerá aquí")
    ) {

        showToast("No hay ningún resultado para copiar.");

        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        showToast("Texto copiado.");

    } catch (error) {

        console.error(error);

        showToast("No se pudo copiar el texto.");

    }

});


/* -----------------------------------------
   BOTÓN PROCESAR
   CONEXIÓN CON GEMINI
----------------------------------------- */

processButton.addEventListener("click", async () => {

    const text =
        inputText.value.trim();

    if (!text) {

        showToast("Primero introduce un texto.");

        inputText.focus();

        return;
    }


    processButton.disabled = true;

    processButtonText.textContent =
        "Procesando...";


    resultText.innerHTML = `
        <div class="empty-result">

            <div class="empty-icon">
                ⏳
            </div>

            <p>
                La IA está trabajando...
            </p>

            <small>
                Esto puede tardar unos segundos.
            </small>

        </div>
    `;


    try {

        const response = await fetch(
            "https://pagina-web-t85z.onrender.com",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    texto: text,

                    herramienta: currentTool,

                    longitud: selectedLength,

                    idioma: languageSelect.value

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Ha ocurrido un error."
            );

        }


        if (!data.resultado) {

            throw new Error(
                "La IA no ha devuelto ningún resultado."
            );

        }


        resultText.innerHTML = `
            <div class="result-content">
                ${escapeHTML(data.resultado).replace(/\n/g, "<br>")}
            </div>
        `;


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );


        resultText.innerHTML = `
            <div class="empty-result">

                <div class="empty-icon">
                    ❌
                </div>

                <p>
                    No se pudo procesar el texto.
                </p>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>
        `;


        showToast(
            "Error al conectar con la IA."
        );


    } finally {

        processButton.disabled = false;

        processButtonText.textContent =
            tools[currentTool].button;

    }

});


/* -----------------------------------------
   SEGURIDAD
----------------------------------------- */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* -----------------------------------------
   TOAST
----------------------------------------- */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* -----------------------------------------
   MENÚ MÓVIL
----------------------------------------- */

mobileMenu.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});