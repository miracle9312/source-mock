### 网络服务与安全

#### tcp服务
#### ssl
 - 如何进行数据加密：服务端和客户端都有一把私钥和公钥，私钥和公钥之间遵循非对称加密，
 由私钥加密的数据，只有对应的公钥匙才能进行解密，
 - 存在的问题：中间人攻击，中间人对与客户端伪装成服务端，将对于服务端伪装成客户端，这样
 就能接受服务端于客户端之间传输的所有数据。
 - ca证书：为了解决中间人攻击问题，需要对服务端进行身份验证，证明公钥属于对应的服务端。由服务端
 生成私钥，再通过私钥生成csr文件，向ca机构申请证书，在客户端和服务端建立连接时，服务端会将
 该证书传递给客户端，客户端通过预装在浏览器上的ca验证证书，如果通过则开始数据传递。
 
 #### https
 如何创建https连接
 - https服务端
 ```js
 var https = require('https');
 var fs = require('fs');
 var options = {
   key: fs.readFileSync('./keys/server.key'),
   cert: fs.readFileSync('./keys/server.crt')
 };
 https.createServer(options, function (req, res) {
   res.writeHead(200);
   res.end("hello world\n");
 }).listen(8000);
 ```
 - https客户端
 ```js
var https = require('https');
var fs = require('fs');
var options = {
  hostname: 'localhost',
  port: 8000,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('./keys/client.key'),
  cert: fs.readFileSync('./keys/client.crt'),
  ca: [fs.readFileSync('./keys/ca.crt')]
};
options.agent = new https.Agent(options);
var req = https.request(options, function(res) {
  res.setEncoding('utf-8');
  res.on('data', function(d) {
    console.log(d);
  });
});
req.end();
req.on('error', function(e) {
  console.log(e);
});
```
