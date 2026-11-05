import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const failures = [];
for (const file of tracked) {
  if ((/(^|\/)\.env(?:\.|$)/.test(file) && file !== ".env.example") || /\.(pem|key|p12|pfx)$/.test(file)) failures.push(`private file tracked: ${file}`);
}
const secretPatterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bgithub_pat_[A-Za-z0-9_]{40,}\b/, /\b\d{8,12}:[A-Za-z0-9_-]{35}\b/];
async function inspect(file, client = false) {
  const text = await readFile(file, "utf8");
  if (secretPatterns.some((pattern) => pattern.test(text))) failures.push(`possible credential: ${file}`);
  if (client && /TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|TURNSTILE_SECRET_KEY|api\.telegram\.org\/bot/.test(text)) failures.push(`server integration leaked to client: ${file}`);
}
const source = tracked.filter((file) => /^(src|public)\//.test(file));
for (const file of tracked.filter((file) => !file.endsWith(".svg"))) await inspect(file);
for (const file of source) {
  const text = await readFile(file, "utf8");
  // JSX object props also use {{...}}; scan copy files for unresolved template
  // syntax and code for explicit replacement tokens, not valid React syntax.
  if (/lorem ipsum|TODO|FIXME|\{\{[A-Z_][A-Z0-9_ ]*\}\}/i.test(text) || (file.endsWith(".json") && /\{\{[^}]+\}\}/.test(text))) failures.push(`unresolved content: ${file}`);
  if (file === "src/i18n/messages/uk.json" && /(?<!\p{L})(забери|обери|тобі|твоя|твій|твої)(?!\p{L})/iu.test(text)) failures.push(`informal Ukrainian: ${file}`);
}
async function clientFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await clientFiles(file));
    else if (/\.(js|html|json)$/.test(file)) files.push(file);
  }
  return files;
}
const client = await clientFiles(".next/static");
for (const file of client) await inspect(file, true);
const localEnvPresent = await stat(".env.local").then(() => true, () => false);
console.log(JSON.stringify({ trackedFiles: tracked.length, contentFiles: source.length, clientFiles: client.length, localEnvPresent, failures }, null, 2));
if (failures.length) process.exitCode = 1;
