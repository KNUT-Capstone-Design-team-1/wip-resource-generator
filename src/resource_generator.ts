import path from "path";
import fs from "fs";
import xlsParser from "simple-excel-to-json";
import iconvLite from "iconv-lite";
import { Converter } from "csvtojson/v2/Converter";
import { publicEncrypt } from "crypto";

export class ResourceGenerator {
  private readonly drugRecognitionResorcePath: string;
  private readonly finishedMedicinePermissionDetailsResourcePath: string;
  private readonly defaultRelativePath: string;

  constructor() {
    this.defaultRelativePath = "../res";

    this.drugRecognitionResorcePath = path.join(
      __dirname,
      `${this.defaultRelativePath}/drug_recognition`
    );

    this.finishedMedicinePermissionDetailsResourcePath = path.join(
      __dirname,
      `${this.defaultRelativePath}/finisihed_medecine_permission_details`
    );
  }

  public async generate() {
    console.log('Start resource generate');

    const pathList = this.getPathList();

    for await (const resourcePath of pathList) {
      const resourceDatas = await this.generateResourceData(resourcePath);

      if (resourceDatas.length === 0) {
        continue;
      }

      await this.createResourceFile(resourcePath, resourceDatas);
    }
  }

  private getPathList() {
    return [
      this.drugRecognitionResorcePath,
      this.finishedMedicinePermissionDetailsResourcePath,
    ];
  }

  private async generateResourceData(resourcePath: string) {
    console.log(`Generate resource data of ${resourcePath}`);

    const fileList = this.getResourceFileList(resourcePath);
    if (fileList.length === 0) {
      return [];
    }

    const datas: object[] = [];
    for await (const file of fileList) {
      const jsonData = await this.convertExcelToJSON(`${resourcePath}/${file}`);

      if (jsonData.length > 0) {
        datas.push(...jsonData);
      }
    }

    return datas;
  }

  private getResourceFileList(resourcePath: string) {
    return fs.existsSync(resourcePath) ? fs.readdirSync(resourcePath) : [];
  }

  private async convertExcelToJSON(resourcePath: string) {
    console.log(`Convert excel to JSON of ${resourcePath}`);

    const fileExtension = resourcePath.split(".").slice(-1)[0];

    switch (fileExtension) {
      case "xlsx":
      case "xls":
        return this.convertXLSToJSON(resourcePath);

      case "csv":
        return this.convertCSVToJSON(resourcePath);

      default:
        throw new Error(`Invalid file extension ${fileExtension}`);
    }
  }

  private async convertXLSToJSON(resourcePath: string) {
    const doc: { flat: () => object[] } = xlsParser.parseXls2Json(resourcePath);

    return doc.flat();
  }

  private async convertCSVToJSON(resourcePath: string) {
    const csvString = iconvLite.decode(fs.readFileSync(resourcePath), "euc-kr");

    const rows: Array<Object> = await new Converter().fromString(csvString);

    return rows;
  }

  private async createResourceFile(
    resourcePath: string,
    resourceDatas: Array<Object>
  ) {
    console.log(`Create resource file from ${resourcePath}`);

    const directoryName = resourcePath.split("/").pop();
    const encryptedData = this.encryptData(resourceDatas);

    fs.writeFileSync(
      path.join(__dirname, `${this.defaultRelativePath}/${directoryName}`),
      encryptedData
    );
  }

  private encryptData(resourceDatas: Array<Object>) {
    const publicKey = process.env.RSA_PUBLIC_KEY as string;

    const resourceBuffer = Buffer.from(JSON.stringify(resourceDatas));

    return publicEncrypt({ key: publicKey }, resourceBuffer);
  }
}
