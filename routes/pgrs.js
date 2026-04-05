const express = require('express');
const router = express.Router();

// Banco de dados temporário (memória)
let pgrs = [];

// Listar todos os PGRs
router.get('/', (req, res) => {
  res.json(pgrs);
});

// Criar novo PGR
router.post('/', (req, res) => {
  const pgr = {
    id: Date.now(),
    cliente: req.body.cliente,
    obra: req.body.obra,
    dataEmissao: req.body.dataEmissao,
    proximaRevisao: req.body.proximaRevisao,
    responsavel: req.body.responsavel,
    status: req.body.status || 'ativo',
    criadoEm: new Date()
  };

  pgrs.push(pgr);
  res.status(201).json(pgr);
});

// Deletar PGR
router.delete('/:id', (req, res) => {
  pgrs = pgrs.filter(p => p.id !== parseInt(req.params.id));
  res.json({ mensagem: 'PGR removido com sucesso' });
});

module.exports = router;