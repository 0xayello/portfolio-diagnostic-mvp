/**
 * Script de teste específico para o token Meteora (MET)
 * 
 * Dados esperados conforme CoinMarketCap:
 * - Total de eventos: 71 unlocks
 * - Quantidade por evento: 7.32M MET (~$3.35M)
 * - Porcentagem: 0.73% do max supply por unlock
 * - Max supply: 1B MET
 * - Frequência: Mensal (dia 22 de cada mês)
 * 
 * Uso: npx ts-node scripts/test-meteora.ts
 */

import { CoinMarketCapService } from '../src/services/coinmarketcap';

async function testMeteoraUnlocks() {
  console.log('🌟 Testando API do CoinMarketCap com token METEORA (MET)\n');
  console.log('='.repeat(60));
  console.log('\n📊 DADOS ESPERADOS (conforme CoinMarketCap):');
  console.log('   • Total de eventos: 71 unlocks');
  console.log('   • Quantidade: 7.32M MET por evento');
  console.log('   • Porcentagem: 0.73% do max supply');
  console.log('   • Max supply: 1B MET');
  console.log('   • Frequência: Mensal (dia 22)');
  console.log('='.repeat(60));

  const service = new CoinMarketCapService();
  
  // Possíveis símbolos para Meteora
  const possibleSymbols = ['MET', 'METEORA', 'METORA'];
  
  console.log('\n📋 Testando símbolos possíveis:');
  console.log(`   ${possibleSymbols.join(', ')}\n`);

  for (const symbol of possibleSymbols) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔍 Testando símbolo: ${symbol}`);
    console.log(`${'─'.repeat(60)}\n`);

    try {
      const startTime = Date.now();
      
      // Buscar unlocks
      const unlocks = await service.getUpcomingUnlocks([symbol], 180);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (unlocks.length > 0) {
        console.log(`✅ SUCESSO! Encontrado como "${symbol}"\n`);
        console.log(`⏱️  Tempo de resposta: ${duration}ms`);
        console.log(`📦 Total de unlocks retornados: ${unlocks.length}\n`);
        
        // Comparar com dados esperados do CMC
        const expectedTotal = 71;
        const expectedAmount = 7320000; // 7.32M
        const expectedPercentage = 0.73;
        
        console.log('🔍 VALIDAÇÃO DOS DADOS:\n');
        
        if (unlocks.length === expectedTotal) {
          console.log(`   ✅ Total de eventos: ${unlocks.length} (esperado: ${expectedTotal})`);
        } else if (unlocks.length > 0) {
          console.log(`   ⚠️  Total de eventos: ${unlocks.length} (esperado: ${expectedTotal})`);
          console.log(`   ℹ️  Pode estar mostrando apenas eventos futuros`);
        }
        
        // Verificar primeiro unlock
        const firstUnlock = unlocks[0];
        const amountMatch = Math.abs(firstUnlock.amount - expectedAmount) < 100000;
        const percentageMatch = Math.abs(firstUnlock.percentage - expectedPercentage) < 0.01;
        
        if (amountMatch) {
          console.log(`   ✅ Quantidade por unlock: ${firstUnlock.amount.toLocaleString()} (esperado: ${expectedAmount.toLocaleString()})`);
        } else {
          console.log(`   ⚠️  Quantidade por unlock: ${firstUnlock.amount.toLocaleString()} (esperado: ${expectedAmount.toLocaleString()})`);
        }
        
        if (percentageMatch) {
          console.log(`   ✅ Porcentagem: ${firstUnlock.percentage.toFixed(2)}% (esperado: ${expectedPercentage}%)`);
        } else {
          console.log(`   ⚠️  Porcentagem: ${firstUnlock.percentage.toFixed(2)}% (esperado: ${expectedPercentage}%)`);
        }
        
        console.log('\n🔓 Próximos 10 unlocks:\n');
        
        unlocks.slice(0, 10).forEach((unlock, index) => {
          console.log(`${index + 1}. ${unlock.token}`);
          console.log(`   📅 Data: ${unlock.unlockDate}`);
          console.log(`   💰 Quantidade: ${unlock.amount.toLocaleString()} tokens`);
          console.log(`   📊 Porcentagem do supply: ${unlock.percentage.toFixed(2)}%`);
          console.log(`   🚨 Severidade: ${unlock.percentage >= 10 ? 'RED 🔴' : 'YELLOW 🟡'}`);
          console.log();
        });
        
        if (unlocks.length > 10) {
          console.log(`   ... e mais ${unlocks.length - 10} eventos\n`);
        }

        // Análise dos dados
        console.log('📈 ANÁLISE:');
        const totalPercentage = unlocks.reduce((sum, u) => sum + u.percentage, 0);
        const avgPercentage = totalPercentage / unlocks.length;
        const maxUnlock = unlocks.reduce((max, u) => u.percentage > max.percentage ? u : max, unlocks[0]);
        const minUnlock = unlocks.reduce((min, u) => u.percentage < min.percentage ? u : min, unlocks[0]);
        
        console.log(`   • Total a ser desbloqueado: ${totalPercentage.toFixed(2)}% do supply`);
        console.log(`   • Média por evento: ${avgPercentage.toFixed(2)}%`);
        console.log(`   • Maior unlock: ${maxUnlock.percentage.toFixed(2)}% em ${maxUnlock.unlockDate}`);
        console.log(`   • Menor unlock: ${minUnlock.percentage.toFixed(2)}% em ${minUnlock.unlockDate}`);
        
        const highRisk = unlocks.filter(u => u.percentage >= 10).length;
        const mediumRisk = unlocks.filter(u => u.percentage >= 1 && u.percentage < 10).length;
        const lowRisk = unlocks.filter(u => u.percentage < 1).length;
        
        console.log(`   • Unlocks de alto risco (≥10%): ${highRisk}`);
        console.log(`   • Unlocks de médio risco (1-10%): ${mediumRisk}`);
        console.log(`   • Unlocks de baixo risco (<1%): ${lowRisk}`);
        
        // Análise temporal
        const now = new Date();
        const next30Days = unlocks.filter(u => {
          const unlockDate = new Date(u.unlockDate);
          const diff = unlockDate.getTime() - now.getTime();
          return diff <= 30 * 24 * 60 * 60 * 1000;
        });
        
        const next90Days = unlocks.filter(u => {
          const unlockDate = new Date(u.unlockDate);
          const diff = unlockDate.getTime() - now.getTime();
          return diff <= 90 * 24 * 60 * 60 * 1000;
        });
        
        console.log(`\n⏰ PRÓXIMOS UNLOCKS:`);
        console.log(`   • Próximos 30 dias: ${next30Days.length} eventos (${next30Days.reduce((sum, u) => sum + u.percentage, 0).toFixed(2)}%)`);
        console.log(`   • Próximos 90 dias: ${next90Days.length} eventos (${next90Days.reduce((sum, u) => sum + u.percentage, 0).toFixed(2)}%)`);

        return; // Encontrou, pode parar
        
      } else {
        console.log(`⚠️  Nenhum unlock encontrado para "${symbol}"`);
        console.log(`   (Pode não ter unlocks programados ou símbolo incorreto)`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar "${symbol}":`);
      if (error instanceof Error) {
        console.error(`   ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 DICAS:');
  console.log('   • Se nenhum símbolo funcionou, o token pode não estar no CMC');
  console.log('   • Verifique o símbolo correto em: https://coinmarketcap.com/');
  console.log('   • O endpoint de unlocks pode não estar disponível no seu plano');
  console.log('   • Certifique-se de que COINMARKETCAP_API_KEY está configurada\n');
}

// Executar teste
testMeteoraUnlocks().catch(error => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

