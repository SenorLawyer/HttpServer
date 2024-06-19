import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const path = request.split(" ")[1];

    const response =
      path.startsWith("/") && path.length > 1
        ? "HTTP/1.1 200 OK\r\n\r\n"
        : "HTTP/1.1 404 Not Found\r\n\r\n";

    socket.write(response);
    socket.end();
  });
});

server.listen(4221, "localhost", () => console.log("Server is running on port 4221"));
