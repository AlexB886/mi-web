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
  const efectoDino = document.querySelector(".efecto-dino");
  const pista = document.querySelector(".pista");
  const agujeros = document.querySelectorAll(".agujero");

  if (!dino || !efectoDino || !pista || !agujeros.length) return;

  let animando = false;


  agujeros.forEach((agujero) => {

    agujero.addEventListener("click", (e) => {

      e.preventDefault();

      if (animando) return;

      animando = true;

      const destino = agujero.getAttribute("href");


      /* --------------------------------------------------------------------
         DESTINO
         -------------------------------------------------------------------- */

      agujeros.forEach((a) => {
        a.classList.remove("activo");
      });

      agujero.classList.add("activo");


      /* --------------------------------------------------------------------
         CALCULAR POSICIÓN DEL AGUJERO
         -------------------------------------------------------------------- */

      const rectAgujero = agujero.getBoundingClientRect();
      const rectDino = dino.getBoundingClientRect();
      const rectEfecto = efectoDino.getBoundingClientRect();


      /*
         El destino se calcula respecto al contenedor del dinosaurio.
         Así no se pasa de largo.
      */

      const centroAgujero =
        rectAgujero.left + rectAgujero.width / 2;

      const destinoX =
        centroAgujero -
        rectEfecto.left -
        dino.offsetWidth / 2;


      /* --------------------------------------------------------------------
         POSICIÓN ACTUAL
         -------------------------------------------------------------------- */

      const inicioX =
        rectDino.left -
        rectEfecto.left;


      const distancia =
        Math.abs(destinoX - inicioX);


      /* --------------------------------------------------------------------
         DIRECCIÓN
         -------------------------------------------------------------------- */

      const vaIzquierda =
        destinoX < inicioX;


      efectoDino.style.setProperty(
        "--flip",
        vaIzquierda ? "-1" : "1"
      );


      /*
         El polvo siempre sale detrás del dinosaurio.
      */

      efectoDino.style.setProperty(
        "--dust-direction",
        vaIzquierda ? "1" : "-1"
      );


      /* --------------------------------------------------------------------
         VELOCIDAD
         -------------------------------------------------------------------- */

      /*
         Más tiempo = dinosaurio más lento.
      */

      const tiempoCarrera = Math.min(
        Math.max(distancia * 3.8, 900),
        3000
      );


      efectoDino.style.setProperty(
        "--tiempo-carrera",
        `${tiempoCarrera}ms`
      );


      efectoDino.style.setProperty(
        "--destino-x",
        `${destinoX}px`
      );


      /* --------------------------------------------------------------------
         CARRERA
         -------------------------------------------------------------------- */

      efectoDino.classList.add("corriendo");
      dino.classList.add("corriendo");


      /* --------------------------------------------------------------------
         TERMINA LA CARRERA
         -------------------------------------------------------------------- */

      setTimeout(() => {

        /*
           Guardamos físicamente la posición alcanzada.
           Así el contenedor no vuelve al principio.
        */

        efectoDino.style.transform =
          `translateX(${destinoX}px)`;


        efectoDino.classList.remove("corriendo");
        dino.classList.remove("corriendo");


        /* ----------------------------------------------------------------
           SALTO
           ---------------------------------------------------------------- */

        dino.classList.add("saltando");


/* ----------------------------------------------------------------
   IMPACTO CONTRA EL SUELO
   ---------------------------------------------------------------- */

setTimeout(() => {

  efectoDino.classList.add("aterrizando");

}, 500);


setTimeout(() => {

  dino.classList.remove("saltando");
  efectoDino.classList.remove("aterrizando");

          /* --------------------------------------------------------------
             CAMBIO DE PÁGINA
             -------------------------------------------------------------- */

          setTimeout(() => {

            if (destino.startsWith("#")) {

              const elemento =
                document.querySelector(destino);

              if (elemento) {

                elemento.scrollIntoView({
                  behavior: "smooth"
                });

              }

              animando = false;

            } else {

              window.location.href = destino;

            }

          }, 150);

        }, 650);

      }, tiempoCarrera);

    });

  });

})();