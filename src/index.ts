import "dotenv/config";
import { ResourceGenerator } from "./resource_generator";
import { testResourceFile } from "./test";

async function main() {
  const mode = process.env.MODE;

  if (mode === "test") {
    await testResourceFile();
    return;
  }

  const resourceGenerator = new ResourceGenerator();
  await resourceGenerator.generate();
}

main();
