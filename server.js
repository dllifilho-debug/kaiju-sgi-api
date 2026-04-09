const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────
const asosRouter         = require('./routes/asos');
const ltcatsRouter       = require('./routes/ltcats');
const pgrsRouter         = require('./routes/pgrs');
const treinamentosRouter = require('./routes/treinamentos');
const ncsRouter          = require('./routes/ncs');
const acoesRouter        = require('./routes/acoes');

app.use('/api/asos',         asosRouter);
app.use('/api/ltcats',       ltcatsRouter);
app.use('/api/pgrs',         pgrsRouter);
app.use('/api/treinamentos', treinamentosRouter);
app.use('/api/ncs',          ncsRouter);
app.use('/api/acoes',        acoesRouter);

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:  'online',
    sistema: 'KAIJU SGI API',
    versao:  '1.0.0',
    rotas: [
      '/api/asos',
      '/api/ltcats',
      '/api/pgrs',
      '/api/treinamentos',
      '/api/ncs',
      '/api/acoes'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Seed de Dados ─────────────────────────────────────────────
function carregarSeed() {
  try {
    const seed = require('./seed');

    // Injeta dados nas rotas
    require('./routes/asos').setAsos(seed.asos);
    require('./routes/ltcats').setLtcats(seed.ltcats);
    require('./routes/pgrs').setPgrs(seed.pgrs);
    require('./routes/treinamentos').setTreinamentos(seed.treinamentos);
    require('./routes/ncs').setNcs(seed.ncs);
    require('./routes/acoes').setAcoes(seed.acoes);

    console.log('✅ Seed carregado com sucesso!');
    console.log(`   📋 ASOs:          ${seed.asos.length}`);
    console.log(`   🏥 LTCATs:        ${seed.ltcats.length}`);
    console.log(`   📄 PGRs:          ${seed.pgrs.length}`);
    console.log(`   🎓 Treinamentos:  ${seed.treinamentos.length}`);
    console.log(`   ⚠️  NCs:           ${seed.ncs.length}`);
    console.log(`   ✅ Ações:         ${seed.acoes.length}`);
  } catch (err) {
    console.log('⚠️  Seed não carregado:', err.message);
  }
}

carregarSeed();

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🦖 KAIJU SGI API rodando na porta ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});