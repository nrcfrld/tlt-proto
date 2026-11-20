# Business Requirements Document — TLT Back Office

## Tujuan dokumen

Dokumen ini mencatat latar belakang masalah dan alasan bisnis dibutuhkannya TLT Back Office. Fokusnya adalah kebutuhan bisnis, bukan spesifikasi teknis implementasi.

Sumber: penjelasan langsung dari pengusul proyek dalam percakapan dan contoh workbook `TLT Excel.xlsx`. Hal yang belum dikonfirmasi dicatat sebagai keputusan terbuka. Perilaku atau data pada prototipe tidak otomatis menjadi aturan bisnis yang disepakati.

## Konteks bisnis

The Lembongan Traveller (TLT) adalah calon klien yang saat ini berstatus hot lead. TLT menjalankan bisnis property management dan mengelola properti milik owner lain.

Mayoritas properti yang dikelola TLT menggunakan Guesty sebagai Property Management System (PMS), sekaligus channel manager untuk distribusi ke Online Travel Agent (OTA). TLT ingin menjadikan Guesty sebagai sistem inti dan sumber data utama.

Dua hotel besar tetap menggunakan GuestPro atas keputusan owner masing-masing. Berdasarkan penjelasan calon klien, GuestPro digunakan sebagai PMS dan dihubungkan ke SiteMinder untuk distribusi ke OTA. Report kedua hotel tersebut selama ini dikelola secara terpisah per hotel.

Untuk membawa kedua hotel itu ke dalam pengelolaan TLT di Guesty, tim saat ini menyalin data dari GuestPro ke Guesty secara manual, termasuk katalog properti. Availability di kedua sistem dihubungkan menggunakan iCalendar.

## Problem pertama: pelaporan dan pencatatan keuangan

### Kondisi saat ini

Laporan Guesty belum memenuhi kebutuhan TLT untuk pengaturan dan perhitungan komisi sesuai cara kerja bisnis mereka. TLT juga membutuhkan pencatatan pembayaran kepada owner.

Untuk melengkapi kebutuhan tersebut, tim menggunakan Excel. Contoh workbook yang diberikan menggabungkan:

- Data reservasi: properti, unit, tamu, tanggal menginap, jumlah malam, dan sumber booking.
- Nilai booking, komisi TLT, komisi agen, dan jumlah untuk owner.
- Deposit dan balance pembayaran tamu, beserta tanggal invoice dan pembayaran.
- Pembayaran kepada owner, beserta nominal, tanggal, dan catatan.
- Data boat transfer yang terkait dengan reservasi.

Contoh workbook memiliki variasi perhitungan komisi dan menyediakan kolom untuk dua pembayaran kepada owner. Contoh tersebut belum cukup untuk menetapkan seluruh aturan komisi atau batas jumlah pembayaran yang berlaku dalam bisnis TLT.

### Mengapa kondisi ini perlu diubah

Menurut pengusul proyek, ketergantungan pada Excel memiliki potensi kesalahan yang besar dan perlu dihindari. Perhitungan komisi serta pencatatan pembayaran perlu ditangani di dalam sistem internal dengan aturan yang konsisten.

TLT membutuhkan laporan yang menghubungkan data reservasi, pembagian pendapatan, dan pembayaran owner tanpa harus terus mengelola proses tersebut melalui Excel.

### Boat transfer sebagai bagian dari kebutuhan laporan

Berdasarkan penjelasan calon klien, layanan booking kapal atau perahu yang mereka tawarkan tidak dapat ditambahkan sebagai listing di Guesty dalam penggunaan mereka saat ini.

Pemesanan dilakukan melalui WhatsApp. Tim mengonfirmasi biaya dan ketersediaan secara manual kepada penyedia pihak ketiga, lalu mencatat hasilnya di Excel. Workbook memuat biaya, jumlah dewasa/anak/FOC, perusahaan kapal, status pemesanan, jam keberangkatan dan kembali, serta catatan.

Karena transaksi ini tetap harus masuk ke laporan TLT, data Guesty saja belum mencakup seluruh kebutuhan laporan. Back office perlu menerima input internal untuk boat transfer dan menggabungkannya dengan data reservasi terkait.

### Kebutuhan mata uang

TLT menginginkan seluruh pencatatan dan laporan ke depan menggunakan Indonesian Rupiah (IDR), menggantikan penggunaan Australian Dollar (AUD) yang disampaikan dalam penjelasan calon klien.

Cakupan IDR meliputi nilai booking, komisi TLT, komisi agen, jumlah untuk owner, pembayaran owner, dan boat transfer. Tujuan bisnis yang disampaikan adalah mengurangi kerumitan konversi mata uang serta memudahkan pengurusan legal dan perpajakan Indonesia.

