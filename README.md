# DAPUR KILAT — Game Masak Kilat

[![make.fun - best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Harianrevi1/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Harianrevi1/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Game masak 2D yang serba cepat: jalankan dapur kecil sendirian. Pesanan muncul di papan pesanan dengan timer, kamu bergerak keliling dapur, ambil bahan dari rak, potong di talenan, masak di kompor, racik di meja, lalu serahkan sebelum waktu habis. Makin banyak pesanan tersaji, makin ramai dapurnya.

Bounty: [make.fun/bounty/best-cooking-game-20261125-0137](https://make.fun/bounty/best-cooking-game-20261125-0137)

## Cara main

Buka `game/index.html` di desktop Chrome (atau jalankan server statis apa pun di folder `game/`). Tidak butuh internet.

- **WASD / Panah** — gerakkan koki
- **E / Spasi** — pakai stasiun terdekat (ambil bahan, potong, masak, racik, serahkan)
- **Klik** — jalan ke titik itu, atau pakai stasiun yang diklik
- **P** — jeda, **M** — suara, **H** — lihat resep, **R** — ulang

## Alur masak

1. **Ambil bahan** dari rak: Nasi dan Sambal siap pakai, Sayur harus dipotong, Mie/Ayam/Telur harus dimasak.
2. **Talenan** — taruh Sayur mentah, tekan E 3x sampai terpotong.
3. **Kompor** — taruh bahan mentah di tungku, tunggu 3 detik sampai matang (jangan sampai gosong, 6,5 detik!).
4. **Meja racik** — susun bahan jadi di atas piring sesuai resep pesanan. Piring yang cocok akan bersinar "SIAP DISAJIKAN!".
5. **Serahkan** — bawa piring ke jendela serah terima sebelum timer pesanan habis. Kombo menaikkan koin; 3 pesanan hangus berarti shift berakhir.

## Resep

| Hidangan | Bahan | Koin |
| --- | --- | --- |
| Nasi Goreng | Nasi + Telur (dimasak) + Sambal | 25 |
| Ayam Geprek | Ayam (dimasak) + Sambal | 20 |
| Mie Goreng | Mie (dimasak) + Sayur (dipotong) + Telur (dimasak) | 30 |
| Soto Ayam | Ayam (dimasak) + Nasi + Sayur (dipotong) | 30 |
| Gado-Gado | Sayur (dipotong) + Telur (dimasak) + Sambal | 25 |

## Struktur kode

- `game/index.html` — halaman game (canvas 1280×800)
- `game/src/config.js` — bahan, resep, tata letak dapur, tuning
- `game/src/world.js` — state game, pesanan, stasiun, interaksi
- `game/src/render.js` — semua gambar dapur di canvas
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — bunyi WebAudio (tanpa file eksternal)
- `game/src/shots.js` — adegan demo untuk screenshot
- `game/src/main.js` — loop game dan wiring
- `main.ts` — program hand-in (menyalin `game/` + `screenshots/` dan menulis `dossier.json`)
