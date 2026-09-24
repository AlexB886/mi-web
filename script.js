/* ==========================================================================
   1. MODO OSCURO / CLARO
   ========================================================================== */

// Busca el botón del tema
const themeBtn = document.getElementById("themeBtn");

// Aplica el tema y cambia el texto del botón
function aplicarTema(tema) {
  // Añade o quita la clase dark en <html>
  document.body.classList.toggle("dark-mode", tema === "oscuro");
  // Cambia el texto del botón
  if (themeBtn) {
    themeBtn.textContent = tema === "oscuro" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  }
}

// Al pulsar el botón, cambia el tema y lo guarda en localStorage
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const esOscuro = document.body.classList.contains("dark-mode");
    const nuevoTema = esOscuro ? "claro" : "oscuro";

    // Guarda la preferencia
    localStorage.setItem("tema", nuevoTema);

    // Aplica el tema
    aplicarTema(nuevoTema);
  });
}

// Al abrir la web, recupera el tema guardado
const temaGuardado = localStorage.getItem("tema") || "claro";
aplicarTema(temaGuardado);

/* ==========================================================================
   2. AÑO AUTOMÁTICO EN EL PIE
   ========================================================================== */

const anio = document.getElementById("anio");
if (anio) {
  anio.textContent = new Date().getFullYear();
}

/* ==========================================================================
   3. FORMULARIO DE CONSULTAS
   ========================================================================== */

const form = document.getElementById("formConsultas");
const mensajeFormulario = document.getElementById("mensajeFormulario");

// Tipos de consulta
const tiposConsulta = {
  numero: "¿Cuál es tu número de contacto?",
  agendar: "¿Cómo puedo agendar contigo una consulta?",
  servicios: "Me interesan tus servicios, ¿cómo lo gestionamos?"
};

// Al enviar el formulario
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Campos
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const consulta = form.consulta.value;
    const mensaje = form.mensaje.value.trim();
    const acepto = form.acepto.checked;

    // Validación básica
    if (!nombre || !correo || !consulta || !mensaje) {
      mostrarMensaje("Rellena todos los campos obligatorios.", "error");
      return;
    }

    if (!acepto) {
      mostrarMensaje("Debes aceptar la política de privacidad.", "error");
      return;
    }

    // Mensaje de éxito
    const tipo = tiposConsulta[consulta] || "Consulta general";

    mostrarMensaje(
      `Gracias, ${nombre}. Tu consulta sobre “${tipo}” se ha enviado correctamente. Te responderé a ${correo}.`,
      "ok"
    );

    // Limpia el formulario
    form.reset();
  });
}

// Muestra mensaje de éxito o error
function mostrarMensaje(texto, tipo) {
  if (!mensajeFormulario) return;

  mensajeFormulario.textContent = texto;
  mensajeFormulario.className = `form-feedback ${tipo}`;
  mensajeFormulario.hidden = false;

  // Lo oculta automáticamente tras unos segundos
  clearTimeout(mensajeFormulario.timeout);
  mensajeFormulario.timeout = setTimeout(() => {
    mensajeFormulario.hidden = true;
  }, 8000);
}
/* Máquina de escribir letra a letra (bucle) */
(function () {
  const el = document.getElementById("nombre");
  if (!el) return; // en consultas.html no hay nombre, se ignora
  const texto = "Alex Baicu";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = texto;
    return;
  }
  let i = 0, dir = 1; // 1 escribe, -1 borra
  function tick() {
    if (dir === 1) {
      i++;
      el.textContent = texto.slice(0, i);
      if (i >= texto.length) { dir = -1; return setTimeout(tick, 1600); }
      return setTimeout(tick, 110);
    } else {
      i--;
      el.textContent = texto.slice(0, Math.max(i, 0));
      if (i <= 0) { dir = 1; return setTimeout(tick, 500); }
      return setTimeout(tick, 60);
    }
  }
  tick();
})();/* ==========================================================================
  ```js
/* ==========================================================================
   4. DINOSAURIO: CARRERA + SALTO + NAVEGACIÓN
   ========================================================================== */

(function () {
  const dino = document.querySelector(".dino");
  const pista = document.querySelector(".pista");
  const agujeros = document.querySelectorAll(".agujero");

  if (!dino || !pista || !agujeros.length) return;

  let animando = false;

  agujeros.forEach((agujero) => {

    agujero.addEventListener("click", (e) => {
      e.preventDefault();

      // Evita que se pueda iniciar otra animación mientras está corriendo
      if (animando) return;

      animando = true;

      const destino = agujero.getAttribute("href");

      // Quitamos el estado anterior
      agujeros.forEach((a) => a.classList.remove("activo"));

      // Marcamos el botón seleccionado
      agujero.classList.add("activo");

      // Calculamos dónde está el agujero
      const rect = agujero.getBoundingClientRect();
      const pistaRect = pista.getBoundingClientRect();

      const destinoX =
        rect.left -
        pistaRect.left +
        rect.width / 2 -
        dino.offsetWidth / 2;

      // Posición actual del dinosaurio
      const dinoRect = dino.getBoundingClientRect();

      const inicioX =
        dinoRect.left -
        pistaRect.left;

      // Distancia que tiene que recorrer
      const distancia = Math.abs(destinoX - inicioX);

      // Más distancia = más tiempo de carrera
      // Mínimo 500 ms, máximo 1500 ms
      const tiempoCarrera = Math.min(
        Math.max(distancia * 2.2, 500),
        1500
      );

      // Ponemos el tiempo como variable CSS
      dino.style.setProperty(
        "--tiempo-carrera",
        `${tiempoCarrera}ms`
      );

      // Guardamos la posición final
      dino.style.setProperty(
        "--destino-x",
        `${destinoX}px`
      );

      // Iniciamos la carrera
      dino.classList.add("corriendo");

      // Cuando termina la carrera empieza el salto
      setTimeout(() => {

        dino.classList.remove("corriendo");
        dino.classList.add("saltando");

        // El botón se hunde cuando el dinosaurio aterriza
        setTimeout(() => {
          dino.classList.remove("saltando");

          // Pequeño retraso para que se vea el aterrizaje
          setTimeout(() => {

            // Si es un enlace interno
            if (destino.startsWith("#")) {
              const elemento = document.querySelector(destino);

              if (elemento) {
                elemento.scrollIntoView({
                  behavior: "smooth"
                });
              }

            } else {
              // Si es otra página
              window.location.href = destino;
            }

          }, 150);

        }, 500);

      }, tiempoCarrera);
    });

  });

})();



