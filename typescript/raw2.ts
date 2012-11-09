class Types {
  static types:any[] = [];
  static registerType(clsName: string, classDcl: any) {
    Types.types[clsName] = classDcl;
  }  

}
class Atom {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

}

Types.registerType('Atom', Atom);
class Term {
  public name: string;
  public grounded: any;

  constructor(name: string) {
    this.name = name;
    this.grounded = this;
  }

  public isGrounded():bool {
    if(this.grounded == this) {
      return false;
    } else {
      return true;
    }
  }

  public setVal(val: any):void {
    if(!this.isGrounded()) {
      console.log("_dbg about to set Term with name: " + this.name + ' to val: ' + val + "\n");
      this.grounded = val;
    } else {
      throw new TypeError( "Term is grounded cannot assign");
    }
  }

}

Types.registerType('Term', Term);
class Rule {
  public name: string;
  public args: any[] = [];
  public rules: Rule[] = [];

  public rule_args:any[] = [];
  public solutions:any[] = [];
  proven: bool;
  
  constructor(name: string) {
    this.name = name;
    this.proven = false;
  }

  addArg(arg: any) {
    this.args.push(arg);
  }

  addRule(rule: Rule) {
    this.rules.push(rule);
  }

  entangle(rule: Rule) {
    this.rule_args = rule.args;
  }

  is_query() {
    return !this.rules.length;
  }

  afterFire() {
    //TODO: match more then one arg if necessary and add to solutions if
    //variable supplied to query
    if(this.is_query()) {
      if(RuleEngine.getTypeName(this.args[0]) == 'Atom') {
	if(this.rule_args[0].grounded == this.args[0].name) {
	  this.proven = true;
	}
      }    

      if(RuleEngine.getTypeName(this.args[0]) == 'Term') {
	if(this.rule_args[0].grounded) {
	  this.solutions.push(this.rule_args[0].grounded);
	}
      }    
    }  

    /*
    if(this.rule_args[0].grounded) {
      this.solutions.push(this.args[0].name);
    } 
    */            
  }  
}

Types.registerType('Rule', Rule);
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
   
    /* 
    console.log("_dbg TypeName q : "+ this.getTypeName(q) + "\n");
    console.log("_dbg TypeName r : "+ this.getTypeName(r) + "\n");
    console.log("_dbg typeof q : "+ typeof q +"\n");
    console.log("_dbg q.toString() : "+ q.toString() +"\n");
    console.log("_dbg q num args: "+q.args.length.toString()+"\n");
    console.log("_dbg r num args: "+r.args.length.toString()+"\n");
    */
    console.log("_dbg args1.length: " + args1.length + "\n");
    console.log("_dbg args2.length: " + args2.length + "\n");
    
    if (args1.length == args2.length) {
      console.log("_dbg num args match\n");
	/* TODO: handle grounding and entangling of logical variables */
	/*
      for(var i=0; i < q.args.length; i++) {
	console.log("_dbg q arg #: " + i + " type: " + this.getTypeName(q.args[i]));
	console.log("_dbg r arg #: " + i + " type: " + this.getTypeName(r.args[i]));
	this.getTypeName(q.args[i]) != this.getTypeName(r.args[i])) {
	if(this.getTypeName(q.args[i]) != this.getTypeName(r.args[i])) {
	  match=false;    
	}
      }
	*/
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

/*
  public handleChoices(q: Query) {
    while(this.choices.length > 0) {
      var rule = this.choices.pop();
      console.log("_dbg about to fire rule with name: " + rule.name + "\n");
      q.entangle(rule);
      this.fireRule(rule);
      q.afterFire();
    }
  }
*/

/*
  public query(q: Query) {
    var result = false;
    var foundRules = this.searchRules(this.rules, q.name, q.args); 
    console.log("_dbg total # of rules found: " + foundRules.length + "\n");
    for (var i in foundRules) {
      this.choices.push(foundRules[i]);
    }
    this.handleChoices(q);

  }
}
*/
  
/*
Implementing example:

mortal(X) :-
human(X).
human(socrates).

*/

console.log('test');
