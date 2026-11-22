import Chart from "chart.js/auto";
import { buildCurrenciesUrl, buildRateUrl, buildRatesUrl, findCurrency, getCurrencyName, getCurrencyOptionLabel } from "./rate-helper.js";
import { createHistoryItem, nextHistory } from "./next-history.js";

const inputJumlahElm = document.getElementById("jumlah");
const selectFromElm = document.getElementById("from");
const selectToElm = document.getElementById("to");

const loaderResult = document.getElementById("loaderResult");
const loaderGrafik = document.getElementById("loaderGrafik");

const resultContainer = document.getElementById("resultContainer");
const currencySymbolText = document.getElementById("currencySymbolText");

const btnChange = document.getElementById("btnChange");

const riwayatContainer = document.getElementById("riwayatContainer");
const btnRiwayat = document.querySelectorAll(".btnRiwayat");
const btnRemoveRiwayat = document.getElementById("btnRemoveRiwayat");

const screenLoader = document.getElementById("screenLoader");

// Text
const jumlahKonversiText = document.getElementById("jumlahKonversiText");
const resultKonversiText = document.getElementById("resultKonversiText");
const currencyResultKonversiText = document.getElementById("currencyResultKonversiText");
const keteranganText = document.getElementById("keteranganText");
const dateText = document.getElementById("dateText");

const textTertinggi = document.getElementById("textTertinggi");
const textTerendah = document.getElementById("textTerendah");
const textRata2 = document.getElementById("textRata2");

const mainGrafikText = document.getElementById("mainGrafikText");
const subTextGrafik = document.getElementById("subTextGrafik");
const subTextContainer = document.getElementById("subTextContainer");

const svgArrowUp = document.getElementById("svgArrowUp");
const svgArrowDown = document.getElementById("svgArrowDown");

const textPergerakanGrafik = document.getElementById("textPergerakanGrafik");

const textRiwayatKosong = document.getElementById("textRiwayatKosong");

const fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 });
const fmtKecil = new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 4 });
const fmtPersen = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatAngka(value) {
    if (value !== 0 && Math.abs(value) < 1) {
        return fmtKecil.format(value);
    }

    return fmt.format(value);
}

const KEY_RIWAYAT = "localstorage-riwayat";

function showLoader(elm) {
    if (elm.classList.contains("hidden") && !elm.classList.contains("flex")) {
        elm.classList.remove("hidden");
        elm.classList.add("flex");
    }
}

function hideLoader(elm) {
    if (!elm.classList.contains("hidden") && elm.classList.contains("flex")) {
        elm.classList.remove("flex");
        elm.classList.add("hidden");
    }
}

let currentFromCurrency = "";
let currentToCurrency = "";
let listMataUang = [];
let konversiRequestId = 0;
let chartRequestId = 0;

(async () => {

    try {
        showLoader(loaderResult);
        if (selectFromElm.value === "" || selectToElm.value === "") {
            inputJumlahElm.value = 1000;
        }

        if (!localStorage.getItem(KEY_RIWAYAT) || localStorage.getItem(KEY_RIWAYAT) === "[]") {
            localStorage.setItem(KEY_RIWAYAT, JSON.stringify([
                createHistoryItem("usd", "idr")
            ]));
        }

        const riwayat = getRiwayatFromLocalStorage();
        riwayat.forEach((item) => {
            generateBtnRiwayat(item.from, item.to);
        });

        const res = await fetch(buildCurrenciesUrl());
        if (!res.ok) {
            throw new Error(res.status);
        }

        const data = await res.json();
        listMataUang = data;

        selectFromElm.length = 0;
        selectToElm.length = 0;
        data.forEach((item) => {
            const newOption1 = new Option(getCurrencyOptionLabel(item), item.iso_code);
            const newOption2 = new Option(getCurrencyOptionLabel(item), item.iso_code);
            if (item.iso_code === "USD") {
                newOption1.selected = true;
                currentFromCurrency = item.iso_code.toLowerCase();
            }

            if (item.iso_code === "IDR") {
                newOption2.selected = true;
                currentToCurrency = item.iso_code.toLowerCase();
            }

            selectFromElm.add(newOption1);
            selectToElm.add(newOption2);
        });
        prosesKonversi();
        drawChart();
        hideLoader(loaderResult);
        screenLoader.classList.add("hidden");
    } catch (err) {
        hideLoader(loaderResult);
        alert(err.message);
    }

})()

function getRiwayatFromLocalStorage() {
    try {
        const raw = localStorage.getItem(KEY_RIWAYAT);
        if (!raw) {
            throw new Error("Error: Local Storage Tidak Valid");
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error("Error: Array Tidak Valid");
        }

        return parsed;
    } catch(err) {
        throw err;
    }
}

