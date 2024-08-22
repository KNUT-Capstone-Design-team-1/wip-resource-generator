import path from "path";
import fs from "fs";
import crypto from "crypto";
import secret from "../secret.json";

export class ResourceDecryptor {
  private readonly encryptedResPath: string;
  private readonly drugRecognitionEncryptPath: string;
  private readonly finishedMedicinePermissiondetailsEncryptPath: string;

  constructor() {
    this.encryptedResPath = path.join(__dirname, `../encrypted_res`);

    this.drugRecognitionEncryptPath = path.join(
      this.encryptedResPath,
      "/drug_recognition"
    );

    this.finishedMedicinePermissiondetailsEncryptPath = path.join(
      this.encryptedResPath,
      "/finisihed_medecine_permission_details"
    );
  }

  public async decrypt() {
    const pathList = this.getPathList();

    for await (const resourcePath of pathList) {
      const decryptedData = this.decryptResourceData(resourcePath);

      const decryptedFileName = path.join(
        __dirname,
        `../decrypted_res/${resourcePath.split("\\").pop()}.json`
      );

      fs.writeFileSync(decryptedFileName, decryptedData);
    }
  }

  private getPathList() {
    return [
      this.drugRecognitionEncryptPath,
      this.finishedMedicinePermissiondetailsEncryptPath,
    ];
  }

  private decryptResourceData(resourcePath: string) {
    const { aesKey, aesIv } = secret;

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(aesKey, "hex"),
      Buffer.from(aesIv, "hex")
    );

    const encryptedResourceData = fs.readFileSync(resourcePath);

    return decipher.update(encryptedResourceData.toString(), "base64", "utf-8");
  }
}
