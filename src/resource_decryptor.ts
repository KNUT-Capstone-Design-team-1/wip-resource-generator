import path from "path";
import fs from "fs";
import crypto from "crypto";

export class ResourceDecryptor {
  public async decrypt() {
    const resourcePath = path.join(__dirname, "../encrypted_res");

    const fileList = fs.existsSync(resourcePath)
      ? fs.readdirSync(resourcePath)
      : [];

    if (fileList.length === 0) {
      return;
    }

    await this.createDecryptedResourceFiles(fileList);
  }

  private async createDecryptedResourceFiles(
    fileList: string[]
  ) {
    const directoryPath = path.join(__dirname, `../decrypted_res`);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    for await (const fileName of fileList) {
      const resultFileName = path.join(
        directoryPath,
        `${fileName.split('.')[0]}.json`
      );

      const decryptedResourceData = this.decryptData(
        fs.readFileSync(path.join(__dirname, `../encrypted_res/${fileName}`), "utf8")
      );

      fs.writeFileSync(resultFileName, decryptedResourceData);
    }
  }

  private decryptData(encryptedResourceData: string) {
    const { RESOURCE_AES_KEY, RESOURCE_AES_IV } = process.env;

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(RESOURCE_AES_KEY as string, "hex"),
      Buffer.from(RESOURCE_AES_IV as string, "hex")
    );

    // https://stackoverflow.com/questions/62813904/node-js-decipher-final-throws-wrong-final-block-length-error
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedResourceData, "hex")),
      decipher.final(),
    ]);
  }
}