async function prosesKonversi(isUbahCurrency = false) {
    const requestId = ++konversiRequestId;
    const jumlah = Number(inputJumlahElm.value);
    const detailFromCurrency = findCurrency(listMataUang, currentFromCurrency);
    const detailToCurrency = findCurrency(listMataUang, currentToCurrency);

    try {
        showLoader(loaderResult);
        if (isUbahCurrency) {
            drawChart();
        }
        const url = buildRateUrl(currentFromCurrency, currentToCurrency);
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Gagal mengambil rate (status ${res.status})`);
        }

        const data = await res.json();
        if (isUbahCurrency) {
            saveToRiwayat();
        }

        if (requestId !== konversiRequestId) {
            return;
        }

        jumlahKonversiText.textContent = `${fmt.format(jumlah)} ${getCurrencyName(listMataUang, detailFromCurrency.iso_code)}`;

        const resPerhitungan = jumlah * data.rate;
        resultKonversiText.textContent = formatAngka(resPerhitungan);
        currencyResultKonversiText.textContent = detailToCurrency.iso_code;
        keteranganText.textContent = `1 ${detailFromCurrency.iso_code} = ${formatAngka(data.rate)} ${detailToCurrency.iso_code}`;
        const formattedDate = new Date(data.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });
        dateText.textContent = `Tanggal: ${formattedDate}`;

        currencySymbolText.textContent = detailFromCurrency.iso_code;
        hideLoader(loaderResult);
    } catch (err) {
        if (requestId === konversiRequestId) {
            hideLoader(loaderResult);
            alert(err.message);
        }
    }
}

selectFromElm.addEventListener("change", () => {

    if (selectFromElm.value !== "") {
        currentFromCurrency = selectFromElm.value.toLowerCase();
    } else {
        currentFromCurrency = "";
    }

    if (selectToElm.value !== "" && Number(inputJumlahElm.value) == 0) {
        inputJumlahElm.value = 1;
    }

    if (currentFromCurrency !== "" && currentToCurrency !== "") {
        prosesKonversi(true);
    }
});

selectToElm.addEventListener("change", () => {

    if (selectToElm.value !== "") {
        currentToCurrency = selectToElm.value.toLowerCase();
    } else {
        currentToCurrency = "";
    }

    if (selectFromElm.value !== "" && Number(inputJumlahElm.value) == 0) {
        inputJumlahElm.value = 1;
    }

    if (currentFromCurrency !== "" && currentToCurrency !== "") {
        prosesKonversi(true);
    }

});

inputJumlahElm.addEventListener("input", () => {

    inputJumlahElm.value = inputJumlahElm.value.replace(/\D/g, "");
    prosesKonversi();

});

btnChange.addEventListener("click", () => {
    const activeFromOption = selectFromElm.options;
    const activeToOption = selectFromElm.options;
    let currentFromCurrencyTemp = currentFromCurrency;
    let currentToCurrencyTemp = currentToCurrency;

    for (let i = 0; i < activeFromOption.length; i++) {
        if (selectFromElm.options[i].value.toLowerCase() === currentToCurrency) {
            selectFromElm.options[i].selected = true;
            currentFromCurrencyTemp = selectFromElm.options[i].value.toLowerCase();
        }
    }

    for (let i = 0; i < activeToOption.length; i++) {
        if (selectToElm.options[i].value.toLowerCase() === currentFromCurrency) {
            selectToElm.options[i].selected = true;
            currentToCurrencyTemp = selectToElm.options[i].value.toLowerCase();
        }
    }

    currentFromCurrency = currentFromCurrencyTemp;
    currentToCurrency = currentToCurrencyTemp;

    prosesKonversi(true);
});

// Chart
const ctx = document.getElementById("grafik").getContext('2d');
const timeSelectElm = document.getElementById("time");
let chart = null;

async function generateChartData(startDate, endDate, requestId = chartRequestId) {

    try {

        const url = buildRatesUrl(startDate, endDate, currentFromCurrency, currentToCurrency);
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Gagal mengambil data grafik (status ${res.status})`);
        }
        const data = await res.json();

        if (requestId !== chartRequestId) {
            return null;
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Data grafik tidak tersedia untuk periode ini");
        }

        const labels = data.map(item => item.date);
        const arrData = data.map(item => item.rate);

        const tertinggi = Math.max(...arrData);
        const terendah = Math.min(...arrData);
        const rata2 = arrData.reduce((total, rate) => total + rate, 0) / arrData.length;

        const ratePertama = arrData[0];
        const rateTerakhir = arrData[arrData.length - 1];
        const selisih = rateTerakhir - ratePertama;
        const persenPerubahan = (selisih / ratePertama) * 100;
        const isNaik = selisih >= 0;
        const tanda = isNaik ? '+' : '';

        textTertinggi.textContent = formatAngka(tertinggi);
        textTerendah.textContent = formatAngka(terendah);
        textRata2.textContent = formatAngka(rata2);
        mainGrafikText.textContent = formatAngka(rateTerakhir);

        subTextGrafik.textContent = `${tanda}${formatAngka(selisih)} (${tanda}${fmtPersen.format(persenPerubahan)}%)`;

        textPergerakanGrafik.textContent = `Pergerakan ${currentFromCurrency.toUpperCase()} ke ${currentToCurrency.toUpperCase()}`;

        subTextContainer.classList.remove("bg-green-200");
        subTextContainer.classList.remove("bg-red-200");

        svgArrowUp.classList.add("hidden");
        svgArrowDown.classList.add("hidden");
        if (isNaik) {
            subTextContainer.classList.add("bg-green-200");
            svgArrowUp.classList.remove("hidden");
        } else {
            subTextContainer.classList.add("bg-red-200");
            svgArrowDown.classList.remove("hidden");
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: `${currentFromCurrency.toUpperCase()} to ${currentToCurrency.toUpperCase()}`,
                    data: arrData,
                    pointStyle: 'circle',
                    borderColor: isNaik ? 'green' : 'red'
                }
            ]
        }

    } catch (err) {
        throw err;
    }

}

