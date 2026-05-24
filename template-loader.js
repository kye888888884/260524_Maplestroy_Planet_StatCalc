function getDefaultNavKey() {
    const path = window.location.pathname.toLowerCase();
    return path.endsWith("magicguard.html") ? "magicguard" : "equipment";
}

async function loadSharedTemplate(config = {}) {
    const mount = document.getElementById("shared-template");
    if (!mount) {
        return;
    }

    try {
        const response = await fetch("./template.html", { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`template load failed: ${response.status}`);
        }

        mount.innerHTML = await response.text();

        const titleRest = mount.querySelector("[data-template-title-rest]");
        if (titleRest && config.titleRest) {
            titleRest.textContent = config.titleRest;
        }

        const activeNav = config.activeNav || getDefaultNavKey();
        const navLinks = mount.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.navKey === activeNav);
        });
    } catch (error) {
        console.error("공통 템플릿 로드에 실패했습니다.", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadSharedTemplate(window.pageTemplateConfig || {});
});
