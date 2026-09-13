const https = require('https');
const fs = require('fs');

async function downloadAndConvert() {
  const url = 'https://www.gemsoo-dubai.com/-/media/project/gems/ood_gems_our_own_english_high_school_dubai/_design-images/ood_logo_jan2018_ot.svg';
  const svgPath = 'public/logo.svg';
  
  https.get(url, (res) => {
    const file = fs.createWriteStream(svgPath);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('SVG downloaded.');
      
      const sharp = require('sharp');
      sharp(svgPath)
        .png()
        .toFile('public/al_warqaa_logo.png')
        .then(() => {
          console.log('Converted to PNG!');
        })
        .catch(err => {
          console.error('Error converting to PNG:', err);
        });
    });
  });
}

downloadAndConvert();
