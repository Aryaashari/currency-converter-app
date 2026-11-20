const inputJumlahElm = document.getElementById("jumlah");
const selectFromElm = document.getElementById("from");
const selectToElm = document.getElementById("to");

const baseApiUrl = "https://api.frankfurter.dev/v2/";

const loader = document.getElementById("loader");

// Text
const jumlahKonversiText = document.getElementById("jumlahKonversiText");
const resultKonversiText = document.getElementById("resultKonversiText");
const currencyResultKonversiText = document.getElementById("currencyResultKonversiText");
const keteranganText = document.getElementById("keteranganText");
const dateText = document.getElementById("dateText");

function showLoader() {
    if (loader.classList.contains("hidden") && !loader.classList.contains("flex")) {
        loader.classList.remove("hidden");
        loader.classList.add("flex");
    }
}

function hideLoader() {
    if (!loader.classList.contains("hidden") && loader.classList.contains("flex")) {
        loader.classList.remove("flex");
        loader.classList.add("hidden");
    }
}

let currentFromCurrency = "";
let currentToCurrency = "";
let listMataUang = [];

(async () => {

    try {
        showLoader();
        if (selectFromElm.value === "" || selectToElm.value === "") {
            inputJumlahElm.value = 0;
            inputJumlahElm.disabled = true;
        }

        const res = await fetch(baseApiUrl + "currencies");
        if (!res.ok) {
            throw new Error(res.status);
        }

        const data = await res.json();
        listMataUang = data;

        selectFromElm.length = 1;
        selectToElm.length = 1;
        data.forEach((item) => {
            const newOption1 = new Option(`${item.iso_code} (${item.name})`, item.iso_code);
            const newOption2 = new Option(`${item.iso_code} (${item.name})`, item.iso_code);
            selectFromElm.add(newOption1);
            selectToElm.add(newOption2);
        });
        hideLoader();
    } catch (err) {
        hideLoader();
        console.log(err.message);
    }

})()

async function prosesKonversi() {
    const jumlah = Number(inputJumlahElm.value);
    const detailFromCurrency = listMataUang.find(item => item.iso_code.toLowerCase() === currentFromCurrency);
    const detailToCurrency = listMataUang.find(item => item.iso_code.toLowerCase() === currentToCurrency);

    try {
        const url = `${baseApiUrl}rate/${currentFromCurrency}/${currentToCurrency}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(res);
        }

        const data = await res.json();
        jumlahKonversiText.textContent = `${jumlah} ${detailFromCurrency.name}`;
        
        const resPerhitungan = jumlah * data.rate;
        resultKonversiText.textContent = resPerhitungan;
        currencyResultKonversiText.textContent = detailToCurrency.iso_code;
        keteranganText.textContent = `1 ${detailFromCurrency.iso_code} = ${1*data.rate} ${detailToCurrency.iso_code}`;
        const formattedDate = new Date(data.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });;
        dateText.textContent = `Tanggal: ${formattedDate}`;
    } catch (err) {
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
        inputJumlahElm.disabled = false;
    }

    if (currentFromCurrency !== "" && currentToCurrency !== "") {
        prosesKonversi();
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
        inputJumlahElm.disabled = false;
    }

    if (currentFromCurrency !== "" && currentToCurrency !== "") {
        prosesKonversi();
    }

});

inputJumlahElm.addEventListener("input", () => {

    inputJumlahElm.value = inputJumlahElm.value.replace(/\D/g, "");
    prosesKonversi();

});