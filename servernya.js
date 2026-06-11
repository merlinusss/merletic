require('dotenv').config();
const express = require('express');

const app = express();
const PORT = 3004;

app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const response = await fetch('https://api.maelyn.eu/api/ai/chatgpt', {
      method: 'POST',
      headers: {
        'x-maelyn-auth': process.env.MAELYN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          "text": "Kamu adalah pembuat soal kuis edukasi tentang penerapan Pancasila di era digital. Tugasmu adalah membuat tepat 1 (satu) soal pilihan ganda berupa studi kasus tentang bagaimana bersikap di media sosial atau internet berdasarkan nilai-nilai Pancasila. Output wajib HANYA berupa format objek JSON murni tanpa ada teks pembuka, penutup, atau markdown block.\n\nGunakan struktur persis seperti ini:\n{\n  \"q\": \"[Pertanyaan studi kasus]\",\n  \"opts\": [\n    \"[Pilihan jawaban index 0]\",\n    \"[Pilihan jawaban index 1]\",\n    \"[Pilihan jawaban index 2]\",\n    \"[Pilihan jawaban index 3]\"\n  ],\n  \"correct\": [Angka index dari jawaban yang benar, contoh: 0, 1, 2, atau 3],\n  \"feedback\": \"[Penjelasan jawaban mengacu pada Sila ke-berapa dan alasannya]\"\n}",
          "model": "gpt-4o-mini"
        }]
      })
    });
    const newQuestionObj = JSON.parse(data.result.text);
    res.json(newQuestionObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan internal pada server." });
  }
});

app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});