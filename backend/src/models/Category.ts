export class Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }
}
