# bun-webhook

This project is a webhook receiver for testing the `@flatfile/plugin-partial-rejection-handler`. There are two endpoints that will provide validation of records. The `http://localhost:1234/reject-non-flatfile-emails` endpoint checks for that do not end in `@flatfile.io`. The `http://localhost:1234/reject-empty-cells` endpoint checks for empty cells. Both endpoints will return the offending record ids along with an error message.

## Usage

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start:watch
```

This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
