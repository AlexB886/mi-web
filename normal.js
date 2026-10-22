
document.addEventListener("DOMContentLoaded", () => {
  // 1. Animaciones al entrar las secciones en pantalla
  const elements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));
  } else {
    elements.forEach((element) => element.classList.add("is-visible"));
  }

 
  // 2. Modo claro y oscuro
  const themeButton = document.querySelector("#themeToggle");

  if (themeButton) {
    const savedTheme = localStorage.getItem("normal-theme") || "dark";

    document.body.classList.toggle("light-mode", savedTheme === "light");

    const updateThemeButton = () => {
      const isLight = document.body.classList.contains("light-mode");
      themeButton.textContent = isLight ? "☾" : "☼";
      themeButton.setAttribute(
        "aria-label",
        isLight ? "Activar modo oscuro" : "Activar modo claro"
      );
      themeButton.setAttribute("title", isLight ? "Modo oscuro" : "Modo claro");
    };

    updateThemeButton();

    themeButton.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("normal-theme", isLight ? "light" : "dark");
      updateThemeButton();
    });
  }


  // 3. Año actual en el pie de página
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // 4. Navegación: resaltar la sección visible
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            if (active) {
              link.classList.add("active");
              link.setAttribute("aria-current", "location");
            } else {
              link.classList.remove("active");
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }
  
  // 5. Noticias reales desde la API de Cloudflare
  const newsGrid = document.getElementById("newsGrid");
  const newsStatus = document.getElementById("newsStatus");

  if (newsGrid) {
    const NEWS_API = "https://alex-noticias-api.baicualex88.workers.dev/noticias";

    const escapeHTML = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);

    const formatDate = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";

      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(date);
    };

    async function loadNews() {
      if (newsStatus) newsStatus.textContent = "Cargando últimas noticias…";

      try {
        const response = await fetch(NEWS_API);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();

const articles = Array.isArray(data)
  ? data
  : data.articles || data.noticias || [];

        if (!articles.length) {
          throw new Error("La API no ha devuelto artículos.");
        }

        const get = (article, keys) => {
          for (const key of keys) {
            if (article[key] != null && article[key] !== "") {
              return article[key];
            }
          }
          return "";
        };

       
const normalized = articles
  .map((article) => ({
    title: get(article, ["title", "titulo", "headline"]),
    description: get(article, ["description", "descripcion", "summary", "resumen"]),
    url: get(article, ["url", "link", "urlToArticle"]),
    image: get(article, ["image", "image_url", "urlToImage", "imagen", "thumbnail"]),
    source: typeof article.source === "object"
      ? get(article.source, ["name"])
      : article.source || article.fuente || article.publisher || "",
    date: get(article, ["publishedAt", "published_at", "fecha", "date"])
  }))
  .filter((article) => article.title && article.url)
  .filter((article, index, array) => {
    const normalizeTitle = (title) =>
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return (
      array.findIndex(
        (other) => normalizeTitle(other.title) === normalizeTitle(article.title)
      ) === index
    );
  });

if (!normalized.length) {
  throw new Error("No se encontraron noticias con título y enlace.");
}

const [featured, ...others] = normalized;

        const renderNews = (article, featured = false) => `
          <article class="news-card ${featured ? "news-card-featured" : "news-card-small"}">
            ${article.image ? `
              <a class="news-image-link" href="${escapeHTML(article.url)}"
                 target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
                <img src="${escapeHTML(article.image)}"
                     alt="" loading="lazy">
              </a>` : ""}
            <div class="news-card-content">
              <div class="news-meta">
                ${article.source ? `<span>${escapeHTML(article.source)}</span>` : ""}
                ${article.date ? `<time>${escapeHTML(formatDate(article.date))}</time>` : ""}
              </div>
              <h3>
                <a href="${escapeHTML(article.url)}"
                   target="_blank" rel="noopener noreferrer">
                  ${escapeHTML(article.title)}
                </a>
              </h3>
              ${article.description ? `
                <p>${escapeHTML(article.description)}</p>` : ""}
              <a class="text-link" href="${escapeHTML(article.url)}"
                 target="_blank" rel="noopener noreferrer">
                Leer noticia <span>↗</span>
              </a>
            </div>
          </article>`;

       
const filterButtons = document.querySelectorAll(".news-filter");
let categoriaActiva = "todas";

function obtenerCategorias(article) {
  const texto = `${article.title} ${article.description} ${article.source}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const categorias = [];

  if (
    /tecnologia|innovacion|robot|robotica|movil|smartphone|ordenador|hardware|software|chip|autonomo/.test(texto)
  ) {
    categorias.push("tecnologia");
  }

  if (
    /\bia\b|inteligencia artificial|machine learning|deep learning|chatgpt|openai|modelo de lenguaje|red neuronal/.test(texto)
  ) {
    categorias.push("ia");
  }

  if (
    /programacion|programador|desarrollo de software|javascript|typescript|python|java\b|github|codigo fuente|framework|base de datos/.test(texto)
  ) {
    categorias.push("programacion");
  }

  if (
    /ciberseguridad|hacker|hackeo|ransomware|malware|phishing|vulnerabilidad|ciberataque|filtracion de datos|contraseña|seguridad informatica/.test(texto)
  ) {
    categorias.push("ciberseguridad");
  }

  return categorias;
}

function mostrarNoticias(categoria) {
  categoriaActiva = categoria;

  const filtradas = categoria === "todas"
    ? normalized
    : normalized.filter((article) =>
        obtenerCategorias(article).includes(categoria)
      );

  filterButtons.forEach((button) => {
    const activo = button.dataset.category === categoria;
    button.classList.toggle("active", activo);
    button.setAttribute("aria-pressed", String(activo));
  });

  if (!filtradas.length) {
    newsGrid.innerHTML = `
      <p class="news-empty">
        No hay noticias disponibles en esta categoría.
        Prueba con otra.
      </p>`;
  } else {
    const [destacada, ...resto] = filtradas;

    newsGrid.innerHTML =
      renderNews(destacada, true) +
      resto.map((article) => renderNews(article)).join("");
  }

  if (newsStatus) {
    newsStatus.textContent =
      `Últimas noticias · ${filtradas.length} artículos`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mostrarNoticias(button.dataset.category);
  });
});

mostrarNoticias("todas");

        
      } catch (error) {
        console.error("No se pudieron cargar las noticias:", error);

        if (newsStatus) {
          newsStatus.textContent =
            "No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.";
        }
      }
    }

    loadNews();
  }

});
