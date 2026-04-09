const express = require('express');
const router = express.Router();

let acoes = [];
let nextId = 1;

// GET /api/acoes — Listar todas
router.get('/', (req, res) => {
  try {
    const { status, responsavel, ncId, ano } = req.query;
    let resultado = [...acoes];

    if (status)      resultado = resultado.filter(a => a.status === status);
    if (responsavel) resultado = resultado.filter(a =>
      a.responsavel.toLowerCase().includes(responsavel.toLowerCase())
    );
    if (ncId)        resultado = resultado.filter(a => a.ncId === parseInt(ncId));
    if (ano) {
      resultado = resultado.filter(a => {
        return new Date(a.dataAbertura).getFullYear() === parseInt(ano);
      });
    }

    res.json({ success: true, total: resultado.length, data: resultado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/acoes/:id
router.get('/:id', (req, res) => {
  try {
    const acao = acoes.find(a => a.id === parseInt(req.params.id));
    if (!acao) {
      return res.status(404).json({ success: false, message: 'Ação não encontrada' });
    }
    res.json({ success: true, data: acao });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/acoes — Criar nova
router.post('/', (req, res) => {
  try {
    const {
      titulo,
      descricao,
      tipo,          // 'corretiva' | 'preventiva' | 'melhoria'
      responsavel,
      setor,
      ncId,          // ID da NC vinculada (opcional)
      dataAbertura,
      dataPrevista,
      prioridade,    // 'baixa' | 'media' | 'alta'
      observacoes
    } = req.body;

    if (!titulo || !tipo || !responsavel || !setor) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: titulo, tipo, responsavel, setor'
      });
    }

    const novaAcao = {
      id: nextId++,
      titulo,
      descricao: descricao || '',
      tipo,
      responsavel,
      setor,
      ncId: ncId || null,
      prioridade: prioridade || 'media',
      status: 'pendente',  // pendente | em_andamento | concluida | cancelada
      dataAbertura: dataAbertura || new Date().toISOString().split('T')[0],
      dataPrevista: dataPrevista || null,
      dataConclusao: null,
      progresso: 0,        // 0 a 100
      observacoes: observacoes || '',
      evidencias: [],      // URLs de evidências
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    acoes.push(novaAcao);

    res.status(201).json({
      success: true,
      message: 'Ação criada com sucesso',
      data: novaAcao
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/acoes/:id — Atualizar
router.put('/:id', (req, res) => {
  try {
    const index = acoes.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Ação não encontrada' });
    }

    const atual = acoes[index];
    const atualizado = {
      ...atual,
      ...req.body,
      id: atual.id,
      criadoEm: atual.criadoEm,
      atualizadoEm: new Date().toISOString()
    };

    if (req.body.status === 'concluida' && !atual.dataConclusao) {
      atualizado.dataConclusao = new Date().toISOString().split('T')[0];
      atualizado.progresso = 100;
    }

    acoes[index] = atualizado;

    res.json({ success: true, message: 'Ação atualizada', data: atualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/acoes/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const { status, progresso } = req.body;
    const statusValidos = ['pendente', 'em_andamento', 'concluida', 'cancelada'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Use: ${statusValidos.join(', ')}`
      });
    }

    const index = acoes.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Ação não encontrada' });
    }

    acoes[index].status = status;
    acoes[index].atualizadoEm = new Date().toISOString();

    if (progresso !== undefined) acoes[index].progresso = progresso;
    if (status === 'concluida') {
      acoes[index].dataConclusao = new Date().toISOString().split('T')[0];
      acoes[index].progresso = 100;
    }

    res.json({ success: true, message: `Status: ${status}`, data: acoes[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/acoes/:id
router.delete('/:id', (req, res) => {
  try {
    const index = acoes.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Ação não encontrada' });
    }

    const removida = acoes.splice(index, 1)[0];
    res.json({ success: true, message: 'Ação removida', data: removida });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/acoes/stats/kanban — Dados para o Kanban
router.get('/stats/kanban', (req, res) => {
  try {
    const kanban = {
      pendente:     acoes.filter(a => a.status === 'pendente'),
      em_andamento: acoes.filter(a => a.status === 'em_andamento'),
      concluida:    acoes.filter(a => a.status === 'concluida'),
      cancelada:    acoes.filter(a => a.status === 'cancelada')
    };

    res.json({ success: true, data: kanban });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.getAcoes = () => acoes;
module.exports.setAcoes = (data) => { acoes = data; nextId = data.length + 1; };