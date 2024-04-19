import { getRejections } from "./get.rejections";
import { validateEmail, validateNonEmpty } from "./validators";

const server = Bun.serve({
  port: 5678,
  async fetch(req: Request) {
    const authorization = req.headers.get("Authorization");
    const token = authorization?.split("Bearer ")[1];
    if (token !== "abc123") {
      return new Response("Unauthorized", { status: 401 });
    }

    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    if (req.method.toUpperCase() === "OPTIONS") {
      // Preflight request
      return new Response(null, { headers, status: 200 });
    }

    try {
      const body = await req.json();
      const url = new URL(req.url);

      if (url.pathname === "/reject-non-flatfile-emails") {
        const rejections = getRejections(body, validateEmail);
        const responseBody = JSON.stringify(
          {
            rejections,
          },
          null,
          2
        );
        return new Response(responseBody, { headers, status: 200 });
      }

      if (url.pathname === "/reject-empty-cells") {
        const rejections = getRejections(body, validateNonEmpty);
        const responseBody = JSON.stringify(
          {
            rejections,
          },
          null,
          2
        );
        return new Response(responseBody, { headers, status: 200 });
      }
    } catch (e) {
      console.log(e);
      return new Response("Failure", { headers, status: 400 });
    }

    return new Response("Success", { headers, status: 200 });
  },
});

console.log(`Listening on http://${server.hostname}:${server.port} ...`);
