import * as net from "net";
import { argv } from "process";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as zlib from "zlib";

const directory = process.argv[3];

const server = net.createServer((socket: net.Socket) => {
  socket.on("data", (data) => {
    console.log(data);
    console.log(data.toString());

    const [method, path, version] = data.toString().split("\r\n")[0].split(" ");

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo/")) {
      const message = path.split("/")[2];
      const reqBody = data.toString().split("\r\n");
      const encoding = reqBody.filter((header) => header.includes("Accept-Encoding"));
      const acceptEncoding = encoding.length > 0 ? encoding[0].split(": ")[1] : "";

      const buffer = Buffer.from(message, "utf8");
      const zipped = zlib.gzipSync(buffer);

      if (acceptEncoding.includes("gzip")) {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${message.length}\r\n\r\n${message}`
        );

        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${zipped.length}\r\n\r\n`
        );

        socket.write(zipped);
      } else {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`
        );
      }
    } else if (path === "/user-agent") {
      const userAgent = data
        .toString()
        .split("\r\n")
        .filter((header) => header.includes("User-Agent"))[0]
        .split(": ")[1];

      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else if (path.startsWith("/files/") && method == "POST") {
      const fileName = path.split("/")[2];
      const parts = data.toString().split("\r\n\r\n");
      const reqBody = parts.pop();

      writeFile(fileName, reqBody || "");

      socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
    } else if (path.startsWith("/files/")) {
      const fileName = path.split("/")[2];
      const dir = argv[argv.length - 1];

      try {
        const file = readFileSync(`${dir}/${fileName}`, "utf8");

        if (file) {
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${file.length}\r\n\r\n${file}`
          );
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } catch {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });
});

function writeFile(filename: string, contents: string) {
  writeFileSync(path.join(directory, filename), contents);
}

server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
