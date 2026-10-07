import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dappDirectory = fileURLToPath(new URL("../dapp/", import.meta.url));
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const file = files.get(pathname);
  if (!file) {
    response.writeHead(404).end("Not found");
    return;
  }

  try {
    const content = await readFile(join(dappDirectory, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Content-Length": content.length,
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    console.error(`Unable to serve ${pathname}:`, error);
    response.writeHead(500).end("Unable to load the DApp.");
  }
});

server.on("error", (error) => {
  console.error("The DApp server could not start:", error);
  process.exitCode = 1;
});

server.listen(4173, "127.0.0.1", () => {
  console.log("BCA Results DApp available at http://127.0.0.1:4173");
});
