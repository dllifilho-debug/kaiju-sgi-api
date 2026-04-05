const express = require('express');
const router = express.Router();

// Banco de dados temporário (memória)
let ltcats = [];

// Listar todos os LTCATs
router.get('/', (req, res) => {
  res.json(ltcats);
});

// Criar novo LTCAT
router.post('/', (req, res) => {
  const ltcat = {
    id: Date.now(),
    cliente: req.body.cliente,
    obra: req.body.obra,
    dataEmissao: req.body.dataEmissao,
    vigencia: req.body.vigencia,
    responsavel: req.body.responsavel,
    status: req.body.status || 'ativo',
    criadoEm: new Date()
  };

  ltcats.push(ltcat);
  res.status(201).json(ltcat);
});

// Deletar LTCAT
router.delete('/:id', (req, res) => {
  ltcats = ltcats.filter(l => l.id !== parseInt(req.params.id));
  res.json({ mensagem: 'LTCAT removido com sucesso' });
});

module.exports = router;