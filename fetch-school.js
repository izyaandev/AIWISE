const https = require('https');

https.get('https://www.gemsoo-dubai.com', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<img[^>]+src=["']([^"']+)["']/g);
    if (matches) {
      matches.forEach(m => {
        if (m.toLowerCase().includes('logo')) {
          console.log(m);
        }
      });
    } else {
      console.log('No images found.');
    }
  });
}).on('error', err => console.error(err));
