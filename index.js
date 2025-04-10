require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analisar', async (req, res) => {
  const { criterios, texto } = req.body;

  if (!criterios || !texto) {
    return res.status(400).json({ erro: 'Critérios e texto são obrigatórios.' });
  }

  const prompt = `
Considere os seguintes critérios para avaliar um texto de vestibular:
${criterios.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Analise o seguinte texto com base nesses critérios e diga:
- O que o texto entrega
- O que não entrega
- Justifique cada ponto

Texto:
"${texto}"
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // ou gpt-3.5-turbo
      messages: [{ role: 'user', content: prompt }],
    });

    const resposta = completion.choices[0].message.content;
    res.json({ resposta });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao comunicar com a OpenAI.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
