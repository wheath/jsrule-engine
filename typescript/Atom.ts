class Atom {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  public deepcopy() {
    var atom_copy = new Atom(this.name);
    return atom_copy;
  }

}

Types.registerType('Atom', Atom);
