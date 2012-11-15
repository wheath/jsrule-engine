exports.testRuleDeepCopy = function(test){
  var term_X = new Term('X');
  var human_rule = new Rule('human');
  human_rule.addArg(term_X);

  h_copy = human_rule.deepcopy();
  
  test.equal(h_copy.name, human_rule.name);
  test.equal(h_copy.args.length, human_rule.args.length);
  h_copy.name = 'human2';
  test.notEqual(h_copy.name, human_rule.name);
  h_copy.args[0].name = 'Y';
  test.notEqual(h_copy.args[0].name, human_rule.args[0].name);
  test.done();
};

exports.testUnify = function(test) {
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  re.fireRule(q_human);
 
  test.equal(term_X2.getGrounded(), 1);
  test.done();
};

exports.testBackTrack = function(test) {
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 2);
  test.equal(q_human.solutions[1], 1);
  test.done();
};

exports.testCut = function(test) {
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);
  var test_clause = new Rule('!');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 2);
  test.equal(q_human.solutions.length, 1);
  test.done();
};

exports.testFail = function(test) {
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);
  var test_clause = new Rule('fail');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 1);
  test.equal(q_human.solutions.length, 1);
  test.done();
};

