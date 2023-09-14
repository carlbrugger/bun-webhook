interface PartialRejection {
  sheets: Sheet[];
}

interface Sheet {
  id: string;
  name: string;
  rejectedRecords: RecordError[];
}

interface RecordError {
  id: string;
  values: { field: string; message: string }[];
}

const validateEmail = (field: string, value: string) => {
  const validEmailAddress = /^[^\s@]+@flatfile.io$/i;
  if (field === "email" && value && !validEmailAddress.test(value)) {
    return "Not a valid Flatfile email address";
  }
  return null;
};

const validateNonEmpty = (field: string, value: string) => {
  if (!value) {
    return "Cannot be empty";
  }
  return null;
};

const getRejections = (body: any, validator: any) => {
  const rejections: PartialRejection = { sheets: [] };
  body.workbook.sheets.forEach((sheet: any) => {
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
    rejections.sheets.push({
      id: sheet.id,
      name: sheet.name,
      rejectedRecords,
    });
  });
  return rejections;
};

const server = Bun.serve({
  port: 1234,
  async fetch(req: Request) {
    const body = await req.json();
    console.log("------------------- Request ------------------");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(body, null, 2));

    let responseBody = "Success!";
    const url = new URL(req.url);
    if (url.pathname === "/reject-non-flatfile-emails") {
      const rejections = getRejections(body, validateEmail);
      console.log(rejections);
      responseBody = JSON.stringify(
        {
          rejections,
        },
        null,
        2
      );
    }
    if (url.pathname === "/reject-empty-cells") {
      const rejections = getRejections(body, validateNonEmpty);
      console.log(rejections);
      responseBody = JSON.stringify(
        {
          rejections,
        },
        null,
        2
      );
    }

    return new Response(responseBody);
  },
});

console.log(`Listening on http://${server.hostname}:${server.port} ...`);
