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
})();
