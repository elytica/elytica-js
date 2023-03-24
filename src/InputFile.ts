interface InputFileData {
  id: number;
  filename: string;
}

export class InputFile {
  id: number;
  name: string;

  constructor(data: InputFileData) {
    if (!("id" in data)) {
      throw new Error("data does not contain an id field.");
    }
    if (!("filename" in data)) {
      throw new Error("data does not contain a name field.");
    }
    this.id = data.id;
    this.name = data.filename;
  }
}
