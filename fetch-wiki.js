const https = require('https');

const options = {
  hostname: 'en.wikipedia.org',
  path: '/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=Our_Own_English_High_School',
  headers: {
    'User-Agent': 'NodeJS/1.0 (test@example.com)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const pages = json.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pages[pageId].original) {
        console.log('Wiki Image:', pages[pageId].original.source);
      } else {
        console.log('No image found on Wiki.');
      }
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
}).on('error', err => console.error(err));
