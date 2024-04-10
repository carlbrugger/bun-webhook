import { validateEmail, validateNonEmpty } from "./validators";

interface PartialRejection {
  id: string;
  deleteSubmitted?: boolean;
  message?: string;
  rejectedRecords: RecordError[];
}

interface RecordError {
  id: string;
  values: { field: string; message: string }[];
}

const getRejections = (body: any, validator: any) => {
  const sheet = body.sheet;
  const rejectedRecords: RecordError[] = [];
  sheet.records.forEach((record: any) => {
    for (const [field, cell] of Object.entries(record.values)) {
      const message = validator(field, cell.value);
      if (message) {
        rejectedRecords.push({
          id: record.id,
          values: [
            {
              field,
              message,
            },
          ],
        });
      }
    }
  });

  const rejections: PartialRejection = {
    id: sheet.id,
    // message: "Success! All records are valid.",
    deleteSubmitted: true,
    rejectedRecords,
  };
  console.log("rejections", rejections.rejectedRecords.length);

  // if (rejections.sheets.some((sheet) => sheet.rejectedRecords.length > 0)) {
  //   rejections.message = "Some records are invalid.";
  // }
  return rejections;
};

const server = Bun.serve({
  port: 5678,
  async fetch(req: Request) {
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
