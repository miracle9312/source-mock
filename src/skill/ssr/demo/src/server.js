const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express();
const {createBundleRenderer} = require('vue-server-renderer');
const serverBundle = path.resolve(process.cwd(), 'serverDist', 'vue-ssr-server-bundle.json');
const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
const clientManifestPath = path.resolve(process.cwd(), 'dist', 'vue-ssr-client-manifest.json');
const clientManifest = JSON.parse(fs.readFileSync(clientManifestPath, 'utf-8'));
const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
});

app.use(express.static(path.resolve(process.cwd(), 'dist')));

app.get('/', (req, res)=> {
  renderer.renderToString({}, (err, html) => {
    if (err) {
      console.log(err);
      res.send('500 server error');
      return;
    }
    res.send(html);
  })
})

app.listen('3001', ()=>{
  console.log('server start on 3001')
})
