const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const revealElements = document.querySelectorAll(".reveal");
const galleryThumbs = Array.from(document.querySelectorAll(".wm-thumb"));
const galleryFilters = Array.from(document.querySelectorAll(".wm-filter"));
const galleryMainTrigger = document.querySelector("#gallery-main-trigger");
const galleryMainImage = document.querySelector("#gallery-main-image");
const galleryCounter = document.querySelector("#gallery-counter");
const galleryPrev = document.querySelector("#gallery-prev");
const galleryNext = document.querySelector("#gallery-next");
const lightbox = document.querySelector("#lightbox");
const lightboxPrev = document.querySelector("#lightbox-prev");
const lightboxNext = document.querySelector("#lightbox-next");
const lightboxImage = lightbox?.querySelector(".lightbox__image");
const lightboxClose = lightbox?.querySelector(".lightbox__close");

let currentFilter = "all";
let visibleThumbs = [];
let activeThumb = null;

scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const targetSelector = button.getAttribute("data-scroll-target");
        const target = targetSelector ? document.querySelector(targetSelector) : null;

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
});

revealElements.forEach((element) => revealObserver.observe(element));

const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImage) {
        return;
    }

    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
    if (!lightbox || !lightboxImage) {
        return;
    }

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.style.overflow = "";
};

const updateCounter = () => {
    if (!galleryCounter || !activeThumb || visibleThumbs.length === 0) {
        return;
    }

    const categoryLabel = {
        all: "Todas",
        externa: "Externa",
        interna: "Interna",
        mecanica: "Mecânica"
    };

    const index = visibleThumbs.indexOf(activeThumb) + 1;
    galleryCounter.textContent = `${index}/${visibleThumbs.length} · ${categoryLabel[currentFilter] || "Todas"}`;
};

const activateThumb = (thumb, shouldScroll = true) => {
    if (!thumb || !galleryMainImage) {
        return;
    }

    const image = thumb.getAttribute("data-image");
    const alt = thumb.getAttribute("data-alt") || "Imagem do Volkswagen Golf MK3";

    if (!image) {
        return;
    }

    galleryMainImage.src = image;
    galleryMainImage.alt = alt;

    galleryThumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
    activeThumb = thumb;

    if (lightbox?.classList.contains("is-open") && lightboxImage) {
        lightboxImage.src = image;
        lightboxImage.alt = alt;
    }

    if (shouldScroll) {
        thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    updateCounter();
};

const applyFilter = (filter) => {
    currentFilter = filter;

    galleryFilters.forEach((button) => {
        const isCurrent = button.getAttribute("data-gallery-filter") === filter;
        button.classList.toggle("is-active", isCurrent);
        button.setAttribute("aria-selected", String(isCurrent));
    });

    visibleThumbs = galleryThumbs.filter((thumb) => {
        const category = thumb.getAttribute("data-category") || "externa";
        const shouldShow = filter === "all" || category === filter;
        thumb.classList.toggle("is-hidden", !shouldShow);
        return shouldShow;
    });

    if (visibleThumbs.length === 0) {
        return;
    }

    if (!activeThumb || !visibleThumbs.includes(activeThumb)) {
        activateThumb(visibleThumbs[0], false);
    } else {
        updateCounter();
    }
};

const navigateGallery = (direction) => {
    if (!activeThumb || visibleThumbs.length === 0) {
        return;
    }

    const currentIndex = visibleThumbs.indexOf(activeThumb);
    const nextIndex = (currentIndex + direction + visibleThumbs.length) % visibleThumbs.length;
    activateThumb(visibleThumbs[nextIndex]);
};

if (galleryMainTrigger && galleryMainImage) {
    galleryMainTrigger.addEventListener("click", () => {
        openLightbox(galleryMainImage.src, galleryMainImage.alt || "Imagem ampliada do veiculo");
    });
}

galleryThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
        activateThumb(thumb);
    });
});

galleryFilters.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.getAttribute("data-gallery-filter") || "all";
        applyFilter(filter);
    });
});

galleryPrev?.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateGallery(-1);
});

galleryNext?.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateGallery(1);
});

lightboxPrev?.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateGallery(-1);
});

lightboxNext?.addEventListener("click", (event) => {
    event.stopPropagation();
    navigateGallery(1);
});

activeThumb = galleryThumbs.find((thumb) => thumb.classList.contains("is-active")) || galleryThumbs[0] || null;
applyFilter("all");

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        navigateGallery(event.key === "ArrowLeft" ? -1 : 1);
    }

    if (event.key === "Escape" && lightbox?.classList.contains("is-open")) {
        closeLightbox();
    }
});