import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const path = request.split(" ")[1];

    console.log(`Request: ${path}`);

    let response = "HTTP/1.1 404 Not Found\r\n\r\n";
    if (path === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (path.startsWith("/echo/") && path.length > 6) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${
        path.length - 6
      }\r\n\r\n${path.slice(6)}`;
    }

    socket.write(response);
    socket.end();
  });
});

server.listen(4221, "localhost", () => console.log("Server is running on port 4221"));
