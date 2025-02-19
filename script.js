// URLs de las APIs del diccionario y Pixabay
const urlDiccionario = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const urlPixabay = "https://pixabay.com/api/?key=48923565-50546a36b044ec403802ea0fc&q=";

// Referencias a los elementos del DOM
const resultado = document.getElementById("resultado");
const botonBuscar = document.getElementById("buscar-btn");
const botonMicrofono = document.getElementById("microfono-btn");
const listaHistorial = document.getElementById("lista-historial");
const botonToggleHistorial = document.getElementById("toggle-historial-btn");
const botonCerrarHistorial = document.getElementById("cerrar-historial-btn");
const contenedorHistorial = document.getElementById("contenedor-historial");
const botonToggleTraducir = document.getElementById("toggle-traducir-btn");

const MAX_HISTORIAL_ITEMS = 10;
let idiomaActual = "en";

// Eventos para botones y entradas
// Evento para buscar palabra al hacer clic en el botón de búsqueda 
botonBuscar.addEventListener("click", buscarPalabra);

// Evento para buscar palabra al presionar Enter en el campo de entrada
document.getElementById("entrada-palabra").addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        buscarPalabra();
    }
});

// Evento para iniciar el dictado al hacer clic en el botón de micrófono
botonMicrofono.addEventListener("click", iniciarDictado);

// Evento para mostrar/ocultar el historial al hacer clic en el botón de historial
botonToggleHistorial.addEventListener("click", () => {
    contenedorHistorial.classList.toggle("mostrar");
    if (contenedorHistorial.classList.contains("mostrar")) {
        cargarHistorial();
    }
});

// Evento para cerrar el historial al hacer clic en el botón de cerrar
botonCerrarHistorial.addEventListener("click", () => {
    contenedorHistorial.classList.remove("mostrar");
});

// Evento para traducir la página al hacer clic en el botón de traducir
botonToggleTraducir.addEventListener("click", traducirPagina);

