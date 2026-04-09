const express = require('express');
const router = express.Router();

// Banco em memória (temporário)
let ncs = [];
let nextId = 1;

// GET /api/ncs — Listar todas
router.get('/', (req, res) => {
  try {
    const { status, tipo, ano } = req.query;
    let resultado = [...ncs];

    if (status) {
      resultado = resultado.filter(nc =>
        nc.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (tipo) {
      resultado = resultado.filter(nc =>
        nc.tipo.toLowerCase() === tipo.toLowerCase()
      );
    }

    if (ano) {
      resultado = resultado.filter(nc => {
        const dataNC = new Date(nc.dataAbertura);
        return dataNC.getFullYear() === parseInt(ano);
      });
    }

    res.json({
      success: true,
      total: resultado.length,
      data: resultado
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ncs/:id — Buscar por ID
router.get('/:id', (req, res) => {
  try {
    const nc = ncs.find(n => n.id === parseInt(req.params.id));
    if (!nc) {
      return res.status(404).json({ success: false, message: 'NC não encontrada' });
    }
    res.json({ success: true, data: nc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ncs — Criar nova
router.post('/', (req, res) => {
  try {
    const {
      titulo,
      descricao,
      tipo,           // 'interna' | 'externa' | 'cliente'
      gravidade,      // 'baixa' | 'media' | 'alta' | 'critica'
      origem,         // 'auditoria' | 'inspecao' | 'reclamacao' | 'acidente'
      setor,
      responsavel,
      dataAbertura,
      dataPrevista,
      observacoes
    } = req.body;

    // Validações básicas
    if (!titulo || !tipo || !gravidade || !setor || !responsavel) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: titulo, tipo, gravidade, setor, responsavel'
      });
    }

    const novaNc = {
      id: nextId++,
      titulo,
      descricao: descricao || '',
      tipo,
      gravidade,
      origem: origem || 'auditoria',
      setor,
      responsavel,
      status: 'aberta',   // aberta | em_andamento | concluida | cancelada
      dataAbertura: dataAbertura || new Date().toISOString().split('T')[0],
      dataPrevista: dataPrevista || null,
      dataConclusao: null,
      observacoes: observacoes || '',
      acoes: [],           // IDs das ações vinculadas
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    ncs.push(novaNc);

    res.status(201).json({
      success: true,
      message: 'NC criada com sucesso',
      data: novaNc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ncs/:id — Atualizar
router.put('/:id', (req, res) => {
  try {
    const index = ncs.findIndex(n => n.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'NC não encontrada' });
    }

    const ncAtual = ncs[index];
    const atualizado = {
      ...ncAtual,
      ...req.body,
      id: ncAtual.id,           // protege o ID
      criadoEm: ncAtual.criadoEm, // protege data de criação
      atualizadoEm: new Date().toISOString()
    };

    // Se status mudou para concluida, registra data
    if (req.body.status === 'concluida' && !ncAtual.dataConclusao) {
      atualizado.dataConclusao = new Date().toISOString().split('T')[0];
    }

    ncs[index] = atualizado;

    res.json({
      success: true,
      message: 'NC atualizada com sucesso',
      data: atualizado
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/ncs/:id/status — Atualizar só o status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const statusValidos = ['aberta', 'em_andamento', 'concluida', 'cancelada'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Use: ${statusValidos.join(', ')}`
      });
    }

    const index = ncs.findIndex(n => n.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'NC não encontrada' });
    }

    ncs[index].status = status;
    ncs[index].atualizadoEm = new Date().toISOString();

    if (status === 'concluida') {
      ncs[index].dataConclusao = new Date().toISOString().split('T')[0];
    }

    res.json({
      success: true,
      message: `Status atualizado para: ${status}`,
      data: ncs[index]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ncs/:id — Deletar
router.delete('/:id', (req, res) => {
  try {
    const index = ncs.findIndex(n => n.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'NC não encontrada' });
    }

    const removida = ncs.splice(index, 1)[0];

    res.json({
      success: true,
      message: 'NC removida com sucesso',
      data: removida
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ncs/stats/resumo — Estatísticas para dashboard
router.get('/stats/resumo', (req, res) => {
  try {
    const { ano } = req.query;
    let dados = [...ncs];

    if (ano) {
      dados = dados.filter(nc => {
        const dataNC = new Date(nc.dataAbertura);
        return dataNC.getFullYear() === parseInt(ano);
      });
    }

    const resumo = {
      total: dados.length,
      abertas: dados.filter(nc => nc.status === 'aberta').length,
      emAndamento: dados.filter(nc => nc.status === 'em_andamento').length,
      concluidas: dados.filter(nc => nc.status === 'concluida').length,
      canceladas: dados.filter(nc => nc.status === 'cancelada').length,
      porGravidade: {
        baixa: dados.filter(nc => nc.gravidade === 'baixa').length,
        media: dados.filter(nc => nc.gravidade === 'media').length,
        alta: dados.filter(nc => nc.gravidade === 'alta').length,
        critica: dados.filter(nc => nc.gravidade === 'critica').length,
      },
      porMes: agruparPorMes(dados)
    };

    res.json({ success: true, data: resumo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper — agrupar por mês
function agruparPorMes(dados) {
  const meses = Array(12).fill(0);
  dados.forEach(nc => {
    const mes = new Date(nc.dataAbertura).getMonth();
    meses[mes]++;
  });
  return meses;
}

// Exporta também o array para o seed
module.exports = router;
module.exports.getNcs = () => ncs;
module.exports.setNcs = (data) => { ncs = data; nextId = data.length + 1; };