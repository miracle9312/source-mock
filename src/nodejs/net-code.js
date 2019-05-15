const net = require("net");

const server = net.createServer();

server.on("connection", function (socket) {
  socket.on("data", function (data) {
    socket.write("你好");
  });
  socket.on("end", function () {
    console.log("连接断开");
  });
  socket.write("欢迎光临《深入浅出Node.js》");
});
server.listen(8124, () => {
  console.log("server start on 8124");
});
