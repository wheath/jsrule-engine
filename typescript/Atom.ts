class Atom {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

}

Types.registerType('Atom', Atom);
