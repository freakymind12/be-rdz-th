# Nama Proyek

BE-RDZ-TH

## Daftar Isi

- [Tentang](#tentang)
- [Fitur](#fitur)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)

## Tentang

Proyek ini adalah aplikasi backend yang dibangun menggunakan Express.js. Aplikasi ini dirancang untuk gateway dari device RDZ-TH untuk melakukan pengontrolan temperature dan humidity.

## Fitur

- MQTT PUB & SUB
- Report Data
- Grouping Device
- Daily Email Report Device

## Persyaratan

Sebelum memulai, pastikan Anda memiliki hal-hal berikut:

- Node.js (versi 20.11.0)
- NPM (versi 10.9.0)
- MariaDB (versi 10.4.21)

## Instalasi

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek ini:

1. Clone repositori ini:
   ```bash
   git clone https://github.com/freakymind12/be-rdz-th.git
   ```

2. Masuk ke direktori proyek:
   ```bash
   cd be-rdz-th
   ```

3. Instal dependensi:
   ```bash
   npm install
   ```

4. Konfigurasi variabel lingkungan :
   - Copy file `.env.example` di root proyek dan isi sesuai dengan format file nya

## Penggunaan

Untuk menjalankan aplikasi, gunakan perintah berikut:

```bash
npm start
```