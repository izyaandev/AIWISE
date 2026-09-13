const https = require('https');
const fs = require('fs');

async function searchDuckDuckGo() {
  const query = encodeURIComponent('GEMS Our Own English High School logo png');
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Very naive regex to find an image URL
      const matches = data.match(/<img[^>]+src="([^">]+)"/g);
      if (matches) {
        for (let m of matches) {
          let imgUrl = m.match(/src="([^">]+)"/)[1];
          if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
          if (!imgUrl.includes('.ico')) {
            console.log('Found image URL:', imgUrl);
            break;
          }
        }
      } else {
        console.log('No image found on DDG HTML page.');
      }
    });
  }).on('error', err => console.error(err));
}

searchDuckDuckGo();
