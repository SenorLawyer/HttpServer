import * as net from "net";

const server = net.createServer((socket: any) => {
  socket.on("data", (data: any) => {
    const dataStr = data.toString();
    const path = dataStr.split("\r\n")[0].split(" ")[1];
    const query = path.split("/")[2];

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path === "/user-agent") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${socket.remoteAddress.length}\r\n\r\n${socket.remoteAddress}`
      );
    } else if (path === `/echo/${query}`) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${query.length}\r\n\r\n${query}`
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    console.log("Client diconnecting");
    socket.end();
  });
});

server.listen(4221, "localhost", () => console.log("Server is running on port 4221"));
