import Chart from "chart.js/auto";

const inputJumlahElm = document.getElementById("jumlah");
const selectFromElm = document.getElementById("from");
const selectToElm = document.getElementById("to");

const baseApiUrl = "https://api.frankfurter.dev/v2/";

const loaderResult = document.getElementById("loaderResult");
const loaderGrafik = document.getElementById("loaderGrafik");

const resultContainer = document.getElementById("resultContainer");
const currencySymbolText = document.getElementById("currencySymbolText");

const btnChange = document.getElementById("btnChange");

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

(async () => {

    try {
        showLoader(loaderResult);
        if (selectFromElm.value === "" || selectToElm.value === "") {
            inputJumlahElm.value = 1000;
        }

        const res = await fetch(baseApiUrl + "currencies");
        if (!res.ok) {
            throw new Error(res.status);
        }

        const data = await res.json();
        listMataUang = data;

        selectFromElm.length = 0;
        selectToElm.length = 0;
        data.forEach((item) => {
            const newOption1 = new Option(`${item.iso_code} (${item.name})`, item.iso_code);
            const newOption2 = new Option(`${item.iso_code} (${item.name})`, item.iso_code);
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
    } catch (err) {
        hideLoader(loaderResult);
        console.log(err.message);
    }

})()

async function prosesKonversi(isUbahCurrency = false) {
    const jumlah = Number(inputJumlahElm.value);
    const detailFromCurrency = listMataUang.find(item => item.iso_code.toLowerCase() === currentFromCurrency);
    const detailToCurrency = listMataUang.find(item => item.iso_code.toLowerCase() === currentToCurrency);

    try {
        showLoader(loaderResult);
        if (isUbahCurrency) {
            showLoader(loaderGrafik);
        }
        const url = `${baseApiUrl}rate/${currentFromCurrency}/${currentToCurrency}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(res);
        }

        const data = await res.json();
        jumlahKonversiText.textContent = `${jumlah} ${detailFromCurrency.name}`;

        const resPerhitungan = (jumlah * data.rate);
        resultKonversiText.textContent = resPerhitungan;
        currencyResultKonversiText.textContent = detailToCurrency.iso_code;
        keteranganText.textContent = `1 ${detailFromCurrency.iso_code} = ${1 * data.rate} ${detailToCurrency.iso_code}`;
        const formattedDate = new Date(data.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });;
        dateText.textContent = `Tanggal: ${formattedDate}`;
        
        currencySymbolText.textContent = currentFromCurrency.toLocaleUpperCase();
        if (isUbahCurrency) {
            drawChart();
        }
        hideLoader(loaderResult);
    } catch (err) {
        hideLoader();
        console.log(err.message);
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


// Chart
const ctx = document.getElementById("grafik").getContext('2d');
const timeSelectElm = document.getElementById("time");


async function generateChartData(startDate, endDate) {

    try {

        const url = baseApiUrl + `rates?from=${startDate}&to=${endDate}&base=${currentFromCurrency}&quotes=${currentToCurrency}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(res);
        }
        const data = await res.json();

        let tertinggi = 0;
        let terendah = 0;
        let rata2 = 0;
        let arrData = [];
        let labels = [];
        data.forEach((item) => {
            labels.push(item.date);
            if (1 * item.rate > tertinggi) {
                tertinggi = 1 * item.rate;
            } else if (1 * item.rate < terendah || terendah === 0) {
                terendah = 1 * item.rate;
            }

            rata2 = rata2 + (1 * item.rate);

            arrData.push(1 * item.rate);
        });
        rata2 = (rata2 / data.length);

        const dataPertama = data[0];
        const dataTerakhir = data[data.length-1];
        const selisih = (1*dataTerakhir.rate) - (1*dataPertama.rate);
        const persenPerubahan = ((selisih/dataPertama.rate)*100).toFixed(2);

        textTertinggi.textContent = tertinggi.toFixed(4);
        textTerendah.textContent = terendah.toFixed(4);
        textRata2.textContent = rata2.toFixed(4);
        mainGrafikText.textContent = 1*dataTerakhir.rate;

        subTextGrafik.textContent = `${selisih >= 0 ? '+' + selisih : selisih} (${persenPerubahan >= 0 ? '+' + persenPerubahan : persenPerubahan}%)`;

        textPergerakanGrafik.textContent = `Pergerakan ${currentFromCurrency.toUpperCase()} ke ${currentToCurrency.toUpperCase()}`;

        subTextContainer.classList.remove("bg-green-200");
        subTextContainer.classList.remove("bg-red-200");

        svgArrowUp.classList.add("hidden");
        svgArrowDown.classList.add("hidden");
        if (selisih >= 0) {
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
                    pointStyle: 'circle'
                }
            ]
        }

    } catch (err) {
        throw err;
    }

}

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

    prosesKonversi();
    drawChart();
});

async function drawChart() {
    try {
        showLoader(loaderGrafik);
        const endDate = new Date();
        let startDate = new Date();

        startDate.setDate(startDate.getDate() - Number(timeSelectElm.value));
        const data = await generateChartData(startDate.toLocaleDateString('en-CA'), endDate.toLocaleDateString('en-CA'));

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
    } catch(err) {
        hideLoader(loaderGrafik);
        throw err;
    }
}

let chart = null;

timeSelectElm.addEventListener("change", async () => {
    try {
    drawChart();
    } catch (err) {
        console.log(err);
    }
});