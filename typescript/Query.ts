class Query {
  name: string;
  args:any[] = [];
  constructor(name: string) {
    this.name = name;
  }

  addArg(arg: any) {
    this.args.push(arg);
  }


}
Types.registerType('Query', Query);
