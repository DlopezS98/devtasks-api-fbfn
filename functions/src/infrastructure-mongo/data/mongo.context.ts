import { Db, MongoClient } from "mongodb";

import MongoOptions from "../models/mongo-options";

export interface IMongoContext {
  readonly client: MongoClient;
  readonly db: Db;
}

export default class MongoContext implements IMongoContext {
  readonly client: MongoClient;
  readonly db: Db;

  constructor(public readonly options: MongoOptions) {
    this.client = new MongoClient(options.connectionString);
    this.db = this.client.db(options.dbName);
  }
}
