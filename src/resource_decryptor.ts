import path from "path";
import fs from "fs";

export class ResourceDecryptor {
  private readonly encryptedResPath: string;
  private readonly drugrecognitionResFileName: string;
  private readonly finishedMedicinePermissiondetailsFileName: string;

  constructor() {
    this.encryptedResPath = path.join(__dirname, `../encrypted_res`);
    this.drugrecognitionResFileName = "drug_recognition";
    this.finishedMedicinePermissiondetailsFileName = "finisihed_medecine_permission_details";
  }

  public decrypt() {
    const encryptedResource = fs.readFileSync(this.encryptedResPath);
  }
}
