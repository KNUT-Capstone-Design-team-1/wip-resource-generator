import { ResourceGenerator } from "./resource_generator";
import { ResourceDecryptor } from "./resource_decryptor";

async function main() {
  const isDecrypt = process.argv[2] === 'decrypt';

  if (isDecrypt) {
    const resourceDecryptor = new ResourceDecryptor();
    await resourceDecryptor.decrypt();
  } else {
    const resourceGenerator = new ResourceGenerator();
    await resourceGenerator.generate();
  }
}

main();
