import path from "path";
import fs from "fs";
import xlsParser from "simple-excel-to-json";
import iconvLite from "iconv-lite";
import { Converter } from "csvtojson/v2/Converter";
import crypto from "crypto";

export class ResourceGenerator {
  private readonly drugRecognitionDirName: string;
  private readonly finishedMedicinePermissionDetailsDirName: string;

  constructor() {
    this.drugRecognitionDirName = "drug_recognition";
    this.finishedMedicinePermissionDetailsDirName =
      "finished_medecine_permission_details";
  }

  public async generate() {
    console.log("Start resource generate");

    for await (const resourcePath of this.getPathList()) {
      const fileList = this.getFileList(resourcePath);
      if (fileList.length === 0) {
        continue;
      }

      await this.createEncryptedResourceFiles(resourcePath, fileList);
    }
  }

  private getPathList() {
    const defaultRelativePath = "../res";

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

  private async createEncryptedResourceFiles(
    resourcePath: string,
    fileList: string[]
  ) {
    for await (const fileName of fileList) {
      const jsonDatas = await this.convertExcelToJSON(
        `${resourcePath}/${fileName}`
      );

      if (jsonDatas.length === 0) {
        continue;
      }

      console.log(`Create resource file from ${fileName}`);

      const directoryPath = path.join(
        __dirname,
        `../encrypted_res/${resourcePath.split("\\").pop()}`
      );

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const resultFileName = path.join(directoryPath, fileName.split(".")[0]);
      const encryptedData = this.encryptData(jsonDatas);

      fs.writeFileSync(resultFileName, encryptedData.toString("hex"), "utf8");
    }
  }

  private async convertExcelToJSON(fileName: string) {
    const fileExtension = fileName.split(".").slice(-1)[0];

    switch (fileExtension) {
      case "xlsx":
      case "xls":
        return this.convertXLSToJSON(fileName);

      case "csv":
        return this.convertCSVToJSON(fileName);

      default:
        throw new Error(`Invalid file extension ${fileExtension}`);
    }
  }

  private async convertXLSToJSON(fileName: string) {
    const doc: { flat: () => object[] } = xlsParser.parseXls2Json(fileName);
    return doc.flat();
  }

  private async convertCSVToJSON(fileName: string) {
    const csvString = iconvLite.decode(fs.readFileSync(fileName), "euc-kr");
    const rows: Array<Object> = await new Converter().fromString(csvString);
    return rows;
  }

  private encryptData(resourceData: Object) {
    const { RESOURCE_AES_KEY, RESOURCE_AES_IV } = process.env;

    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(RESOURCE_AES_KEY as string, "hex"),
      Buffer.from(RESOURCE_AES_IV as string, "hex")
    );

    // https://stackoverflow.com/questions/62813904/node-js-decipher-final-throws-wrong-final-block-length-error
    return Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(resourceData), "utf8")),
      cipher.final(),
    ]);
  }
}
