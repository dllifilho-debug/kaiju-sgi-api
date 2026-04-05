const express = require('express');
const router = express.Router();

// Banco de dados temporário (memória)
let treinamentos = [];

// Listar todos os treinamentos
router.get('/', (req, res) => {
  res.json(treinamentos);
});

// Criar novo treinamento
router.post('/', (req, res) => {
  const treinamento = {
    id: Date.now(),
    colaborador: req.body.colaborador,
    nr: req.body.nr,
    dataRealizacao: req.body.dataRealizacao,
    validade: req.body.validade,
    status: req.body.status || 'valido',
    criadoEm: new Date()
  };

  treinamentos.push(treinamento);
  res.status(201).json(treinamento);
});

// Deletar treinamento
router.delete('/:id', (req, res) => {
  treinamentos = treinamentos.filter(t => t.id !== parseInt(req.params.id));
  res.json({ mensagem: 'Treinamento removido com sucesso' });
});

module.exports = router;