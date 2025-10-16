import { NextApiRequest, NextApiResponse } from 'next';
import { CoinGeckoService } from '../../services/coingecko';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, top } = req.query as { q?: string; top?: string } as any;

  try {
    const coinGeckoService = new CoinGeckoService();
    if (top === 'true') {
      const results = await coinGeckoService.getTopCoinsSymbols(20, ['BTC', 'ETH', 'SOL', 'USDC']);
      return res.status(200).json(results);
    }
  } catch {}

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const coinGeckoService = new CoinGeckoService();
    const results = await coinGeckoService.searchCoins(q, 10);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching coins:', error);
    res.status(500).json({ error: 'Failed to search coins' });
  }
}
