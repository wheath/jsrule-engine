/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>

class RuleEngine {
  private rules : Rule[] = [];
  private choices : any[] = [];

  public addRule(rule: Rule) {
    this.rules.push(rule);
  }

  public static getTypeName(inst: any) {
    var typeName = undefined;
    for (var clsName in Types.types) {
      /* console.log("_dbg clsName: "+ clsName +"\n"); */
      if (inst instanceof Types.types[clsName]) {
        typeName = clsName;
      }
    }

    return typeName;
  }

  public findArg(name: string, args: any[]) {
    for(var i=0; i < args.length; i++) {
      if(name == args[i].name) {
        return args[i];
      }   
    }
  }

  public isArgsMatch(args1: any[], args2: any[]) {
    var match = true;

    if (args1.length == args2.length) {
      console.log("_dbg num args match\n");
	/* TODO: handle grounding and entangling of logical variables */
    } else {
      match=false;
    }
     
    return match;  
  }

  public searchRules(rules: Rule[], name: string, args: any[]):Rule[] {
    console.log("_dbg in searchRules\n");
    console.log("_dbg num rules searching: " + rules.length + "\n");
    console.log("_dbg searching for name: " + name + "\n");
    var foundRules = [];
    for (var i in rules) {
      console.log("_dbg rule name: " + rules[i].name + "\n");
      if (name == rules[i].name) {
        console.log("_dbg found rule\n");
        if(this.isArgsMatch(rules[i].args, args)) {
          console.log("_dbg args match\n");
          foundRules.push(rules[i]);
        }
      }
    }

    return foundRules;
  }

  public fireRule(r: Rule) {

    console.log("_dbg firing rule: " + r.name + "\n");
    if(r.rules.length == 0) {
      console.log("_dbg executing query rule: " + r.name + "\n");
      var foundRules = this.searchRules(this.rules, r.name, r.args); 
      console.log("_dbg num rules found: " + foundRules.length + "\n");
      for(var k in foundRules) {
        r.entangle(foundRules[k]);
        this.fireRule(foundRules[k]);
        //foundRules[k].afterFire();
        r.afterFire();
      }
    }

    for (var l in r.rules) {
      if(r.rules[l].args.length > 0) {
        var foundRules = this.searchRules(this.rules, r.rules[l].name, r.rules[l].args); 
      console.log("_dbg num rules found: " + foundRules.length + "\n");
      for(var k in foundRules) {
        this.fireRule(foundRules[k]);
      }

      } else {
        if(r.rules[l].name.indexOf('=') > -1) {
          var n = r.rules[l].name.split('=');
          //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
          //console.log("_dbg num args: "+ r.args.length +"\n");
          
          var arg = this.findArg(n[0], r.args);
          arg.setVal(n[1]);
        }
      }
      r.afterFire();
      this.fireRule(r.rules[l]);
    }
  }

}


  
