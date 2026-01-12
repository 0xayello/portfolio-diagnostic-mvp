import React, { useState, useEffect } from 'react';
import { PortfolioAllocation, AutocompleteOption } from '../types/portfolio';
import TokenLink from './TokenLink';

interface PortfolioFormProps {
  initialAllocation: PortfolioAllocation[];
  onSubmit: (allocation: PortfolioAllocation[]) => void;
}

const PREDEFINED_TOKENS = ['BTC', 'ETH', 'SOL', 'USDC'];

export default function PortfolioForm({ initialAllocation, onSubmit }: PortfolioFormProps) {
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>(initialAllocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [tokenImages, setTokenImages] = useState<Record<string, string>>({});
  
  // Logos de alta qualidade do CoinGecko - 60+ tokens
  const FALLBACK_LOGOS: Record<string, string> = {
    // Majors
    BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    
    // Stablecoins
    USDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    USDD: 'https://assets.coingecko.com/coins/images/25380/small/USDD.png',
    DAI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
    BUSD: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png',
    TUSD: 'https://assets.coingecko.com/coins/images/3449/small/tusd.png',
    FDUSD: 'https://assets.coingecko.com/coins/images/31079/small/firstdigi.jpeg',
    PYUSD: 'https://assets.coingecko.com/coins/images/29825/small/pyusd.png',
    USDE: 'https://assets.coingecko.com/coins/images/36514/small/usde.png',
    
    // Memecoins
    DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    PEPE: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
    FLOKI: 'https://assets.coingecko.com/coins/images/16746/small/PNG_image.png',
    BONK: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
    WIF: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg',
    BOME: 'https://assets.coingecko.com/coins/images/35591/small/book_of_meme_logo.jpg',
    MYRO: 'https://assets.coingecko.com/coins/images/33968/small/myro.png',
    POPCAT: 'https://assets.coingecko.com/coins/images/36087/small/popcat.png',
    MEW: 'https://assets.coingecko.com/coins/images/36088/small/mew.png',
    GME: 'https://assets.coingecko.com/coins/images/36089/small/gme.png',
    
    // Layer 1s
    AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
    ATOM: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    TIA: 'https://assets.coingecko.com/coins/images/31967/small/tia.jpg',
    SEI: 'https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png',
    SUI: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg',
    APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    INJ: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png',
    NEAR: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
    FTM: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png',
    ALGO: 'https://assets.coingecko.com/coins/images/4380/small/download.png',
    FLOW: 'https://assets.coingecko.com/coins/images/13446/small/flow5.png',
    LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    BCH: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash.png',
    
    // Layer 2s
    ARB: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    OP: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    MNT: 'https://assets.coingecko.com/coins/images/27075/small/h1ZhylP.png',
    STRK: 'https://assets.coingecko.com/coins/images/26433/small/starknet.jpg',
    IMX: 'https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png',
    METIS: 'https://assets.coingecko.com/coins/images/15595/small/metis.jpeg',
    
    // DeFi
    UNI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
    AAVE: 'https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png',
    LDO: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png',
    CRV: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
    MKR: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
    COMP: 'https://assets.coingecko.com/coins/images/10775/small/COMP.png',
    SNX: 'https://assets.coingecko.com/coins/images/3406/small/SNX.png',
    PENDLE: 'https://assets.coingecko.com/coins/images/15069/small/Pendle_Logo_Normal-03.png',
    JTO: 'https://assets.coingecko.com/coins/images/32629/small/jto.png',
    ONDO: 'https://assets.coingecko.com/coins/images/26580/small/ONDO.png',
    JUP: 'https://assets.coingecko.com/coins/images/10351/small/logo512.png',
    RUNE: 'https://assets.coingecko.com/coins/images/6595/small/thor.png',
    GMX: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png',
    DYDX: 'https://assets.coingecko.com/coins/images/17500/small/hjnIm9bV.jpg',
    ENA: 'https://assets.coingecko.com/coins/images/36530/small/ethena.png',
    SUSHI: 'https://assets.coingecko.com/coins/images/12271/small/sushiswap-512x512.png',
    
    // Tokens específicos que estavam sem logo
    DOG: 'https://assets.coingecko.com/coins/images/36515/small/dog.png', // Dog Bitcoin (Runes) - ID pode precisar ajuste
    '1INCH': 'https://assets.coingecko.com/coins/images/13469/small/1inch.png',
    YFI: 'https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png',
    
    // Oracles & Infrastructure
    LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    PYTH: 'https://assets.coingecko.com/coins/images/31924/small/pyth.png',
    GRT: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png',
    BAND: 'https://assets.coingecko.com/coins/images/9545/small/Band_token_blue_violet_token.png',
    
    // AI & Compute
    WLD: 'https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg',
    FET: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg',
    AGIX: 'https://assets.coingecko.com/coins/images/2138/small/singularitynet.png',
    RNDR: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
    OCEAN: 'https://assets.coingecko.com/coins/images/3687/small/ocean-protocol-logo.jpg',
    ARKM: 'https://assets.coingecko.com/coins/images/31051/small/arkm.png',
    
    // Storage & Data
    FIL: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
    AR: 'https://assets.coingecko.com/coins/images/4343/small/Arweave.png',
    
    // Gaming & NFT
    BLUR: 'https://assets.coingecko.com/coins/images/28453/small/blur.png',
    GALA: 'https://assets.coingecko.com/coins/images/12493/small/GALA-COINGECKO.png',
    SAND: 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg',
    MANA: 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png',
    AXS: 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png',
    
    // Liquid Staking
    RPL: 'https://assets.coingecko.com/coins/images/2090/small/rocket_pool.jpg',
    ETHFI: 'https://assets.coingecko.com/coins/images/35958/small/etherfi.jpeg',
    
    // Exchanges & Derivatives
    HYPE: 'https://assets.coingecko.com/coins/images/50882/small/hyperliquid.jpg',
    
    // Infrastructure & Launchpads
    PUMP: 'https://assets.coingecko.com/coins/images/67164/small/pump.jpg',
    
    // Others
    STX: 'https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png',
    ROSE: 'https://assets.coingecko.com/coins/images/13162/small/rose.png',
    
    // Top 200 - Stablecoins e DeFi adicionais
    FRAX: 'https://assets.coingecko.com/coins/images/13422/small/frax.png',
    LUSD: 'https://assets.coingecko.com/coins/images/14666/small/lusd.png',
    MIM: 'https://assets.coingecko.com/coins/images/16786/small/mimlogopng.png',
    CAKE: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png',
    
    // Top 200 - Layer 1s adicionais
    THETA: 'https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png',
    EOS: 'https://assets.coingecko.com/coins/images/738/small/eos-eos-logo.png',
    XLM: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
    TRX: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
    VET: 'https://assets.coingecko.com/coins/images/116/small/Vechain-icon_42.png',
    ICP: 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
    HBAR: 'https://assets.coingecko.com/coins/images/4344/small/hbar.png',
    CRO: 'https://assets.coingecko.com/coins/images/7310/small/cybercoin.png',
    QNT: 'https://assets.coingecko.com/coins/images/3370/small/qnt.png',
    EGLD: 'https://assets.coingecko.com/coins/images/12335/small/egld.png',
    ASTR: 'https://assets.coingecko.com/coins/images/22623/small/astr.png',
    KAS: 'https://assets.coingecko.com/coins/images/25751/small/kas.png',
    TON: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
    MANTA: 'https://assets.coingecko.com/coins/images/34220/small/manta.png',
    ZK: 'https://assets.coingecko.com/coins/images/24242/small/zksync.png',
    CORE: 'https://assets.coingecko.com/coins/images/24538/small/core.png',
    
    // Top 200 - Exchange Tokens
    OKB: 'https://assets.coingecko.com/coins/images/4463/small/okb.png',
    LEO: 'https://assets.coingecko.com/coins/images/8418/small/leo-token.png',
    CEL: 'https://assets.coingecko.com/coins/images/3263/small/CEL_logo.png',
    HT: 'https://assets.coingecko.com/coins/images/1304/small/huobi-token-logo.png',
    
    // Top 200 - DeFi adicionais (apenas os que não estão acima)
    BAL: 'https://assets.coingecko.com/coins/images/11683/small/Balancer.png',
    
    // Top 200 - AI & Compute adicionais
    TAO: 'https://assets.coingecko.com/coins/images/34008/small/bittensor.png',
    AKT: 'https://assets.coingecko.com/coins/images/12508/small/akash-logo.png',
    
    // Top 200 - Gaming adicionais
    ENJ: 'https://assets.coingecko.com/coins/images/1102/small/enjin-coin-logo.png',
    ILV: 'https://assets.coingecko.com/coins/images/14468/small/ilv.png',
    MAGIC: 'https://assets.coingecko.com/coins/images/18623/small/magic.png',
    
    // Top 200 - Outros importantes
    CHZ: 'https://assets.coingecko.com/coins/images/8834/small/Chiliz.png',
    SXP: 'https://assets.coingecko.com/coins/images/9368/small/swipe.png',
    ZEC: 'https://assets.coingecko.com/coins/images/476/small/zcash.png',
    DASH: 'https://assets.coingecko.com/coins/images/19/small/dash-logo.png',
    ETC: 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic.png',
    XMR: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
    ZEN: 'https://assets.coingecko.com/coins/images/691/small/horizen.png',
    WAVES: 'https://assets.coingecko.com/coins/images/425/small/waves.png',
    NEO: 'https://assets.coingecko.com/coins/images/480/small/neo.jpg',
    ZIL: 'https://assets.coingecko.com/coins/images/2687/small/Zilliqa-logo.png',
    IOTA: 'https://assets.coingecko.com/coins/images/701/small/iota-logo.png',
    
    // Top 200 - Mais tokens importantes (únicos que faltavam)
    LRC: 'https://assets.coingecko.com/coins/images/913/small/loopring.png',
    BAT: 'https://assets.coingecko.com/coins/images/677/small/basic-attention-token.png',
    ZRX: 'https://assets.coingecko.com/coins/images/863/small/0x.png',
    KNC: 'https://assets.coingecko.com/coins/images/14899/small/RwdzG8_n_400x400.jpg',
    APE: 'https://assets.coingecko.com/coins/images/24383/small/apecoin.png',
    GMT: 'https://assets.coingecko.com/coins/images/20360/small/gmt.png',
    USTC: 'https://assets.coingecko.com/coins/images/15462/small/ust.png',
    LUNA: 'https://assets.coingecko.com/coins/images/25767/small/luna.png',
    AXL: 'https://assets.coingecko.com/coins/images/27283/small/axelar.png',
    OSMO: 'https://assets.coingecko.com/coins/images/16724/small/osmo.png',
    JUNO: 'https://assets.coingecko.com/coins/images/19249/small/Juno_Logo.png',
    EVMOS: 'https://assets.coingecko.com/coins/images/24023/small/evmos.png',
    KUJI: 'https://assets.coingecko.com/coins/images/20685/small/kuji.png',
    SCRT: 'https://assets.coingecko.com/coins/images/11871/small/Secret.png',
    C98: 'https://assets.coingecko.com/coins/images/17117/small/icon.png',
    RAY: 'https://assets.coingecko.com/coins/images/13928/small/Raydium.png',
    ORCA: 'https://assets.coingecko.com/coins/images/17547/small/Orca_Logo.png',
    MNGO: 'https://assets.coingecko.com/coins/images/17103/small/mango.png',
    SAMO: 'https://assets.coingecko.com/coins/images/15060/small/samoyedcoin.png',
    COPE: 'https://assets.coingecko.com/coins/images/15223/small/cope.png',
    STEP: 'https://assets.coingecko.com/coins/images/14988/small/step.png',
    MEDIA: 'https://assets.coingecko.com/coins/images/15051/small/media.png',
    ROPE: 'https://assets.coingecko.com/coins/images/15050/small/rope.png',
    ATLAS: 'https://assets.coingecko.com/coins/images/14670/small/atlas.png',
    POLIS: 'https://assets.coingecko.com/coins/images/14671/small/polis.png',
    FORT: 'https://assets.coingecko.com/coins/images/14672/small/fort.png',
    CBK: 'https://assets.coingecko.com/coins/images/14673/small/cbk.png',
    TULIP: 'https://assets.coingecko.com/coins/images/15052/small/tulip.png',
    SLRS: 'https://assets.coingecko.com/coins/images/15053/small/slrs.png',
    PORT: 'https://assets.coingecko.com/coins/images/15054/small/port.png',
    DXL: 'https://assets.coingecko.com/coins/images/15055/small/dxl.png',
    LIQ: 'https://assets.coingecko.com/coins/images/15056/small/liq.png',
    
    // Top 200 - Mais tokens importantes adicionais (apenas únicos)
    // DeFi & Yield
    FXS: 'https://assets.coingecko.com/coins/images/13423/small/frax_share.png',
    CVX: 'https://assets.coingecko.com/coins/images/15585/small/convex.png',
    SPELL: 'https://assets.coingecko.com/coins/images/15861/small/abracadabra-3.png',
    ALUSD: 'https://assets.coingecko.com/coins/images/14114/small/alUSDd.png',
    GUSD: 'https://assets.coingecko.com/coins/images/5992/small/gemini-dollar-gusd.png',
    
    // Layer 1s & Smart Contracts
    CELO: 'https://assets.coingecko.com/coins/images/11090/small/icon-celo-CELO-color-500.png',
    FUSE: 'https://assets.coingecko.com/coins/images/10347/small/fuse.png',
    MOONBEAM: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png',
    MOONRIVER: 'https://assets.coingecko.com/coins/images/17984/small/movr.png',
    HARMONY: 'https://assets.coingecko.com/coins/images/4344/small/hbar.png',
    
    // Layer 2s & Scaling
    BOBA: 'https://assets.coingecko.com/coins/images/20285/small/BOBA.png',
    ZKSYNC: 'https://assets.coingecko.com/coins/images/24242/small/zksync.png',
    LOOPRING: 'https://assets.coingecko.com/coins/images/913/small/loopring.png',
    
    // Exchange Tokens (apenas os que não estão acima)
    FTT: 'https://assets.coingecko.com/coins/images/9026/small/F.png',
    GT: 'https://assets.coingecko.com/coins/images/7603/small/gt.png',
    KCS: 'https://assets.coingecko.com/coins/images/1047/small/kucoin.png',
    MX: 'https://assets.coingecko.com/coins/images/12340/small/mxc.png',
    
    // DeFi Protocols (apenas os que não estão acima)
    BADGER: 'https://assets.coingecko.com/coins/images/13287/small/badger_dao_logo.png',
    ALPHA: 'https://assets.coingecko.com/coins/images/12338/small/alpha-finance.png',
    CREAM: 'https://assets.coingecko.com/coins/images/11969/small/Cream.png',
    PICKLE: 'https://assets.coingecko.com/coins/images/12435/small/pickle_finance.png',
    
    // Gaming & Metaverse (apenas os que não estão acima)
    ENJIN: 'https://assets.coingecko.com/coins/images/1102/small/enjin-coin-logo.png',
    
    // Oracles & Data (apenas os que não estão acima)
    API3: 'https://assets.coingecko.com/coins/images/13256/small/api3.jpg',
    DIA: 'https://assets.coingecko.com/coins/images/11955/small/DIA-icon-colour_%281%29.png',
    
    // RWA & Tokenization
    RWA: 'https://assets.coingecko.com/coins/images/26580/small/ONDO.png',
  };

  useEffect(() => {
    const total = allocation.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(total);
  }, [allocation]);

  // Sincroniza quando a prop initialAllocation mudar (ex.: inicialização pelo parent)
  useEffect(() => {
    if (initialAllocation && initialAllocation.length > 0) {
      setAllocation(initialAllocation);
    }
  }, [initialAllocation]);

  // Buscar imagens dos tokens visíveis usando a API de busca (CoinGecko)
  useEffect(() => {
    const loadImages = async () => {
      const symbolsToFetch = allocation
        .map(a => a.token.toUpperCase())
        .filter(sym => !tokenImages[sym] && !FALLBACK_LOGOS[sym]);
      
      for (const sym of symbolsToFetch) {
        try {
          const resp = await fetch(`/api/search-coins?q=${encodeURIComponent(sym)}`);
          const data: AutocompleteOption[] = await resp.json();
          const match = data.find(d => d.symbol.toUpperCase() === sym);
          if (match?.image) {
            setTokenImages(prev => ({ ...prev, [sym]: match.image! }));
          } else {
            // Se não encontrar na busca, usa um placeholder
            setTokenImages(prev => ({ ...prev, [sym]: `https://ui-avatars.com/api/?name=${sym}&background=6366f1&color=fff&size=64&bold=true` }));
          }
        } catch {
          // Em caso de erro, usa placeholder
          setTokenImages(prev => ({ ...prev, [sym]: `https://ui-avatars.com/api/?name=${sym}&background=6366f1&color=fff&size=64&bold=true` }));
        }
      }
    };
    loadImages();
  }, [allocation, tokenImages]);

  const handlePercentageChange = (token: string, percentage: number) => {
    setAllocation(prev => 
      prev.map(item => 
        item.token === token 
          ? { ...item, percentage: Math.max(0, Math.min(100, percentage)) }
          : item
      )
    );
  };

  const sanitizeNumber = (value: string) => {
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search-coins?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Error searching coins:', error);
      setSearchResults([]);
    }
  };

  const addToken = (token: string) => {
    if (!allocation.find(item => item.token === token)) {
      setAllocation(prev => [...prev, { token, percentage: 0 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const removeToken = (token: string) => {
    // Permitir remover QUALQUER token, inclusive os pré-definidos
    setAllocation(prev => prev.filter(item => item.token !== token));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      alert('A soma das porcentagens deve ser exatamente 100%');
      return;
    }

    onSubmit(allocation);
  };

  const distributeEvenly = () => {
    const count = allocation.length;
    if (count === 0) return;
    const even = Math.floor((100 / count) * 10) / 10;
    const remainder = Math.round((100 - even * count) * 10) / 10;
    const updated = allocation.map((item, idx) => ({
      ...item,
      percentage: idx === 0 ? even + remainder : even,
    }));
    setAllocation(updated);
  };

  return (
    <div className="glass-card rounded-3xl shadow-2xl p-8 card-hover">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Como está sua carteira de cripto hoje?
        </h2>
        <p className="text-gray-600">
          Informe a porcentagem de cada ativo no seu portfólio
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 text-center">
        {/* Token Allocation */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allocation.map((item, idx) => (
            <div key={item.token} className="relative group">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-violet-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <img
                      src={FALLBACK_LOGOS[item.token.toUpperCase()] || tokenImages[item.token.toUpperCase()] || `https://ui-avatars.com/api/?name=${item.token}&background=6366f1&color=fff&size=64&bold=true`}
                      alt={`${item.token} logo`}
                      className="relative w-12 h-12 rounded-full object-contain bg-white p-1.5 shadow-lg ring-2 ring-gray-200 group-hover:ring-violet-400 transition-all duration-300"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        // Se já tentou o fallback, usar UI Avatars
                        if (target.src.includes('ui-avatars.com')) {
                          return; // Evitar loop infinito
                        }
                        // Tentar buscar via API do CoinGecko se não estiver no fallback
                        const tokenUpper = item.token.toUpperCase();
                        if (!FALLBACK_LOGOS[tokenUpper] && !tokenImages[tokenUpper]) {
                          // Fallback final: placeholder com letra do token
                          target.src = `https://ui-avatars.com/api/?name=${item.token}&background=6366f1&color=fff&size=64&bold=true`;
                        } else {
                          // Se estava no fallback mas falhou, tentar UI Avatars
                          target.src = `https://ui-avatars.com/api/?name=${item.token}&background=6366f1&color=fff&size=64&bold=true`;
                        }
                      }}
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-800 tracking-wide">
                    <TokenLink symbol={item.token} />
                  </label>
                  <div className="relative w-full">
                    <input
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      placeholder="0"
                      value={item.percentage === 0 ? '' : item.percentage}
                      onChange={(e) => handlePercentageChange(item.token, sanitizeNumber(e.target.value))}
                      onBlur={(e) => { if (e.currentTarget.value === '') handlePercentageChange(item.token, 0); }}
                      className="w-full pr-8 pl-4 py-2.5 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-300"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm font-medium">%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeToken(item.token)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                  aria-label={`Remover ${item.token}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Add Token Search */}
        <div className="relative">
          <button
            type="button"
            onClick={async () => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                try {
                  const resp = await fetch('/api/search-coins?top=true');
                  const data = await resp.json();
                  setSearchResults(data);
                } catch {}
              }
            }}
            className="mx-auto group flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Adicionar outro ativo</span>
          </button>
          
          {showSearch && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-4 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-slide-down">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b-2 border-gray-200">
                <input
                  type="text"
                  placeholder="🔍 Digite o símbolo do token..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-300"
                  autoFocus
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {searchResults.map((option) => (
                      <button
                        key={option.symbol}
                        type="button"
                        onClick={() => addToken(option.symbol)}
                        className="p-3 text-left hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-violet-200 group"
                      >
                        <div className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{option.symbol}</div>
                        <div className="text-sm text-gray-600 truncate">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-8 text-gray-500 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nenhum token encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total Percentage */}
        <div className="mx-auto max-w-md">
          <div className={`flex justify-between items-center p-6 rounded-2xl transition-all duration-300 ${
            Math.abs(totalPercentage - 100) < 0.1 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'
          }`}>
            <span className="font-bold text-gray-800 text-lg">Total:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-3xl ${
                Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalPercentage.toFixed(1)}%
              </span>
              {Math.abs(totalPercentage - 100) < 0.1 ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Ações removidas conforme solicitado */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={Math.abs(totalPercentage - 100) > 0.1}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
          Continuar para Quiz de Perfil
        </button>
      </form>
    </div>
  );
}
