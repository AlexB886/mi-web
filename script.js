/* ==========================================================================
   1. MODO OSCURO / CLARO
   ========================================================================== */

const themeBtn = document.getElementById("themeBtn");

function aplicarTema(tema) {
  document.body.classList.toggle("dark-mode", tema === "oscuro");
  if (themeBtn) {
    themeBtn.textContent = tema === "oscuro" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  }
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const esOscuro = document.body.classList.contains("dark-mode");
    const nuevoTema = esOscuro ? "claro" : "oscuro";
    localStorage.setItem("tema", nuevoTema);
    aplicarTema(nuevoTema);
  });
}

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
   3. FORMULARIO DE CONSULTAS (envío real con Web3Forms)
   ========================================================================== */

const form = document.getElementById("formConsultas");
const mensajeFormulario = document.getElementById("mensajeFormulario");


if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const consulta = form.consulta.value;
    const mensaje = form.mensaje.value.trim();
    const acepto = form.acepto.checked;

    if (!nombre || !correo || !consulta || !mensaje) {
      mostrarMensaje("Rellena todos los campos obligatorios.", "error");
      return;
    }
    if (!acepto) {
      mostrarMensaje("Debes aceptar la política de privacidad.", "error");
      return;
    }

    const boton = form.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando...";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json();
      if (data.success) {
        mostrarMensaje(`Gracias, ${nombre}. Tu consulta se ha enviado. Te responderé a ${correo}.`, "ok");
        form.reset();
      } else {
        mostrarMensaje("No se pudo enviar. Revisa tu conexión.", "error");
      }
    } catch {
      mostrarMensaje("Error al enviar. Inténtalo otra vez.", "error");
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });
}
function mostrarMensaje(texto, tipo) {
  if (!mensajeFormulario) return;

  mensajeFormulario.textContent = texto;
  mensajeFormulario.className = `form-feedback ${tipo}`;
  mensajeFormulario.hidden = false;

  clearTimeout(mensajeFormulario.timeout);
  mensajeFormulario.timeout = setTimeout(() => {
    mensajeFormulario.hidden = true;
  }, 8000);
}

/* ==========================================================================
   4. MÁQUINA DE ESCRIBIR LETRA A LETRA (bucle)
   ========================================================================== */

(function () {
  const el = document.getElementById("nombre");
  if (!el) return;
  const texto = "Alex Baicu";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = texto;
    return;
  }
  let i = 0, dir = 1;
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

/* ==========================================================================
   5. DINOSAURIO: CARRERA + SALTO + NAVEGACIÓN
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
      if (animando) return;
      animando = true;

      const destino = agujero.getAttribute("href");

      agujeros.forEach((a) => a.classList.remove("activo"));
      agujero.classList.add("activo");

      const rect = agujero.getBoundingClientRect();
      const pistaRect = pista.getBoundingClientRect();

      const destinoX = rect.left - pistaRect.left + rect.width / 2 - dino.offsetWidth / 2;

      const dinoRect = dino.getBoundingClientRect();
      const inicioX = dinoRect.left - pistaRect.left;

      const distancia = Math.abs(destinoX - inicioX);
      const tiempoCarrera = Math.min(Math.max(distancia * 2.2, 500), 1500);

      dino.style.setProperty("--tiempo-carrera", `${tiempoCarrera}ms`);
      dino.style.setProperty("--destino-x", `${destinoX}px`);

      dino.classList.add("corriendo");

      setTimeout(() => {
        dino.classList.remove("corriendo");
        dino.classList.add("saltando");

        setTimeout(() => {
          dino.classList.remove("saltando");

          setTimeout(() => {
            if (destino.startsWith("#")) {
              const elemento = document.querySelector(destino);
              if (elemento) {
                elemento.scrollIntoView({ behavior: "smooth" });
              }
            } else {
              window.location.href = destino;
            }
          }, 150);
        }, 500);
      }, tiempoCarrera);
    });
  });
})();
