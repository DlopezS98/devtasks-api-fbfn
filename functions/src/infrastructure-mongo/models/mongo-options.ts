export default class MongoOptions {
  constructor(public readonly connectionString: string, public readonly dbName: string) {}
}
