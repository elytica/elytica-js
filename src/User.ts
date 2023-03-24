interface UserData {
  id: number;
  name: string;
  email: string;
  rate_limit: number;
}

export class User {
  id: number;
  name: string;
  email: string;
  rate_limit: number;

  constructor(data: UserData) {
    if (!("id" in data)) {
      throw new Error("data does not contain an id field.");
    }
    if (!("name" in data)) {
      throw new Error("data does not contain a name field.");
    }
    if (!("email" in data)) {
      throw new Error("data does not contain an email field.");
    }
    if (!("rate_limit" in data)) {
      throw new Error("data does not contain a rate_limit field.");
    }
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.rate_limit = data.rate_limit;
  }
}
