# Kalkulator Kurs

Aplikasi web sederhana untuk mengonversi mata uang dan melihat grafik pergerakan kurs. Data kurs diambil dari Frankfurter API.

Live demo: https://kurs-app-aryaashari.netlify.app/

## Cara Menggunakan

1. Masukkan jumlah uang pada kolom Jumlah.
2. Pilih mata uang asal pada kolom Dari.
3. Pilih mata uang tujuan pada kolom Ke.
4. Hasil konversi akan langsung muncul di bawahnya.
5. Klik tombol panah di antara Dari dan Ke untuk menukar mata uang.
6. Pilih rentang waktu (1 Minggu, 1 Bulan, 3 Bulan, 1 Tahun) untuk melihat grafik pergerakan kurs.
7. Pasangan mata uang yang pernah dipilih akan tersimpan di bagian Riwayat. Klik salah satunya untuk memakainya lagi, atau klik tombol hapus untuk mengosongkan riwayat.

## Menjalankan di Lokal

```bash
npm install
npm run dev
```

Lalu buka alamat yang muncul di terminal, biasanya http://localhost:5173

## Teknologi

- Vite
- JavaScript
- Tailwind CSS
- Chart.js
- Frankfurter API
