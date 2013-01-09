var is_debug = false;

class Types {
  static types:any[] = [];
  static registerType(clsName: string, classDcl: any) {
    Types.types[clsName] = classDcl;
  }  

}
