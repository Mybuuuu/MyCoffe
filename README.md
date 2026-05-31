# ☕ MyCoffe Kelompok 1 - Production Ready Backend Platform

REST API modular dan scalable untuk platform coffee shop modern **MyCoffe Kelompok 1**. Dirancang menggunakan **Node.js, Express.js, Sequelize ORM, dan JWT Authentication**.

Platform ini siap untuk di-deploy ke server production (VPS/Cloud Run) dengan database MySQL serta otomatis mendukung fallback cerdas SQLite untuk simulasi sandbox lokal.

---

## 🚀 FITUR CORE BACKEND
1. **Autentikasi & Autorisasi Tangguh**: Multi-role (Admin & Customer), register, login, refresh tokens, and auto password hashing (bcryptjs).
2. **Katalog Kopi Modern**: Filter kategori kopi, live search, sortasi harga, filter rating, produk terlaris (is_popular), dan rincian detail menu.
3. **Keranjang Belanja (Cart)**: Tambah pesanan, kuantitas dinamis, auto-subtotal, validasi stok habis.
4. **Checkout & Histori Order**: Auto generate invoice, snapshot harga historis, auto-potong stok inventori kopi, model status transaksi (`pending` -> `paid` -> `diproses` -> `dikirim` -> `selesai`).
5. **Dashboard Admin**: Ringkasan data real-time, total omset pendapatan, produk paling banyak dibeli, grafik tren penjualan bulanan.
6. **Review & Ulasan**: Sistem rating kepuasan pelanggan skala Bintang 1-5 dan re-kalkulasi aggregate global rating produk otomatis.
7. **Keamanan Maksimal**: Perlindungan XSS, SQL injection, CORS Policy, Helmet Security, cookie-parser, dan limiters.
8. **File Upload (Multer)**: Media upload foto profil pelangan dan item gambar produk.

---

## 📁 STRUKTUR DATA REKANAN
Program diatur menggunakan arsitektur modular yang rapi:
```bash
src/
├── config/              # Konfigurasi database Sequelize & koneksi pool
├── controllers/         # Handler requests & core business logics
├── middleware/          # JWT Verification, role checks, upload limits
├── models/              # Sequelize database schema mapping
├── migrations/          # Raw SQL DDL structure untuk migrasi mandiri
├── seeders/             # Initial mock data (kopi, kategori kopi, dll)
├── routes/              # Express Router API route map endpoints
├── validations/         # express-validator schema parameter rules
├── helpers/             # Seeder automated startup loaders
└── docs/                # Postman API Collection references
```

---

## 🛠️ CARA PENYIAPAN LOKAL

### 1. Salin File Environment & Konfigurasi
Lakukan duplikasi berkas `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Sesuaikan variabel target database Anda (jika kosong, sistem secara aman mengembangkannya di SQLite file lokal `/data/mycoffee.sqlite`):
```env
PORT=3000
NODE_ENV=development

# MySQL Database Target
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mycoffee_db
DB_DIALECT=mysql

# JWT Tokens
JWT_SECRET=super_secret_coffee_key_abc_123_xyz
JWT_REFRESH_SECRET=another_super_secret_refresh_key_987_654

CLIENT_URL=http://localhost:3000
```

### 2. Pasang Dependensi Node.js
```bash
npm install
```

### 3. Jalankan Server Dev
Server otomatis melakukan sinkronisasi modul database dan melakukan seeder data-blank secara aman:
```bash
npm run dev
```

---

## 🗺️ PANDUAN DEPLOYMENT VPS (PRODUCTION)

Untuk melakukan deployment REST API ini ke VPS berbasis Ubuntu/Debian:

### Langkah A: Persiapan Node & MySQL di VPS
```bash
# Update Server & Install Node.js
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server

# Nyalakan MySQL & Buat DB target
sudo systemctl start mysql
sudo mysql -u root -e "CREATE DATABASE mycoffee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Langkah B: Migrasi Skema via SQL DDL
Impor berkas SQL migrasi lengkap kami ke dalam database server baru Anda:
```bash
mysql -u root -p mycoffee_db < src/migrations/schema_and_seed.sql
```

### Langkah C: Menjalankan Background Service via PM2
PM2 akan memastikan REST API berjalan stabil terus menerus di port 3000 dan me-restart secara otomatis jika terjadi hambatan:
```bash
sudo npm install -g pm2
pm2 start server.ts --name "mycoffe-backend" --interpreter ts-node

# Atur agar startup saat server reboot
pm2 startup
pm2 save
```

