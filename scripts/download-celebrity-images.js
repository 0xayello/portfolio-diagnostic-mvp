const https = require('https');
const fs = require('fs');
const path = require('path');

const celebrities = [
  {
    name: 'saylor',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Michael_Saylor_2021.jpg/800px-Michael_Saylor_2021.jpg'
  },
  {
    name: 'vitalik',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/800px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg'
  },
  {
    name: 'cz',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Changpeng_Zhao_%28CZ%29_at_Token2049_%28cropped%29.jpg/800px-Changpeng_Zhao_%28CZ%29_at_Token2049_%28cropped%29.jpg'
  },
  {
    name: 'hayes',
    url: 'https://pbs.twimg.com/profile_images/1234567890/arthur_hayes.jpg' // Placeholder - vamos usar uma URL alternativa
  },
  {
    name: 'balaji',
    url: 'https://pbs.twimg.com/profile_images/1234567890/balaji.jpg' // Placeholder
  },
  {
    name: 'cronje',
    url: 'https://pbs.twimg.com/profile_images/1234567890/cronje.jpg' // Placeholder
  },
  {
    name: 'ulrich',
    url: 'https://pbs.twimg.com/profile_images/1234567890/ulrich.jpg' // Placeholder
  }
];

// URLs alternativas usando Unsplash ou outras fontes públicas
const alternativeUrls = {
  hayes: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  balaji: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  cronje: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  ulrich: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public', 'celebrities');
  
  // Criar diretório se não existir
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Baixando imagens das celebridades...\n');

  for (const celeb of celebrities) {
    const filepath = path.join(publicDir, `${celeb.name}.jpg`);
    
    // Se já existe, pular
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${celeb.name}.jpg já existe, pulando...`);
      continue;
    }

    try {
      // Tentar URL principal primeiro
      let url = celeb.url;
      
      // Se a URL parece ser placeholder, usar alternativa
      if (url.includes('pbs.twimg.com/profile_images/1234567890')) {
        url = alternativeUrls[celeb.name] || celeb.url;
      }

      console.log(`Baixando ${celeb.name}...`);
      await downloadImage(url, filepath);
      console.log(`✓ ${celeb.name}.jpg baixado com sucesso!\n`);
    } catch (error) {
      console.error(`✗ Erro ao baixar ${celeb.name}: ${error.message}`);
      
      // Tentar URL alternativa se disponível
      if (alternativeUrls[celeb.name]) {
        try {
          console.log(`Tentando URL alternativa para ${celeb.name}...`);
          await downloadImage(alternativeUrls[celeb.name], filepath);
          console.log(`✓ ${celeb.name}.jpg baixado com sucesso (URL alternativa)!\n`);
        } catch (altError) {
          console.error(`✗ Erro também na URL alternativa: ${altError.message}\n`);
        }
      }
    }
  }

  console.log('Concluído!');
  console.log('\nNota: Guiriba e Chico não terão fotos (usarão fallback de iniciais).');
}

main().catch(console.error);
