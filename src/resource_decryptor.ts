import path from "path";
import fs from "fs";
import crypto from "crypto";
import secret from "../secret.json";

export class ResourceDecryptor {
  private readonly drugRecognitionDirName: string;
  private readonly finishedMedicinePermissionDetailsDirName: string;

  constructor() {
    this.drugRecognitionDirName = "drug_recognition";
    this.finishedMedicinePermissionDetailsDirName =
      "finisihed_medecine_permission_details";
  }

  public async decrypt() {
    for await (const resourcePath of this.getPathList()) {
      const fileList = this.getFileList(resourcePath);
      if (fileList.length === 0) {
        continue;
      }

      await this.createDecryptedResourceFiles(resourcePath, fileList);
    }
  }

  private getPathList() {
    const defaultRelativePath = "../encrypted_res";

    return [
      path.join(
        __dirname,
        `${defaultRelativePath}/${this.drugRecognitionDirName}`
      ),
      path.join(
        __dirname,
        `${defaultRelativePath}/${this.finishedMedicinePermissionDetailsDirName}`
      ),
    ];
  }

  private getFileList(resourcePath: string) {
    return fs.existsSync(resourcePath) ? fs.readdirSync(resourcePath) : [];
  }

  private async createDecryptedResourceFiles(
    resourcePath: string,
    fileList: string[]
  ) {
    for await (const fileName of fileList) {
      const directoryPath = path.join(
        __dirname,
        `../decrypted_res/${resourcePath.split("\\").pop()}`
      );

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }

      const decryptedFileName = path.join(directoryPath, `${fileName}.json`);

      const encryptedResourceData = this.getEncryptedResourceData(
        resourcePath,
        fileName
      );
      const decryptedResourceData = this.decryptData(encryptedResourceData);

      fs.writeFileSync(decryptedFileName, decryptedResourceData);
    }
  }

  private getEncryptedResourceData(resourcePath: string, fileName: string) {
    const enCryptedDirectoryPath = path.join(
      __dirname,
      `../encrypted_res/${resourcePath.split("\\").pop()}`
    );

    return fs
      .readFileSync(path.join(enCryptedDirectoryPath, fileName))
      .toString();
  }

  private decryptData(encryptedResourceData: string) {
    const { aesKey, aesIv } = secret;

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(aesKey, "hex"),
      Buffer.from(aesIv, "hex")
    );

    return decipher.update(encryptedResourceData, "base64", "utf-8");
  }
}
