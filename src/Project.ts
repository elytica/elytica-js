interface ProjectData {
  id: number;
  name: string;
  description: string;
  application_id: number;
}

export class Project {
  id: number;
  name: string;
  description: string;
  application_id: number;

  constructor(data: ProjectData) {
    if (!data.hasOwnProperty("id")) {
      throw new Error("data does not contain an id field.");
    }
    if (!data.hasOwnProperty("name")) {
      throw new Error("data does not contain a name field.");
    }
    if (!data.hasOwnProperty("description")) {
      throw new Error("data does not contain a description field.");
    }
    if (!data.hasOwnProperty("application_id")) {
      throw new Error("data does not contain an application_id field.");
    }
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.application_id = data.application_id;
  }
}
