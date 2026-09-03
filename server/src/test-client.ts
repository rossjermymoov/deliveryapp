import http from 'http';

http.get('http://127.0.0.1:4000/api/depots', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data.substring(0, 300));
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
