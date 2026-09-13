const https = require('https');
const fs = require('fs');

async function downloadLogo() {
  // GEMS Education Logo from Wikimedia
  const url = 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/GEMS_Education_logo.svg/1200px-GEMS_Education_logo.svg.png';
  
  https.get(url, (res) => {
    const file = fs.createWriteStream('public/al_warqaa_logo.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Logo downloaded successfully!');
    });
  }).on('error', (err) => {
    console.error('Error downloading logo:', err);
  });
}

downloadLogo();
