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

app.post('/generate', async (req, res) => {
  try {
    const silaDipilih = [];
    for (let i = 0; i < 5; i++) {
      const randomSila = Math.floor(Math.random() * 5) + 1;
      silaDipilih.push(randomSila);
    }
    const hitungSila = {};
    silaDipilih.forEach(sila => {
      hitungSila[sila] = (hitungSila[sila] || 0) + 1;
    });
    const instruksiDistribusi = Object.entries(hitungSila)
      .map(([sila, jumlah]) => `${jumlah} soal untuk Sila ke-${sila}`)
      .join(', ');

    console.log("=== KOMPOSISI SOAL KALI INI ===");
    console.log(instruksiDistribusi);

    const promptDinamis = `Kamu adalah pembuat soal kuis edukasi tingkat lanjut (HOTS) tentang penerapan Pancasila di era digital. Tugasmu adalah membuat tepat 5 (lima) soal pilihan ganda berupa studi kasus.

PENTING: Buatkan komposisi soal dengan pembagian persis seperti ini: ${instruksiDistribusi}.

ATURAN TINGKAT KESULITAN & FORMAT:
1. PANJANG TEKS PILIHAN JAWABAN HARUS SERAGAM. Jangan sampai jawaban yang benar terlihat paling panjang, paling detail, atau paling formal. Keempat opsi harus memiliki jumlah kata yang mirip.
2. Pilihan jawaban yang salah (distractor) HARUS SANGAT MASUK AKAL dan menjebak. Buat seolah-olah itu adalah tindakan "netral" atau "solusi praktis", padahal secara esensi nilai Pancasila itu kurang tepat. Jangan buat pilihan salah yang keburukannya terlalu kentara (misal: "memaki", "memblokir", "menyebar hoaks").
3. Pastikan posisi jawaban yang benar (correct index) bervariasi secara acak (bisa 0, 1, 2, atau 3) di setiap soal. Jangan polanya ketebak.
4. Output wajib HANYA berupa format Array JSON murni tanpa ada teks pembuka, penutup, atau markdown block.

Gunakan struktur Array persis seperti ini:
[
  {
    "q": "[Pertanyaan studi kasus yang kompleks]",
    "opts": [
      "[Pilihan jawaban index 0 (panjang teks seragam)]",
      "[Pilihan jawaban index 1 (panjang teks seragam)]",
      "[Pilihan jawaban index 2 (panjang teks seragam)]",
      "[Pilihan jawaban index 3 (panjang teks seragam)]"
    ],
    "correct": [Angka index jawaban benar antara 0-3],
    "feedback": "[Penjelasan mengapa jawaban benar dan mengapa opsi lain kurang tepat]"
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

app.listen(PORT, () => {
  console.log(`Sudah on bang!!!`);
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});