// Función para buscar palabra en la API del diccionario
function buscarPalabra() {
    let entradaPalabra = document.getElementById("entrada-palabra").value;
    
    // Buscar definición y sinónimos
    fetch(`${urlDiccionario}${entradaPalabra}`)
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            if (datos.title && datos.title === "No Definitions Found") {
                throw new Error("No se pudo encontrar la palabra");
            }

            const datosPalabra = datos[0];
            const sinonimos = datosPalabra.meanings[0].definitions[0].synonyms || [];
            const textoSinonimos = sinonimos.length > 0 ? sinonimos.join(", ") : "No hay sinónimos disponibles";
            const ejemplo = datosPalabra.meanings[0].definitions[0].example || "No hay ejemplo disponible";
            
            document.getElementById("nombre-palabra").textContent = entradaPalabra;
            document.getElementById("texto-sinonimos").textContent = textoSinonimos;
            document.getElementById("significado-palabra").textContent = datosPalabra.meanings[0].definitions[0].definition;
            document.getElementById("ejemplo-palabra").textContent = ejemplo;
            
            // Mostrar elementos ocultos
            document.querySelector(".palabra").style.display = "flex";
            document.querySelector(".sinonimos").style.display = "block";
            document.querySelector(".definicion").style.display = "block";
            document.querySelector(".ejemplo").style.display = "block";
            
            // Buscar imagen en Pixabay
            fetch(`${urlPixabay}${entradaPalabra}&image_type=photo&pretty=true`)
                .then((respuesta) => respuesta.json())
                .then((datosImagen) => {
                    const urlImagen = datosImagen.hits[0]?.webformatURL || '';
                    document.getElementById("imagen-palabra").src = urlImagen;
                })
                .catch(() => {
                    document.getElementById("imagen-palabra").src = '';
                });

            // Guardar término de búsqueda en localStorage
            guardarTerminoBusqueda(entradaPalabra);
        })
        .then(() => {
            if (idiomaActual === "es") {
                traducirResultado();
            }
        })
        .catch((error) => {
            resultado.innerHTML = `<h3 class="error">${error.message}</h3>`;
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
}

// Función para guardar término de búsqueda en el historial
function guardarTerminoBusqueda(palabra) {
    let historial = JSON.parse(localStorage.getItem("historialBusqueda")) || [];
    historial.unshift({ palabra: palabra, timestamp: new Date().toLocaleString() }); // Mostrar primero las palabras buscadas más recientemente

    if (historial.length > MAX_HISTORIAL_ITEMS) {
        historial = historial.slice(0, MAX_HISTORIAL_ITEMS); // Mantener solo los más recientes
    }
    
    localStorage.setItem("historialBusqueda", JSON.stringify(historial));
    cargarHistorial();
}

// Función para cargar el historial desde localStorage
function cargarHistorial() {
    let historial = JSON.parse(localStorage.getItem("historialBusqueda")) || [];
    listaHistorial.innerHTML = '';
    historial.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${item.palabra} - ${item.timestamp} <button onclick="eliminarItemHistorial(${index})"><i class="fas fa-trash"></i></button>`;
        listaHistorial.appendChild(li);
    });
    traducirHistorial();
}

// Función para eliminar un término del historial
function eliminarItemHistorial(index) {
    let historial = JSON.parse(localStorage.getItem("historialBusqueda")) || [];
    historial.splice(index, 1);
    localStorage.setItem("historialBusqueda", JSON.stringify(historial));
    cargarHistorial();
}

// Función para traducir la página
function traducirPagina() {
    idiomaActual = idiomaActual === "en" ? "es" : "en";
    const body = document.body;
    body.setAttribute("lang", idiomaActual);
    document.documentElement.lang = idiomaActual;

    const textosATraducir = {
        en: {
            "toggle-historial-btn": "History",
            "toggle-traducir-btn": "Translate",
            "entrada-palabra": "Type the word here...",
            "buscar-btn": "Search",
            "sinonimos": "Synonyms",
            "definicion": "Definition",
            "ejemplo": "Example",
            "imagen": "Image",
            "cerrar-historial-btn": "Close",
            "history-title": "Search History",
            "logo": "Web Dictionary",
        },
        es: {
            "toggle-historial-btn": "Historial",
            "toggle-traducir-btn": "Traducir",
            "entrada-palabra": "Escribe la palabra aquí...",
            "buscar-btn": "Buscar",
            "sinonimos": "Sinónimos",
            "definicion": "Definición",
            "ejemplo": "Ejemplo",
            "imagen": "Imagen",
            "cerrar-historial-btn": "Cerrar",
            "history-title": "Historial de Búsqueda",
            "logo": "Diccionario Web",
        }
    };

    const traduccion = textosATraducir[idiomaActual];

    document.getElementById("toggle-historial-btn").textContent = traduccion["toggle-historial-btn"];
    document.getElementById("toggle-traducir-btn").textContent = traduccion["toggle-traducir-btn"];
    document.getElementById("entrada-palabra").setAttribute("placeholder", traduccion["entrada-palabra"]);
    document.getElementById("buscar-btn").textContent = traduccion["buscar-btn"];
    document.getElementById("cerrar-historial-btn").textContent = traduccion["cerrar-historial-btn"];
    document.querySelector(".historial h2").textContent = traduccion["history-title"];
    document.querySelector(".logo h1").textContent = traduccion["logo"];

    traducirResultado();
    traducirHistorial();
}

// Función para traducir los resultados
function traducirResultado() {
    const nombrePalabra = document.getElementById("nombre-palabra");
    const significadoPalabra = document.querySelector(".significado-palabra");
    const textoSinonimos = document.getElementById("texto-sinonimos");
    const ejemploPalabra = document.getElementById("ejemplo-palabra");

    if (nombrePalabra) {
        traducirTexto(nombrePalabra.textContent, idiomaActual).then(textoTraducido => {
            nombrePalabra.textContent = textoTraducido;
        });
    }

    if (significadoPalabra) {
        traducirTexto(significadoPalabra.textContent, idiomaActual).then(textoTraducido => {
            significadoPalabra.textContent = textoTraducido;
        });
    }

    if (textoSinonimos) {
        traducirTexto(textoSinonimos.textContent, idiomaActual).then(textoTraducido => {
            textoSinonimos.textContent = textoTraducido;
        });
    }

    if (ejemploPalabra) {
        traducirTexto(ejemploPalabra.textContent, idiomaActual).then(textoTraducido => {
            ejemploPalabra.textContent = textoTraducido;
        });
    }
}

// Función para traducir el historial
function traducirHistorial() {
    const itemsHistorial = listaHistorial.querySelectorAll('li');
    itemsHistorial.forEach((item, index) => {
        const palabra = item.childNodes[0].textContent.split(' - ')[0];
        const fecha = item.childNodes[0].textContent.split(' - ')[1];
        traducirTexto(palabra, idiomaActual).then(palabraTraducida => {
            item.innerHTML = `${palabraTraducida} - ${fecha} <button onclick="eliminarItemHistorial(${index})"><i class="fas fa-trash"></i></button>`;
        });
    });
}

// Función para traducir texto usando la API de Google Translate
function traducirTexto(texto, idiomaDestino) {
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${idiomaDestino}&dt=t&q=${encodeURI(texto)}`;
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => data[0][0][0])
        .catch(() => texto);
}

// Función para iniciar el dictado de voz
function iniciarDictado() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
        const reconocimiento = new webkitSpeechRecognition();
        reconocimiento.continuous = false;
        reconocimiento.interimResults = false;
        reconocimiento.lang = "es-ES";
        reconocimiento.start();

        reconocimiento.onresult = function(event) {
            document.getElementById('entrada-palabra').value = event.results[0][0].transcript;
            reconocimiento.stop();
            buscarPalabra();
        };

        reconocimiento.onerror = function(event) {
            reconocimiento.stop();
        };
    }
}