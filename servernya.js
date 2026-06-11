require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
          "text": "Kamu adalah pembuat soal kuis edukasi tentang penerapan Pancasila di era digital. Tugasmu adalah membuat tepat 5 (lima) soal pilihan ganda berupa studi kasus tentang bagaimana bersikap di media sosial atau internet berdasarkan nilai-nilai Pancasila (buatkan masing-masing 1 soal untuk Sila ke-1 sampai ke-5). PENTING: Pastikan posisi jawaban yang benar (correct index) bervariasi secara acak (bisa 0, 1, 2, atau 3) di setiap soal, JANGAN meletakkan jawaban benar di index yang sama terus-menerus. Output wajib HANYA berupa format Array JSON murni tanpa ada teks pembuka, penutup, atau markdown block.\n\nGunakan struktur Array persis seperti ini:\n[\n  {\n    \"q\": \"[Pertanyaan studi kasus]\",\n    \"opts\": [\n      \"[Pilihan jawaban index 0]\",\n      \"[Pilihan jawaban index 1]\",\n      \"[Pilihan jawaban index 2]\",\n      \"[Pilihan jawaban index 3]\"\n    ],\n    \"correct\": [Angka index jawaban benar antara 0-3],\n    \"feedback\": \"[Penjelasan jawaban mengacu pada Sila ke-berapa dan alasannya]\"\n  }\n]"
        }]
      })
    });
    console.log("=== DATA DARI AI ===");
    console.log(response)
    const newQuestionObj = JSON.parse(response.result.text);
    res.json(newQuestionObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan internal pada server." });
  }
});

app.listen(PORT, () => {
  console.log(`Sudah on bang!!!`);
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});