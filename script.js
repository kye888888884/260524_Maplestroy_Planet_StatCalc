function getVal(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}

function formatStatInputValue(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

function updateStatSumLabels() {
    const basePri = getVal('basePri');
    const addPri = getVal('addPri');
    const baseSec = getVal('baseSec');
    const addSec = getVal('addSec');

    const priLabel = document.getElementById('priStatSumDisplay');
    const secLabel = document.getElementById('secStatSumDisplay');
    if (priLabel) {
        priLabel.textContent = formatStatInputValue(basePri + addPri);
    }
    if (secLabel) {
        secLabel.textContent = formatStatInputValue(baseSec + addSec);
    }
}

function safeDiv(numerator, denominator) {
    if (denominator === 0) {
        return 0;
    }
    return numerator / denominator;
}

const FORM_COOKIE_KEY = 'maplePlanetStatCalcInputs';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const allInputs = document.querySelectorAll('input, select'); // 계산/저장 대상 입력 요소

function saveFormToCookie() {
    const formData = {};
    allInputs.forEach((el) => {
        if (el.id) {
            formData[el.id] = el.value;
        }
    });

    document.cookie = `${FORM_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(formData))}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax`;
}

function loadFormFromCookie() {
    const cookieEntry = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${FORM_COOKIE_KEY}=`));

    if (!cookieEntry) {
        return;
    }

    const encodedValue = cookieEntry.substring(`${FORM_COOKIE_KEY}=`.length);
    try {
        const formData = JSON.parse(decodeURIComponent(encodedValue));
        allInputs.forEach((el) => {
            if (el.id && Object.prototype.hasOwnProperty.call(formData, el.id)) {
                el.value = formData[el.id];
            }
        });
    } catch (error) {
        console.warn('저장된 입력값 쿠키를 읽는 중 오류가 발생했습니다.', error);
    }
}

function toggleSkillInput() {
    const isMage = document.getElementById('jobSelect').value === 'mage'; // 선택된 직업이 마법사인지 여부
    const weaponAtkInput = document.getElementById('currentWeaponAtk');
    document.getElementById('skillPctRow').style.display = isMage ? 'none' : 'flex';
    document.getElementById('mageSkillRow').style.display = isMage ? 'flex' : 'none';
    weaponAtkInput.readOnly = isMage;
}

function calculate() {
    updateStatSumLabels();

    const job = document.getElementById('jobSelect').value; // 직업 선택값(배율 숫자 또는 mage)
    const isMage = job === 'mage'; // 마법사 분기 판단값

    const skillMultiplier = getVal('skillPct') / 100; // 비마법사 스킬 배율(소수)
    const mageSkillBase = getVal('mageSkillBase'); // 마법사 스킬 기본 공격력(정수)
    const weaponAtkPct = getVal('weaponAtkPct') / 100; // 무기 공격력 % (소수)
    const weaponMatkPct = getVal('weaponMatkPct') / 100; // 무기 마력 % (소수)
    const basePriPct = getVal('basePriPct') / 100; // 기본 스탯 창 주스탯 % (소수)
    const baseSecPct = getVal('baseSecPct') / 100; // 기본 스탯 창 부스탯 % (소수)
    const totalDamagePct = getVal('totalDamagePct') / 100; // 총데미지 % (소수)
    const bossDamagePct = getVal('bossDamagePct') / 100; // 보스데미지 % (소수)

    const basePriLeft = getVal('basePri'); // 주스탯 좌항(순수 스탯)
    const basePriRight = getVal('addPri'); // 주스탯 우항(추가 스탯)
    const baseSecLeft = getVal('baseSec'); // 부스탯 좌항(순수 스탯)
    const baseSecRight = getVal('addSec'); // 부스탯 우항(추가 스탯)
    const bPri = basePriLeft + basePriRight; // 현재 총 주스탯
    const bSec = baseSecLeft + baseSecRight; // 현재 총 부스탯
    let wAtk = getVal('currentWeaponAtk'); // 순수 무기 공/마

    const skong = getVal('currentSkong'); // 표기 공격력
    const magic = getVal('currentMagic'); // 표기 총마력

    const cPri = getVal('cPri'); // 현재 장비 주스탯 고정옵
    const cSec = getVal('cSec'); // 현재 장비 부스탯 고정옵
    const cAtk = getVal('cAtk'); // 현재 장비 공격력 고정옵
    const cMatk = getVal('cMatk'); // 현재 장비 마력 고정옵
    const cPriPct = getVal('cPriPct') / 100; // 현재 장비 주스탯 % (소수)
    const cSecPct = getVal('cSecPct') / 100; // 현재 장비 부스탯 % (소수)
    const cAtkPct = getVal('cAtkPct') / 100; // 현재 장비 공격력 % (소수)
    const cMatkPct = getVal('cMatkPct') / 100; // 현재 장비 마력 % (소수)
    const cTotalDmgPct = getVal('cTotalDmgPct') / 100; // 현재 장비 총데미지 % (소수)
    const cBossDmgPct = getVal('cBossDmgPct') / 100; // 현재 장비 보스데미지 % (소수)

    const nPri = getVal('nPri'); // 새 장비 주스탯 고정옵
    const nSec = getVal('nSec'); // 새 장비 부스탯 고정옵
    const nAtk = getVal('nAtk'); // 새 장비 공격력 고정옵
    const nMatk = getVal('nMatk'); // 새 장비 마력 고정옵
    const nPriPct = getVal('nPriPct') / 100; // 새 장비 주스탯 % (소수)
    const nSecPct = getVal('nSecPct') / 100; // 새 장비 부스탯 % (소수)
    const nAtkPct = getVal('nAtkPct') / 100; // 새 장비 공격력 % (소수)
    const nMatkPct = getVal('nMatkPct') / 100; // 새 장비 마력 % (소수)
    const nTotalDmgPct = getVal('nTotalDmgPct') / 100; // 새 장비 총데미지 % (소수)
    const nBossDmgPct = getVal('nBossDmgPct') / 100; // 새 장비 보스데미지 % (소수)
    const oldFinalDamageMultiplier = 1 + totalDamagePct + bossDamagePct; // 기존 데미지: 상단 기본 총뎀/보뎀만 반영
    const newFinalDamageMultiplier = 1 + totalDamagePct + bossDamagePct + (nTotalDmgPct - cTotalDmgPct) + (nBossDmgPct - cBossDmgPct); // 신규 데미지: 장비 변화량만 반영

    if (isMage) {
        wAtk = magic - bPri; // magic = bPri + wAtk (wAtk는 장비 스탯과 분리)
        document.getElementById('currentWeaponAtk').value = wAtk.toFixed(2).replace(/\.00$/, '');
    }

    let oldDamage = 0;
    let newDamage = 0;
    let newPriValue = '-';
    let newSecValue = '-';
    let newMagicValue = '-';

    const currentPriEquipStat = safeDiv(basePriRight, 1 + basePriPct) - basePriLeft; // 우항 = (좌항+장비스탯)*(1+스탯%)에서 현재 장비스탯 역산
    const currentSecEquipStat = safeDiv(baseSecRight, 1 + baseSecPct) - baseSecLeft; // 우항 = (좌항+장비스탯)*(1+스탯%)에서 현재 장비스탯 역산
    const newPriEquipStat = currentPriEquipStat + (nPri - cPri); // 새로운 장비스탯 = 장비스탯 + (새로운장비스탯-현재장비스탯)
    const newSecEquipStat = currentSecEquipStat + (nSec - cSec); // 새로운 장비스탯 = 장비스탯 + (새로운장비스탯-현재장비스탯)
    const newPriPctTotal = basePriPct + (nPriPct - cPriPct); // 새로운 스탯% = 스탯% + (새로운 장비 스탯%-현재 장비 스탯%)
    const newSecPctTotal = baseSecPct + (nSecPct - cSecPct); // 새로운 스탯% = 스탯% + (새로운 장비 스탯%-현재 장비 스탯%)
    const calculatedNewPriRight = (basePriLeft + newPriEquipStat) * (1 + newPriPctTotal); // 새로운 우항
    const calculatedNewSecRight = (baseSecLeft + newSecEquipStat) * (1 + newSecPctTotal); // 새로운 우항
    const calculatedNewPri = basePriLeft + calculatedNewPriRight; // 새로운 스탯합 = 좌항 + 새로운 우항
    const calculatedNewSec = baseSecLeft + calculatedNewSecRight; // 새로운 스탯합 = 좌항 + 새로운 우항
    newPriValue = formatNumber(Math.floor(calculatedNewPri));
    newSecValue = formatNumber(Math.floor(calculatedNewSec));

    if (isMage) {
        oldDamage = Math.floor(((Math.floor((Math.pow(magic, 2) / 1000) + magic) / 30) + (bPri / 20)) * mageSkillBase);

        const corePri = safeDiv(bPri, 1 + basePriPct + cPriPct) - cPri; // 현재 장비와 기본 주스탯%를 제거한 순수 주스탯
        const newTotalPri = (corePri + nPri) * (1 + basePriPct + nPriPct); // 새 장비 + 기본 주스탯% 적용 후 주스탯
        const baseMagicWithoutWeaponPct = safeDiv(magic, 1 + weaponMatkPct); // 무기 마력% 제거한 기준 마력
        const magicBaseWithNewPri = baseMagicWithoutWeaponPct + (newTotalPri - bPri); // 기존 주스탯 대신 새로운 주스탯 반영
        const newTotalMagic = (magicBaseWithNewPri + (nMatk - cMatk)) * (1 + nMatkPct - cMatkPct); // 주스탯/합마력 변화량과 장비 마력% 변화량 적용
        newMagicValue = formatNumber(Math.floor(newTotalMagic));
        newDamage = Math.floor(((Math.floor((Math.pow(newTotalMagic, 2) / 1000) + newTotalMagic) / 30) + (newTotalPri / 20)) * mageSkillBase);
    } else {
        oldDamage = Math.floor(skong * skillMultiplier); // 최종데미지 = 표기공격력 * 스킬배율

        const corePri = (bPri / (1 + basePriPct + cPriPct)) - cPri; // 현재 장비 + 기본 주스탯% 제거 후 순수 주스탯
        const coreSec = (bSec / (1 + baseSecPct + cSecPct)) - cSec; // 현재 장비 + 기본 부스탯% 제거 후 순수 부스탯
        const newTotalPri = (corePri + nPri) * (1 + basePriPct + nPriPct); // 새 장비 + 기본 주스탯% 적용 주스탯
        const newTotalSec = (coreSec + nSec) * (1 + baseSecPct + nSecPct); // 새 장비 + 기본 부스탯% 적용 부스탯

        const statFactorCurrent = (4 * bPri) + bSec; // 현재 스탯 계수(4*주스탯 + 부스탯)
        const weaponAtkBase = wAtk * (1 + weaponAtkPct); // 무기 공% 반영된 기본 무기 공격력
        const currentTotalAtk = (weaponAtkBase + cAtk) * (1 + cAtkPct); // 현재 장비 기준 총 공격력
        const weaponMultiplier = safeDiv(skong, statFactorCurrent * currentTotalAtk * 0.01); // skong = (4*주+부)*공*무기배율*0.01 에서 무기배율 역산

        const newTotalAtk = (weaponAtkBase + nAtk) * (1 + nAtkPct); // 새 장비 적용 총 공격력
        const newSkong = ((4 * newTotalPri) + newTotalSec) * newTotalAtk * weaponMultiplier * 0.01; // 새 표기 공격력

        newDamage = Math.floor(newSkong * skillMultiplier); // 최종데미지 = 새 표기공격력 * 스킬배율
    }

    oldDamage = Math.floor(oldDamage * oldFinalDamageMultiplier); // 기본 총뎀/보뎀 반영
    newDamage = Math.floor(newDamage * newFinalDamageMultiplier); // 기본 + 장비 변화량 총뎀/보뎀 반영

    const diffDamage = newDamage - oldDamage; // 절대 데미지 차이
    const diffPct = oldDamage === 0 ? 0 : (diffDamage / oldDamage) * 100; // 퍼센트 증가량
    const sign = diffDamage >= 0 ? '+' : '-'; // 절대값 표기 부호
    const pctSign = diffPct >= 0 ? '+' : ''; // 퍼센트 표기 부호

    document.getElementById('oldDmg').textContent = formatNumber(oldDamage);
    document.getElementById('newDmg').textContent = formatNumber(newDamage);
    document.getElementById('diffDmg').textContent = `${sign} ${formatNumber(Math.abs(diffDamage))} (${pctSign}${diffPct.toFixed(2)}%)`;
    document.getElementById('newPriValue').textContent = newPriValue;
    document.getElementById('newSecValue').textContent = newSecValue;
    document.getElementById('newMagicValue').textContent = newMagicValue;
}

allInputs.forEach((el) => {
    el.addEventListener('input', () => {
        if (el.id === 'jobSelect') {
            toggleSkillInput();
        }
        calculate();
        saveFormToCookie();
    });
    el.addEventListener('change', () => {
        if (el.id === 'jobSelect') {
            toggleSkillInput();
        }
        calculate();
        saveFormToCookie();
    });
});

loadFormFromCookie();
toggleSkillInput();
calculate();
saveFormToCookie();
