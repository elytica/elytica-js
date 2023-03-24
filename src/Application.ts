export class Application {
  id: number;
  display_name: string;
  executable_name: string;
  executable_flags: string;

  constructor(data: { id: number, display_name: string, executable_name: string, executable_flags: string }) {
    if (!('id' in data)) {
      throw new Error('data does not contain an id field.');
    }
    if (!('executable_name' in data)) {
      throw new Error('data does not contain an executable_name field.');
    }
    if (!('executable_flags' in data)) {
      throw new Error('data does not contain an executable_flags field.');
    }
    if (!('display_name' in data)) {
      throw new Error('data does not contain a display_name field.');
    }
    this.id = data.id;
    this.display_name = data.display_name;
    this.executable_name = data.executable_name;
    this.executable_flags = data.executable_flags;
  }
}
