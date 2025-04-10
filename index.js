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

  // Validação
  if (!Array.isArray(criterios) || criterios.length === 0 || !texto) {
    return res.status(400).json({ erro: 'Critérios (array) e texto são obrigatórios.' });
  }

  // Construção do prompt
  const listaCriterios = criterios
    .map((criterio, index) => `${index + 1}. ${criterio}`)
    .join('\n');

  const prompt = `
Você é um avaliador de redações de vestibular. 
Considere os seguintes critérios de avaliação:
${listaCriterios}

Com base nesses critérios, analise o seguinte texto:

"${texto}"

Responda:
- O que o texto entrega
- O que o texto não entrega
- Justifique cada ponto de forma clara e objetiva
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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
