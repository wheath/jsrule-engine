var is_debug = true;

class Types {
  static types:any[] = [];
  static registerType(clsName: string, classDcl: any) {
    Types.types[clsName] = classDcl;
  }  

}