Format mata uang pada contoh Excel mencampur simbol `Rp` dan `$`. Format tersebut tidak digunakan sebagai dasar untuk menyimpulkan mata uang asli setiap nilai. Apabila sumber data masih menggunakan AUD atau mata uang lain, aturan konversi ke IDR perlu ditentukan.

## Tujuan TLT Back Office

Back office ditujukan untuk menangani problem pertama melalui kebutuhan berikut:

1. Menggunakan data reservasi dari Guesty sebagai masukan utama laporan.
2. Menyediakan pengaturan dan perhitungan komisi TLT serta komisi agen sesuai aturan bisnis yang akan dikonfirmasi.
3. Menampilkan jumlah yang menjadi hak owner dan mencatat pembayaran serta sisa kewajibannya.
4. Menyediakan pencatatan boat transfer dari tim TLT yang terhubung dengan reservasi terkait.
5. Menghasilkan rekap dan laporan dalam IDR.
6. Menggantikan ketergantungan pada Excel untuk proses keuangan tersebut dan mengurangi potensi kesalahan.

Pengguna utamanya adalah tim TLT yang menangani keuangan dan operasional. Detail peran serta hak akses belum ditentukan.

## Arah solusi yang diusulkan

Pengusul proyek merekomendasikan integrasi API dan webhook Guesty agar data reservasi beserta perubahannya dapat masuk ke back office. Data tersebut digunakan untuk rekap harian dan perhitungan komisi di dalam aplikasi.

Input internal TLT melengkapi data dari Guesty, terutama untuk pencatatan pembayaran owner dan boat transfer.

Rencana ini masih memerlukan verifikasi akses API, cakupan data, dan event yang tersedia. Data dua hotel yang berasal dari GuestPro juga perlu diperiksa kelengkapannya setelah dimasukkan ke Guesty sebelum menetapkan bahwa satu integrasi Guesty dapat memenuhi seluruh kebutuhan laporan.

## Problem kedua: sinkronisasi availability GuestPro–Guesty

Problem ini terpisah dari pelaporan keuangan.

Owner dua hotel mempertahankan GuestPro, sementara TLT juga mengelola salinan propertinya di Guesty. Akibatnya, availability kedua sistem perlu tetap sesuai.

Menurut penjelasan pengusul proyek, sinkronisasi iCalendar yang digunakan saat ini memiliki jeda sekitar satu jam. Dalam jeda tersebut, kamar yang sudah terjual melalui satu jalur masih dapat terlihat tersedia pada jalur lainnya, sehingga membuka risiko double booking atau overbooking.

Integrasi Guesty ke back office untuk laporan keuangan tidak dengan sendirinya menyelesaikan sinkronisasi availability ini. Kebutuhan, cakupan, dan solusi untuk problem kedua perlu dibahas secara tersendiri.

## Keputusan yang masih terbuka

- Aturan lengkap komisi: dasar perhitungan, variasi tarif, kondisi penerapan, dan pembulatan.
- Makna serta alur deposit, balance, dan pembayaran kepada owner, termasuk jumlah tahap pembayaran yang dibutuhkan.
- Perlakuan pembatalan, refund, dan perubahan reservasi terhadap komisi serta hak owner.
- Perlakuan biaya dan pendapatan boat transfer dalam perhitungan keuangan serta pembayaran owner.
- Mata uang asli data sumber dan aturan konversi ke IDR, termasuk sumber kurs dan tanggal kurs.
- Kelengkapan data dari dua hotel di GuestPro yang telah dimasukkan ke Guesty.
- Format laporan akhir serta kebutuhan legal dan perpajakan yang spesifik.
- Detail teknis integrasi, frekuensi pembaruan, dan penanganan data yang gagal atau terlambat masuk.

Otomatisasi WhatsApp atau pemesanan ke penyedia kapal belum dinyatakan sebagai kebutuhan. Kebutuhan yang sudah disampaikan adalah pencatatan boat transfer untuk melengkapi laporan.

## Hubungan dengan prototipe saat ini

Repository ini berisi prototipe frontend untuk mendemonstrasikan alur back office. Prototipe belum memiliki integrasi PMS nyata, backend, atau penyimpanan permanen. Tampilan dan input nominal menggunakan IDR dengan data demo sintetis; konversi dari mata uang sumber belum diterapkan. Boat transfer memiliki field perusahaan kapal serta jam keberangkatan/kembali, dan ditampilkan pada laporan sebagai bagian terpisah dari booking serta hak owner.

Target bisnis dalam dokumen ini adalah IDR. Data demo, formula sementara, integrasi simulasi, dan fitur lain pada prototipe perlu divalidasi terhadap kebutuhan bisnis sebelum dijadikan implementasi produksi.