### Langkah D: Konfigurasi Reverse Proxy Nginx
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/mycoffee
```
Isi konfigurasi server blok proxy:
```nginx
server {
    listen 80;
    server_name api.mycoffelompok1.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/mycoffee /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 🌐 INTEGRASI FRONTEND VERCEL
Saat menghubungkan backend ini ke kode UI Anda di Vercel:
1. Pastikan Anda mendaftarkan URL backend VPS Anda pada environment frontend Vercel (contoh: `NEXT_PUBLIC_API_URL=https://api.mycoffelompok1.com`).
2. Jangan lupa mengaktifkan CORS pada setting `.env` agar domain Vercel diijinkan mengambil data.

---

## 📊 ENDPOINTS REST API MAPS

### 🔐 Autentikasi (`/api/auth`)
* `POST /api/auth/register` - Registrasi akun Customer baru.
* `POST /api/auth/login` - Login pengguna, memperoleh Access Token, Refresh Token, & user profile.
* `POST /api/auth/logout` - Menghapus sesi login.
* `POST /api/auth/refresh-token` - Pengambilan Access token baru menggunakan Valid Refresh Token.
* `GET  /api/auth/profile` - Mengambil detail profil user yang sedang login (membutuhkan Bearer Token).
* `PUT  /api/auth/profile` - Pembaruan profil user (nama, no telepon, alamat).

### 🏷️ Kategori Menu (`/api/categories`)
* `GET    /api/categories` - Mengambil seluruh kategori (Espresso, Cappuccino, Dessert, Latte, dll).
* `POST   /api/categories` - [ADMIN] Menambahkan kategori baru.
* `PUT    /api/categories/:id` - [ADMIN] Memperbarui ikon/nama kategori.
* `DELETE /api/categories/:id` - [ADMIN] Manghapus kategori.

### ☕ Katalog Kopi (`/api/products`)
* `GET    /api/products` - List seluruh produk dengan pencarian (`search`), paginasi (`page`), limit, dan sort harga.
* `GET    /api/products/popular` - Menampilkan 8 daftar kopi paling populer/bestseller.
* `GET    /api/products/latest` - Menampilkan list minuman kopi rilisan terbaru.
* `GET    /api/products/search?q=...` - Quick search produk berdasarkan nama atau deskripsi.
* `GET    /api/products/category/:slug` - Menyaring produk bedasarkan slug kategori (misal: `/category/latte`).
* `GET    /api/products/:id` - Menarik detail detail produk & kategori.
* `POST   /api/products` - [ADMIN] Menambahkan produk baru ke menu.
* `PUT    /api/products/:id` - [ADMIN] Melakukan update data stok, harga, nama produk.
* `DELETE /api/products/:id` - [ADMIN] Menghapus produk.

### 🛒 Keranjang Belanja (`/api/cart`)
* `GET    /api/cart` - Melihat detail keranjang belanja user aktif & total tagihan.
* `POST   /api/cart` - Memasukkan menu pilihan ke keranjang belanja.
* `PUT    /api/cart/:id` - Memperbarui kuantitas (qty) item keranjang belanja.
* `DELETE /api/cart/:id` - Membuang item dari daftar keranjang.
* `DELETE /api/cart/clear` - Mengosongkan isi keranjang belanja user.

### 🧾 Transaksi Pembayaran & Histori Order (`/api/orders`)
* `POST   /api/orders/checkout` - Checkout dari dari isi Cart, mengurangi stok fisik kopi secara real-time, generate invoice.
* `GET    /api/orders` - Histori pesanan (Customer melihat miliknya sendiri, Admin dapat memantau seluruh order masuk).
* `GET    /api/orders/:id` - Detail invoice, list produk terbeli, nominal ongkir & grand total.
* `PUT    /api/orders/:id/status` - [ADMIN] Memperbarui status pesanan (`pending` -> `paid` -> `diproses` -> `dikirim` -> `selesai`).

### 📈 Ulasan Kopi & Rating (`/api/reviews`)
* `POST   /api/reviews` - Menulis ulasan ulasan rasa kopi & memberi bintang. Re-kalkulasi agregat bintang global produk berjalan otomatis.
* `GET    /api/reviews/product/:id` - Menampilkan list review produk bersangkutan.
* `DELETE /api/reviews/:id` - [ADMIN/OWNER] Menghapus ulasan.

### 💖 Wishlist Favorit (`/api/wishlist`)
* `GET    /api/wishlist` - Menampilkan menu favorit yang disimpan pelanggan.
* `POST   /api/wishlist` - Mendaftarkan produk kopi ke daftar wishlist favorit.
* `DELETE /api/wishlist/:id` - Mengeluarkan produk dari daftar wishlist favorit.

---

## 📥 CONTOH FORMAT RESPONSE JSON

### Format Response SUKSES (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Detail produk berhasil diambil",
  "data": {
    "id": 2,
    "nama_produk": "Creamy Vanilla Latte",
    "slug": "creamy-vanilla-latte",
    "harga": "32000.00",
    "diskon": "10.00",
    "stok": 120,
    "rating": "4.90",
    "gambar": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=500",
    "kategori_id": 3
  }
}
```

### Format Response GAGAL (400 Bad Request / 500 Internals)
```json
{
  "success": false,
  "message": "Stok kopi tidak mencukupi. Sisa stok saat ini: 4"
}
```

---

## 🏆 KELOMPOK PENGEMBANG (Kelompok 1)
Tim Pengembang Aplikasi Coffee Shop modern **MyCoffe Kelompok 1**. Siap mengantarkan pengalaman ngopi digital terbaik dunia!
