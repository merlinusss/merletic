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
    const prompt = `Kamu adalah pembuat soal kuis edukasi tentang penerapan Pancasila di era digital. Tugasmu adalah membuat tepat 5 (lima) soal pilihan ganda berupa studi kasus tentang bagaimana bersikap di media sosial atau internet berdasarkan nilai-nilai Pancasila (buatkan masing-masing 1 soal untuk Sila ke-1 sampai ke-5). PENTING: Pastikan posisi jawaban yang benar (correct index) bervariasi secara acak (bisa 0, 1, 2, atau 3) di setiap soal, JANGAN meletakkan jawaban benar di index yang sama terus-menerus. Output wajib HANYA berupa format Array JSON murni tanpa ada teks pembuka, penutup, atau markdown block.

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
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const responseBody = await response.text();
    console.log('=== DATA DARI AI ===');
    console.log('status', response.status, response.statusText);
    console.log('body', responseBody);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'AI service returned an error',
        status: response.status,
        statusText: response.statusText,
        body: responseBody
      });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseBody);
    } catch (parseError) {
      throw new Error('AI response is not valid JSON: ' + parseError.message);
    }

    let newQuestionObj;
    if (Array.isArray(parsedResponse)) {
      newQuestionObj = parsedResponse;
    } else if (parsedResponse?.result?.text) {
      newQuestionObj = JSON.parse(parsedResponse.result.text);
    } else if (parsedResponse?.choices?.[0]?.message?.content) {
      newQuestionObj = JSON.parse(parsedResponse.choices[0].message.content);
    } else {
      throw new Error('Tidak menemukan hasil kuis yang valid pada jawaban AI');
    }

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