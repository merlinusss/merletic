require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function getRandomSilaOrder() {
  const silas = [1, 2, 3, 4, 5];
  for (let i = silas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [silas[i], silas[j]] = [silas[j], silas[i]];
  }
  return silas;
}

app.post('/generate', async (req, res) => {
  try {
    const silaDipilih = [];
    const promptDinamis = `
Kamu adalah pembuat soal kuis edukasi tentang penerapan Pancasila di era digital.

Tugasmu adalah membuat tepat 5 (lima) soal pilihan ganda berupa studi kasus tentang bagaimana bersikap di media sosial atau internet berdasarkan nilai-nilai Pancasila.

Gunakan ketentuan berikut (HARUS diikuti urutannya):
${silaDipilih.map((sila, idx) => `- Soal ke-${idx + 1}: berdasarkan Sila ke-${sila}`).join('\n')}

PENTING:
- Setiap soal HARUS jelas menyebut konteks perilaku di media sosial atau internet.
- Pastikan posisi jawaban yang benar (correct index) bervariasi secara acak (0, 1, 2, atau 3) di setiap soal.
- Output wajib HANYA berupa format Array JSON murni tanpa ada teks pembuka, penutup, atau markdown block.

Gunakan struktur Array persis seperti ini:
[
  {
    "q": "[Pertanyaan studi kasus]",
    "opts": [
      "[Pilihan jawaban index 0]",
      "[Pilihan jawaban index 1]",
      "[Pilihan jawaban index 2]",
      "[Pilihan jawaban index 3]"
    ],
    "correct": [Angka index jawaban benar antara 0-3],
    "feedback": "[Penjelasan jawaban mengacu pada Sila ke-berapa dan alasannya]"
  }
]`;

    const response = await fetch('https://api.maelyn.eu/api/ai/chatgpt', {
      method: 'POST',
      headers: {
        'x-maelyn-auth': process.env.MAELYN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "gpt-4o-mini",
        "messages": [
          {
            "role": "user",
            "content": promptDinamis
          }
        ]
      })
    });
    const data = await response.json();
    
    if (!response.ok) {
      console.error("API Maelyn bermasalah. Status:", response.status);
      return res.status(response.status).json({ error: "API AI Error", detail: data });
    }

    const newQuestions = JSON.parse(data.result.text);
    newQuestions.forEach(kuis => {
      const teksJawabanBenar = kuis.opts[kuis.correct];
      for (let i = kuis.opts.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1); 
        [kuis.opts[i], kuis.opts[j]] = [kuis.opts[j], kuis.opts[i]];
      }
      kuis.correct = kuis.opts.indexOf(teksJawabanBenar);
    });
    res.json(newQuestions);
  } catch (error) {
    console.error("Error di server:", error);
    res.status(500).json({ error: "Terjadi kesalahan internal pada server lokal." });
  }
});

app.get('/get-berita', async (req, res) => {
  try {
    const opsiTanggal = { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', opsiTanggal);

    const promptBerita = `Kamu adalah kurator berita untuk portal "Ruang Berita". Waktu saat ini di Indonesia adalah: ${tanggalSekarang}. 
Tugasmu adalah merangkum 9 berita atau isu sosial yang sedang hangat dibicarakan di Indonesia dalam 7 hingga 14 hari terakhir.

PENTING: JANGAN PERNAH MENGARANG ATAU MEMBUAT URL/LINK PALSU KE PORTAL BERITA. AI dilarang keras membuat link berawalan detik.com, kompas.com, dll karena pasti akan menjadi link mati (404). 
Sebagai gantinya, buatkan 'keyword_pencarian' yang sangat spesifik berdasarkan judul berita tersebut.

Output wajib HANYA berupa format Array JSON murni tanpa ada teks pembuka, penutup, atau markdown block. 

Gunakan struktur Array persis seperti ini:
[
  {
    "judul": "[Judul Berita yang Singkat dan Menarik]",
    "tanggal": "[Tanggal estimasi kejadian/berita]",
    "ringkasan": "[Ringkasan berita singkat dan padat dalam 2-3 kalimat]",
    "kaitan_sila": "[Sebutkan Sila ke-berapa yang paling relevan]",
    "analisis": "[Penjelasan kaitan berita dengan Sila tersebut]",
    "keyword_pencarian": "[Kata kunci pencarian spesifik, contoh: Kasus tawuran pelajar Jakarta Juni 2026]"
  }
]`;

    const encodedPrompt = encodeURIComponent(promptBerita);
    const apiUrl = `https://api.zenzxz.my.id/ai/copilot?message=${encodedPrompt}&model=gpt-5`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("=== RESPONS DARI API BERITA ===");
    console.log(data);
    const rawText = data.result.text;
    const beritaArray = JSON.parse(rawText);
    res.json(beritaArray)
  } catch (error) {
    console.error("Error saat mengambil berita:", error);
    res.status(500).json({ error: "Gagal mengambil data berita terbaru." });
  }
});

app.listen(PORT, () => {
  console.log(`Sudah on bang!!!`);
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});