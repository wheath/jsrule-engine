class Fact {
  private name: string;
  private atoms: Atom[] = [];

  constructor(name: string) {
    this.name = name;
  }

  public addAtom(atom: Atom) {
    this.atoms.push(atom);
  }

}
