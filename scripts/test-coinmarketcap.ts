/**
 * Script de teste para validar a API do CoinMarketCap
 * 
 * Uso:
 * 1. Configure COINMARKETCAP_API_KEY no .env.local
 * 2. Execute: npx ts-node scripts/test-coinmarketcap.ts
 */

import { CoinMarketCapService } from '../src/services/coinmarketcap';

async function testCoinMarketCapAPI() {
  console.log('🧪 Testando API do CoinMarketCap...\n');

  const service = new CoinMarketCapService();
  
  // Tokens para testar (com unlocks conhecidos)
  const testSymbols = ['TIA', 'ARB', 'OP', 'APT', 'SUI', 'DYDX'];
  
  console.log('📊 Testando busca de unlocks para:', testSymbols.join(', '));
  console.log('⏳ Aguarde...\n');

  try {
    const startTime = Date.now();
    const results = await service.getUpcomingUnlocks(testSymbols, 180);
    const endTime = Date.now();
    
    console.log('✅ Sucesso!\n');
    console.log(`⏱️  Tempo de resposta: ${endTime - startTime}ms`);
    console.log(`📦 Total de unlocks encontrados: ${results.length}\n`);
    
    if (results.length > 0) {
      console.log('🔓 Próximos unlocks:\n');
      
      // Agrupar por token
      const byToken = results.reduce((acc, unlock) => {
        if (!acc[unlock.token]) acc[unlock.token] = [];
        acc[unlock.token].push(unlock);
        return acc;
      }, {} as Record<string, typeof results>);
      
      for (const [token, unlocks] of Object.entries(byToken)) {
        console.log(`\n${token}:`);
        unlocks.slice(0, 3).forEach(u => {
          console.log(`  📅 ${u.unlockDate}`);
          console.log(`     💰 ${u.amount.toLocaleString()} tokens`);
          console.log(`     📊 ${u.percentage.toFixed(2)}% do supply total`);
        });
        if (unlocks.length > 3) {
          console.log(`  ... e mais ${unlocks.length - 3} unlocks`);
        }
      }
    } else {
      console.log('⚠️  Nenhum unlock encontrado nos próximos 180 dias.');
      console.log('\n💡 Possíveis razões:');
      console.log('   1. Endpoint de unlocks não disponível no seu plano');
      console.log('   2. Tokens testados não têm unlocks programados');
      console.log('   3. API key inválida ou expirada');
      console.log('\n📝 O sistema continuará funcionando usando UnlocksApp e DeFiLlama');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:\n');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      if (error.message.includes('API key')) {
        console.log('\n💡 Configure sua chave de API:');
        console.log('   1. Crie um arquivo .env.local na raiz do projeto');
        console.log('   2. Adicione: COINMARKETCAP_API_KEY=sua_chave_aqui');
        console.log('   3. Obtenha sua chave em: https://coinmarketcap.com/api/');
      }
    } else {
      console.error(error);
    }
    
    console.log('\n⚠️  Nota: O CoinMarketCap é opcional. O sistema funciona sem ele.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Executar teste
testCoinMarketCapAPI().catch(console.error);

