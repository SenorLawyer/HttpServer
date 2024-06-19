import * as net from "node:net";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const dirIndex = args.indexOf("--directory");
if (dirIndex === -1 || dirIndex + 1 >= args.length) {
  console.error("Usage: ./your_server.sh --directory <directory>");
  process.exit(1);
}
const filesDirectory = args[dirIndex + 1];

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const [method, requestPath] = request.split(" ");
    const parts = requestPath.split("/");

    let response: string;

    function changeResponse(response: string): void {
      socket.write(response);
      socket.end();
    }

    if (method !== "GET") {
      response = "HTTP/1.1 405 Method Not Allowed\r\n\r\n";
      changeResponse(response);
      return;
    }

    switch (parts[1]) {
      case "": {
        response = "HTTP/1.1 200 OK\r\n\r\n";
        changeResponse(response);
        break;
      }

      case "echo": {
        const message = parts[2];
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
        changeResponse(response);
        break;
      }

      case "user-agent": {
        const userAgent = request.split("User-Agent: ")[1].split("\r\n")[0];
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        changeResponse(response);
        break;
      }

      case "files": {
        const filename = parts.slice(2).join("/");
        const filePath = path.join(filesDirectory, filename);

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
            changeResponse(response);
            return;
          }

          fs.readFile(filePath, (err, content) => {
            if (err) {
              response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
              changeResponse(response);
              return;
            }

            response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n`;
            socket.write(response);
            socket.write(content);
            socket.end();
          });
        });
        break;
      }

      default: {
        response = "HTTP/1.1 404 Not Found\r\n\r\n";
        changeResponse(response);
        break;
      }
    }
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
