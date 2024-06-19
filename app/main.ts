import * as net from "net";

const server = net.createServer((socket) => {
  console.log(socket.remoteAddress, "connected");
  socket.write("HTTP/1.1 404 OK\r\n\r\n");
  socket.end();
});

server.listen(4221, "localhost");
