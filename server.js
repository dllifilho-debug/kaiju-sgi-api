const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    sistema: 'Kaiju SGI — SECONCI',
    versao: '1.0.0'
  });
});

// Rotas
const asos = require('./routes/asos');
const ltcats = require('./routes/ltcats');
const pgrs = require('./routes/pgrs');
const treinamentos = require('./routes/treinamentos');

app.use('/api/asos', asos);
app.use('/api/ltcats', ltcats);
app.use('/api/pgrs', pgrs);
app.use('/api/treinamentos', treinamentos);

// Porta
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🦖 Kaiju SGI rodando na porta ${PORT}`);
});