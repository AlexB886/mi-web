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

if (!res.ok) {
  throw new Error("Error HTTP al enviar el formulario");
}

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

})();


 /* ==========================================================================
   5. DINOSAURIO: CARRERA + POLVO + SALTO + NAVEGACIÓN
   ========================================================================== */

(function () {

  const dino = document.querySelector(".dino");
  const efectoDino = document.querySelector(".efecto-dino");
  const agujeros = document.querySelectorAll(".agujero");

  if (!dino || !efectoDino || !agujeros.length) return;

  let animando = false;

  agujeros.forEach((agujero) => {

    agujero.addEventListener("click", (e) => {

      e.preventDefault();

      if (animando) return;

      animando = true;

      const destino = agujero.getAttribute("href");

      /* --------------------------------------------------------------
         BOTÓN DESTINO
         -------------------------------------------------------------- */

      agujeros.forEach((a) => {
        a.classList.remove("activo");
      });

      agujero.classList.add("activo");


      /* --------------------------------------------------------------
         CALCULAR POSICIONES
         -------------------------------------------------------------- */

      const rectAgujero =
        agujero.getBoundingClientRect();

      const rectEfecto =
        efectoDino.getBoundingClientRect();

      const rectDino =
        dino.getBoundingClientRect();


      /* Centro exacto del botón */

      const centroAgujero =
        rectAgujero.left +
        rectAgujero.width / 2;


      /* Posición que debe alcanzar el dinosaurio */

      const destinoX =
        centroAgujero -
        rectEfecto.left -
        rectDino.width / 2;


      /* Posición actual */

      const inicioX =
        rectDino.left -
        rectEfecto.left;


      const distancia =
        Math.abs(destinoX - inicioX);


      /* --------------------------------------------------------------
         DIRECCIÓN
         -------------------------------------------------------------- */

      const vaIzquierda =
        destinoX < inicioX;


      efectoDino.style.setProperty(
        "--flip",
        vaIzquierda ? "-1" : "1"
      );


      /*
       * El polvo aparece detrás del dinosaurio.
       */

      efectoDino.style.setProperty(
        "--dust-direction",
        vaIzquierda ? "1" : "-1"
      );


      /* --------------------------------------------------------------
         VELOCIDAD
         -------------------------------------------------------------- */

      const tiempoCarrera =
        Math.min(
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


      /* --------------------------------------------------------------
         CARRERA
         -------------------------------------------------------------- */

      efectoDino.classList.add("corriendo");
      dino.classList.add("corriendo");


      /* --------------------------------------------------------------
         CUANDO TERMINA LA CARRERA
         -------------------------------------------------------------- */

      setTimeout(() => {

        /*
         * Fijamos al dinosaurio exactamente donde ha llegado.
         * Así no vuelve al principio al quitar la animación.
         */

        efectoDino.style.transform =
          `translateX(${destinoX}px)`;


        efectoDino.classList.remove("corriendo");
        dino.classList.remove("corriendo");


        /* ----------------------------------------------------------
           SALTO
           ---------------------------------------------------------- */

        dino.classList.add("saltando");


        setTimeout(() => {

          dino.classList.remove("saltando");


          /* --------------------------------------------------------
             ENTRADA EN EL BOTÓN
             -------------------------------------------------------- */

          dino.classList.add("entrando");


          setTimeout(() => {

            dino.classList.remove("entrando");


            /* ------------------------------------------------------
               CAMBIAR DE PÁGINA
               ------------------------------------------------------ */

            window.location.href = destino;

          }, 350);

        }, 650);

      }, tiempoCarrera);

    });

  });

})();/* ==========================================================================
   6. FILTRO DE PROYECTOS
   ========================================================================== */

(function () {

  const filtros = document.querySelectorAll(".filtro-proyecto");
  const proyectos = document.querySelectorAll(".proyecto");

  if (!filtros.length || !proyectos.length) return;


  filtros.forEach((filtro) => {

    filtro.addEventListener("click", () => {

      const categoria =
        filtro.getAttribute("data-filter");


      /* BOTÓN ACTIVO */

      filtros.forEach((boton) => {

        boton.classList.remove("activo");
        boton.setAttribute("aria-pressed", "false");

      });

      filtro.classList.add("activo");
      filtro.setAttribute("aria-pressed", "true");


      /* MOSTRAR / OCULTAR PROYECTOS */

      proyectos.forEach((proyecto) => {

        const categorias =
          proyecto.getAttribute("data-categories").split(" ");


        const mostrar =
          categoria === "todos" ||
          categorias.includes(categoria);


        if (mostrar) {
          proyecto.classList.remove("oculto");
        } else {
          proyecto.classList.add("oculto");
        }

      });

    });

  });

})();/* =========================================
  /* =========================================
  COOKIES Y PREFERENCIAS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const banner = document.getElementById("cookieBanner");

  if (!banner) return;

  const accept = document.getElementById("cookieAccept");
  const reject = document.getElementById("cookieReject");
  const settings = document.getElementById("cookieSettings");
  const footerSettings = document.getElementById("cookieSettingsBtn");

  const COOKIE_KEY = "alexbaicu_cookie_consent";
  const PREFERENCES_KEY = "alexbaicu_cookie_preferences";

  /* ---------------------------------------------------------
     CREAR PANEL DE CONFIGURACIÓN
     --------------------------------------------------------- */

  const contenido = banner.querySelector(".cookie-content");

  if (!contenido) return;

  const panel = document.createElement("div");

  panel.className = "cookie-preferences";

  panel.innerHTML = `
    <div class="cookie-preferences-box">

      <h3>⚙️ Configurar cookies</h3>

      <p>
        Puedes elegir qué preferencias quieres guardar.
        Las opciones necesarias para el funcionamiento básico
        del sitio no se pueden desactivar.
      </p>

      <div class="cookie-option">

        <div>
          <strong>Cookies necesarias</strong>

          <span>
            Necesarias para el funcionamiento básico del sitio web.
          </span>
        </div>

        <label class="cookie-switch">
          <input
            type="checkbox"
            checked
            disabled
          >
          <span class="cookie-slider"></span>
        </label>

      </div>


      <div class="cookie-option">

        <div>
          <strong>Preferencias</strong>

          <span>
            Permiten recordar opciones como el modo claro u oscuro.
          </span>
        </div>

        <label class="cookie-switch">

          <input
            type="checkbox"
            id="cookiePreferences"
          >

          <span class="cookie-slider"></span>

        </label>

      </div>


      <div class="cookie-preferences-actions">

        <button
          id="cookieSavePreferences"
          type="button"
          class="button"
        >
          Guardar preferencias
        </button>

      </div>

    </div>
  `;

  contenido.appendChild(panel);

  const preferencesCheckbox =
    document.getElementById("cookiePreferences");

  const savePreferences =
    document.getElementById("cookieSavePreferences");


  /* ---------------------------------------------------------
     FUNCIONES
     --------------------------------------------------------- */

  function mostrarBanner() {
    banner.classList.add("is-visible");
  }


  function ocultarBanner() {
    banner.classList.remove("is-visible");
    panel.classList.remove("is-visible");
  }


  function mostrarConfiguracion() {

    banner.classList.add("is-visible");

    panel.classList.add("is-visible");

    const guardadas =
      JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}");

    preferencesCheckbox.checked =
      guardadas.preferencias === true;

  }


  function guardarPreferencia(valor) {

    localStorage.setItem(COOKIE_KEY, valor);

    ocultarBanner();

  }


  /* ---------------------------------------------------------
     CARGAR PREFERENCIAS
     --------------------------------------------------------- */

  const preferenciasGuardadas =
    JSON.parse(
      localStorage.getItem(PREFERENCES_KEY) || "{}"
    );

  preferencesCheckbox.checked =
    preferenciasGuardadas.preferencias === true;


  /* ---------------------------------------------------------
     MOSTRAR BANNER LA PRIMERA VEZ
     --------------------------------------------------------- */

  if (!localStorage.getItem(COOKIE_KEY)) {

    setTimeout(() => {

      mostrarBanner();

    }, 700);

  }


  /* ---------------------------------------------------------
     ACEPTAR
     --------------------------------------------------------- */

  accept?.addEventListener("click", () => {

    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        preferencias: true
      })
    );

    guardarPreferencia("accepted");

  });


  /* ---------------------------------------------------------
     RECHAZAR
     --------------------------------------------------------- */

  reject?.addEventListener("click", () => {

    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        preferencias: false
      })
    );

    guardarPreferencia("rejected");

  });


  /* ---------------------------------------------------------
     CONFIGURAR
     --------------------------------------------------------- */

  settings?.addEventListener("click", () => {

    mostrarConfiguracion();

  });


  /* ---------------------------------------------------------
     CONFIGURAR DESDE EL FOOTER
     --------------------------------------------------------- */

  footerSettings?.addEventListener("click", () => {

    mostrarConfiguracion();

  });


  /* ---------------------------------------------------------
     GUARDAR CONFIGURACIÓN
     --------------------------------------------------------- */

  savePreferences?.addEventListener("click", () => {

    const preferencias =
      preferencesCheckbox.checked;

    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        preferencias: preferencias
      })
    );

    localStorage.setItem(
      COOKIE_KEY,
      preferencias
        ? "custom"
        : "rejected"
    );

    ocultarBanner();

  });

});

;/* =========================================================
   TARJETAS 3D — ME GUSTA
   ========================================================= */

document.querySelectorAll(".gusto-card").forEach((card) => {

  function girarTarjeta() {
    card.classList.toggle("girada");
  }

  card.addEventListener("click", girarTarjeta);

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      girarTarjeta();
    }
  });

});