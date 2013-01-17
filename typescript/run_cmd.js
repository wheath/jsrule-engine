  var re = setup_re();
  var q_ram = new Rule('choose_ram');
  var term_X = new Term('X');
  q_ram.addArg(term_X);
  RuleEngine.base_query = q_ram;
  RuleEngine.finished_cb = finishCB;

  re.fireRule(q_ram);

  if(is_debug) {
    console.log("_dbg after fireRule\n\n\n");
    console.log("_dbg RuleEngine.body_rule_firing.name: " + RuleEngine.body_rule_firing.name);
  }

  function finishCB() {
    console.log("_dbg finishCB called"); 
  }

  //re.handleQueryResult(q_ram);
   
  //console.log("_dbg first solution term_X.getGrounded(): " + term_X.getGrounded());
  /*
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
*/

