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

Types.registerType('Fact', Fact);
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
  
  constructor(name: string) {
    this.name = name;
  }

  addArg(arg: any) {
    this.args.push(arg);
  }

  addRule(rule: Rule) {
    this.rules.push(rule);
  }

}

Types.registerType('Rule', Rule);
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>

class RuleEngine {
  private rules : Rule[] = [];
  private facts : Fact[] = [];

  public addRule(rule: Rule) {
    this.rules.push(rule);
  }

  public addFact(fact: Fact) {
    this.facts.push(fact);
  }

  public getTypeName(inst: any) {
    var typeName = undefined;
    for (var clsName in Types.types) {
      /* console.log("_dbg clsName: "+ clsName +"\n"); */
      if (inst instanceof Types.types[clsName]) {
        typeName = clsName;
      }
    }

    return typeName;
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

  public searchFacts(name: string):Fact[] {
    console.log("_dbg searching for facts with name: "+name +"\n");
    var foundFacts = [];
    for (var i in this.facts) {
      if (name == this.facts[i].name) {
        foundFacts.push(this.facts[i]); 
      }
      
    }

    return foundFacts;
  }

  public fireRule(r: Rule) {

    console.log("_dbg firing rule: " + r.name + "\n");
    for (var l in r.rules) {

      var foundRules = this.searchRules(this.rules, r.rules[l].name, r.rules[l].args); 
      if(foundRules.length > 0) {
      } else {
        console.log("_dbg searching for facts with name: "+r.rules[l].name+"\n");
	var foundFacts = this.searchFacts(r.rules[l].name);
        console.log("_dbg num foundFacts found: "+foundFacts.length+"\n");
	for (var i in foundFacts) {
          console.log("_dbg processing fact name: "+foundFacts[i].name +"\n");
	  for(var j in r.rules[l].args) {
	    if(this.getTypeName(r.rules[l].args[j]) == 'Term') {
	      for (var m in foundFacts[i].atoms) {
	        r.rules[l].args[j].setVal(foundFacts[i].atoms[m].name);  
	      }   
	    }

	  }
	}

      }
      this.fireRule(r.rules[l]);
    }
    /*
      if(foundRules.length > 0) {
	for (var k in foundRules) {
	  this.fireRule(foundRules[k]);
	}
      } else {
	var foundFacts = this.searchFacts(r.name);
	for (var i in foundFacts) {
	  for(var j in r.args) {
	    if(this.getTypeName(r.args[j]) == 'Term') {
	      r.args[j].setVal(foundFacts[i].args[0]);  
	    }

	  }
	}
      }
    } 
    */    
  }

  public query(q: Query) {
    var foundRules = this.searchRules(this.rules, q.name, q.args); 
    for (var i in foundRules) {
      console.log("_dbg about to fire rule with name: " + foundRules[i].name + "\n");
      this.fireRule(foundRules[i]);
    }
    console.log("_dbg # rules found: " + foundRules.length + "\n");
    return 0;
  }
}
  
/*
Implementing example:

mortal(X) :-
human(X).
human(socrates).

*/

/// <reference path="RuleEngine.ts"/>
/// <reference path="Atom.ts"/>
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
/// <reference path="Query.ts"/>


var re = new RuleEngine();
var mortal_rule = new Rule('mortal');
var term_X = new Term('X');
mortal_rule.addArg(term_X);
var human_rule = new Rule('human');
human_rule.addArg(term_X);
mortal_rule.addRule(human_rule);
var a1 = new Atom('socrates');
var human_fact = new Fact('human');
human_fact.addAtom(a1);
re.addFact(human_fact);
re.addRule(mortal_rule);

var query1 = new Query('mortal');
query1.addArg(a1);
var query_result = re.query(query1);
