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

function (req, res) {
  const id = req.cookie["session_id"];

  if(id) {
    const session = sessions[id];
    if(session.cookie.expire > (new Date()).getTime()) {//未超时
      // 更新过期时间
      session.cookie.expire = (new Date()).getTime() + EXPIRE_TIME;
      // 设置session
      res.session = session;
    }else {// 超时
      delete sessions[id];
      res.session = session;
    }
  }else {
    res.session = generate();
  }
}
