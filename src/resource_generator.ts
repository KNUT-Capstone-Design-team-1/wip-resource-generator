import path from "path";
import fs from "fs";
import xlsParser from "simple-excel-to-json";
import iconvLite from "iconv-lite";
import { Converter } from "csvtojson/v2/Converter";
import crypto from "crypto";

export class ResourceGenerator {
  private readonly sizePerResLimit: number;
  private readonly drugRecognitionDirName: string;
  private readonly finishedMedicinePermissionDetailsDirName: string;

  constructor() {
    this.sizePerResLimit = 10 * 1024 * 1024; // MB

    this.drugRecognitionDirName = "drug_recognition";

    this.finishedMedicinePermissionDetailsDirName =
      "finished_medecine_permission_details";
  }

  public async generate() {
    console.log("Start resource generate");

    for await (const resourcePath of this.getPathList()) {
      const fileList = fs.existsSync(resourcePath)
        ? fs.readdirSync(resourcePath)
        : [];

      if (fileList.length === 0) {
        continue;
      }

      await this.createResourceFiles(resourcePath, fileList);
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

  private async createResourceFiles(resourcePath: string, fileList: string[]) {
    const directoryPath = path.join(__dirname, `../encrypted_res`);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    let resSize = 0;
    let fileNameCount = 0;
    const dataPerFiles: Array<Object> = [];

    const createEncryptFile = () => {
      const resourceType = path.join(
        directoryPath,
        resourcePath.split(/\\|\//).pop() as string // 디렉터리 이름만 추출
      );

      fs.writeFileSync(
        `${resourceType}_${fileNameCount}.res`,
        this.encryptData(dataPerFiles),
        "utf8"
      );

      fileNameCount += 1;
      dataPerFiles.length = 0; // clear array
      resSize = 0;
    };

    for await (const fileName of fileList) {
      const jsonArrOfFile = await this.convertExcelToJSON(
        `${resourcePath}/${fileName}`
      );

      if (jsonArrOfFile.length === 0) {
        continue;
      }

      console.log(`Create resource files from ${fileName}`);

      for await (const jsonObj of jsonArrOfFile) {
        const jsonDataSize = Buffer.byteLength(
          JSON.stringify(this.encryptData(jsonObj)),
          "hex"
        );

        // 암호화로 인해 저장 시 용량이 2배가 되기 때문에 기준 용량의 1/2로 계산한다
        if (resSize + jsonDataSize < (this.sizePerResLimit / 2)) {
          dataPerFiles.push(jsonObj);
          resSize += jsonDataSize;
          continue;
        }

        createEncryptFile();
      }
    }

    if (dataPerFiles.length) {
      createEncryptFile();
    }
  }

  private async convertExcelToJSON(fileName: string): Promise<Array<Object>> {
    const fileExtension = fileName.split(".").slice(-1)[0];

    switch (fileExtension) {
      case "xlsx":
      case "xls": {
        const doc: { flat: () => Object[] } = xlsParser.parseXls2Json(fileName);
        return doc.flat();
      }

      case "csv": {
        const csvString = iconvLite.decode(fs.readFileSync(fileName), "euc-kr");
        const rows: Array<Object> = await new Converter().fromString(csvString);
        return rows;
      }

      case "json": {
        const jsonStr = fs.readFileSync(fileName, "utf-8");
        return JSON.parse(jsonStr);
      }

      default:
        throw new Error(`Invalid file extension ${fileExtension}`);
    }
  }

  private encryptData(resourceData: Array<Object> | Object): string {
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
    ]).toString("hex");
  }
}
