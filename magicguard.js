function getNumberValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

const MAGIC_GUARD_COOKIE_KEY = "maplePlanetMagicGuardInputs";
const MAGIC_GUARD_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const MAGIC_GUARD_ABSORB_RATES = [
    { level: 1, rate: 0.11 },
    { level: 2, rate: 0.14 },
    { level: 3, rate: 0.17 },
    { level: 4, rate: 0.20 },
    { level: 5, rate: 0.23 },
    { level: 6, rate: 0.30 },
    { level: 7, rate: 0.33 },
    { level: 8, rate: 0.36 },
    { level: 9, rate: 0.39 },
    { level: 10, rate: 0.42 },
    { level: 11, rate: 0.45 },
    { level: 12, rate: 0.48 },
    { level: 13, rate: 0.51 },
    { level: 14, rate: 0.54 },
    { level: 15, rate: 0.57 },
    { level: 16, rate: 0.64 },
    { level: 17, rate: 0.68 },
    { level: 18, rate: 0.72 },
    { level: 19, rate: 0.76 },
    { level: 20, rate: 0.80 }
];

function renderMagicGuardResult() {
    const monsterDamage = getNumberValue("monsterDamage");
    const baseHp = getNumberValue("baseHp");
    const hasHyperBody = document.getElementById("hasHyperBody").checked;

    const requiredLevelElement = document.getElementById("requiredMagicGuardLevel");
    const incomingDamageElement = document.getElementById("incomingDamage");

    if (monsterDamage <= 0 || baseHp <= 0) {
        requiredLevelElement.textContent = "-";
        incomingDamageElement.textContent = "-";
        return;
    }

    const actualHp = baseHp * (hasHyperBody ? 1.4 : 1.0);
    const requiredLevelData = MAGIC_GUARD_ABSORB_RATES.find((entry) => {
        const incomingDamage = monsterDamage * (1 - entry.rate);
        return actualHp >= incomingDamage;
    });

    if (!requiredLevelData) {
        requiredLevelElement.textContent = "HP 부족";
        const level20IncomingDamage = monsterDamage * (1 - MAGIC_GUARD_ABSORB_RATES[MAGIC_GUARD_ABSORB_RATES.length - 1].rate);
        incomingDamageElement.textContent = Math.floor(level20IncomingDamage).toLocaleString("ko-KR");
        return;
    }

    const incomingDamage = monsterDamage * (1 - requiredLevelData.rate);
    requiredLevelElement.textContent = `Lv.${requiredLevelData.level}`;
    incomingDamageElement.textContent = Math.floor(incomingDamage).toLocaleString("ko-KR");
}

function saveMagicGuardInputsToCookie() {
    const payload = {
        monsterDamage: document.getElementById("monsterDamage").value,
        baseHp: document.getElementById("baseHp").value,
        hasHyperBody: document.getElementById("hasHyperBody").checked
    };

    document.cookie = `${MAGIC_GUARD_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(payload))}; max-age=${MAGIC_GUARD_COOKIE_MAX_AGE}; path=/; samesite=lax`;
}

function loadMagicGuardInputsFromCookie() {
    const cookieEntry = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${MAGIC_GUARD_COOKIE_KEY}=`));

    if (!cookieEntry) {
        return;
    }

    try {
        const encodedValue = cookieEntry.substring(`${MAGIC_GUARD_COOKIE_KEY}=`.length);
        const payload = JSON.parse(decodeURIComponent(encodedValue));

        if (Object.prototype.hasOwnProperty.call(payload, "monsterDamage")) {
            document.getElementById("monsterDamage").value = payload.monsterDamage;
        }
        if (Object.prototype.hasOwnProperty.call(payload, "baseHp")) {
            document.getElementById("baseHp").value = payload.baseHp;
        }
        if (Object.prototype.hasOwnProperty.call(payload, "hasHyperBody")) {
            document.getElementById("hasHyperBody").checked = Boolean(payload.hasHyperBody);
        }
    } catch (error) {
        console.warn("매직가드 입력값 쿠키를 읽는 중 오류가 발생했습니다.", error);
    }
}

const magicGuardInputs = document.querySelectorAll("#monsterDamage, #baseHp, #hasHyperBody");
magicGuardInputs.forEach((element) => {
    element.addEventListener("input", () => {
        renderMagicGuardResult();
        saveMagicGuardInputsToCookie();
    });
    element.addEventListener("change", () => {
        renderMagicGuardResult();
        saveMagicGuardInputsToCookie();
    });
});

loadMagicGuardInputsFromCookie();
renderMagicGuardResult();
saveMagicGuardInputsToCookie();
