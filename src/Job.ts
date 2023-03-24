interface JobData {
  id: number;
  project_id: number;
  status: string;
  output: string;
  name: string;
}

export class Job {
  id: number;
  project_id: number;
  status: string;
  output: string;
  name: string;

  constructor(data: JobData) {
    if (!("id" in data)) {
      throw new Error("data does not contain an id field.");
    }
    if (!("name" in data)) {
      throw new Error("data does not contain a name field.");
    }
    if (!("status" in data)) {
      throw new Error("data does not contain a status field.");
    }
    if (!("output" in data)) {
      throw new Error("data does not contain an output field.");
    }
    if (!("project_id" in data)) {
      throw new Error("data does not contain project_id field.");
    }
   
    this.id = data.id;
    this.project_id = data.project_id;
    this.status = data.status;
    this.output = data.output;
    this.name = data.name;
  }
}