async function drawChart() {
    const requestId = ++chartRequestId;

    try {
        showLoader(loaderGrafik);
        const endDate = new Date();
        let startDate = new Date();

        startDate.setDate(startDate.getDate() - Number(timeSelectElm.value));
        const data = await generateChartData(startDate.toLocaleDateString('en-CA'), endDate.toLocaleDateString('en-CA'), requestId);

        if (!data) {
            return;
        }

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                    }
                }
            }
        });
        hideLoader(loaderGrafik);
    } catch (err) {
        if (requestId === chartRequestId) {
            hideLoader(loaderGrafik);
            alert(err.message);
        }
    }
}

timeSelectElm.addEventListener("change", () => {
    drawChart();
});


// Riwayat
riwayatContainer.addEventListener("click", (event) => {
    const elm = event.target.closest('.btnRiwayat');

    if (elm) {
        event.preventDefault();

        try {
            const id = elm.dataset.id;
            const parsed = getRiwayatFromLocalStorage();

            const data = parsed.find(val => val.id === id);

            currentFromCurrency = data.from;
            currentToCurrency = data.to;

            const activeFromOption = selectFromElm.options;
            const activeToOption = selectFromElm.options;

            for (let i = 0; i < activeFromOption.length; i++) {
                if (selectFromElm.options[i].value.toLowerCase() === currentFromCurrency) {
                    selectFromElm.options[i].selected = true;
                }
            }

            for (let i = 0; i < activeToOption.length; i++) {
                if (selectToElm.options[i].value.toLowerCase() === currentToCurrency) {
                    selectToElm.options[i].selected = true;
                }
            }

            prosesKonversi(true);

        } catch(err) {
            alert(err.message);
        }
    }
});

function generateBtnRiwayat(fromCurrency, toCurrency) {

    riwayatContainer.insertAdjacentHTML('afterbegin', `
        <button type="button" class="flex hover:bg-gray-200 hover:cursor-pointer items-center bg-gray-300 p-3 rounded-3xl gap-2 btnRiwayat" data-id="${fromCurrency}-${toCurrency}">
          <p class="text-sm">${fromCurrency.toUpperCase()}</p>
          <svg id="svgArrowRight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
          <p class="text-sm">${toCurrency.toUpperCase()}</p>
        </button>`);

    if (!textRiwayatKosong.classList.contains("hidden")) {
        textRiwayatKosong.classList.add("hidden");
    }

}

function saveToRiwayat() {
    try {
        const parsed = getRiwayatFromLocalStorage();
        const { riwayat, isFound } = nextHistory(parsed, currentFromCurrency, currentToCurrency);

        if (!isFound) {
            generateBtnRiwayat(currentFromCurrency.toLocaleLowerCase(), currentToCurrency.toLocaleLowerCase());
        }

        localStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat));
    } catch(err) {
        throw err;
    }
}

btnRemoveRiwayat.addEventListener("click", (item) => {
    const isConfirm = confirm("Yakin ingin menghapus riwayat?");

    if (isConfirm) {
        localStorage.setItem(KEY_RIWAYAT, JSON.stringify([]));
        riwayatContainer.replaceChildren();
        textRiwayatKosong.classList.remove("hidden");
    }
});