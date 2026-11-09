import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiBaseUrl =
    process.env.VITE_API_BASE_URL || "http://localhost:8000";

const schemaUrl = `${apiBaseUrl.replace(/\/+$/, "")}/openapi.json`;

// Resolve the OpenAPI CLI directly.
const cliPath = fileURLToPath(
    new URL("../node_modules/openapi-typescript/bin/cli.js", import.meta.url)
);

console.log(`Generating API schema from: ${schemaUrl}`);

const result = spawnSync(
    process.execPath,
    [
        cliPath,
        schemaUrl,
        "-o",
        "src/api/schema.d.ts",
    ],
    {
        stdio: "inherit",
    }
);

if (result.error) {
    console.error("Failed to generate API schema:", result.error);
    process.exit(1);
}

process.exit(result.status ?? 1);