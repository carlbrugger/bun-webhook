import type { Flatfile } from "@flatfile/api";

// Soon available on @flatfile/plugin-webhook-egress
export interface SheetExport extends Flatfile.Sheet {
  records: Flatfile.Record_[];
}

export interface PartialRejection {
  id: string;
  deleteSubmitted?: boolean;
  message?: string;
  rejectedRecords: RecordError[];
}

export interface RecordError {
  id: string;
  values: { field: string; message: string }[];
}

export const getRejections = (body: any, validator: any) => {
  const sheet: SheetExport = body.sheet;
  const rejectedRecords: RecordError[] = [];

  sheet.records.forEach((record: Flatfile.Record_) => {
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
    // deleteSubmitted: true,
    rejectedRecords,
  };
  console.log("rejections", rejections.rejectedRecords.length);

  // if (rejections.sheets.some((sheet) => sheet.rejectedRecords.length > 0)) {
  //   rejections.message = "Some records are invalid.";
  // }
  return rejections;
};
