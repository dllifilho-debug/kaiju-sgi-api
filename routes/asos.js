const express = require('express');
const router = express.Router();

// Banco de dados temporário (memória)
let asos = [];

// Listar todos os ASOs
router.get('/', (req, res) => {
  res.json(asos);
});

// Criar novo ASO
router.post('/', (req, res) => {
  const aso = {
    id: Date.now(),
    colaborador: req.body.colaborador,
    tipo: req.body.tipo,
    data: req.body.data,
    resultado: req.body.resultado,
    cid: req.body.cid || null,
    resolutividade: req.body.resolutividade,
    criadoEm: new Date()
  };
  
  asos.push(aso);
  res.status(201).json(aso);
});

// Deletar ASO
router.delete('/:id', (req, res) => {
  asos = asos.filter(a => a.id !== parseInt(req.params.id));
  res.json({ mensagem: 'ASO removido com sucesso' });
});

module.exports = router;
module.exports.setAsos = (data) => { asos = data; };