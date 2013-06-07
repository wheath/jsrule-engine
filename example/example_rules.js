function showControlDiv() {
    console.log("_dbg in showControlDiv");
    var ctrl_div = document.getElementById("control_div");
    ctrl_div.style.display = "inline";
  }
function run_re() {
    var ctrl_div = document.getElementById("control_div");
    ctrl_div.style.display = "none";
    var output_div = document.getElementById("output_div");
    output_div.style.display = "inline";

    // Reset the engine so it's not corrupted from the last run
    RuleEngine.reset();
    
    // add all our local rules
    var re = setup_re();

    // Now we prep the term we'll query
    
    // make a new term called Q
    var jsrea_term_Q = new Term('Q');
    
    var jsrea_rule_call = new Rule('jsrules_area');
    jsrea_rule_call.addArg(jsrea_term_Q);

    
    RuleEngine.base_query = jsrea_rule_call
    
    // Set the callback for when the query finishes
    RuleEngine.finished_cb = showControlDiv;

    re.fireRule(jsrea_rule_call);
  }


function setup_re() {
  var re = RuleEngine.getREInst();
            
  var jsrea_term_Q = new Term('Q');
  var jsrea_rule = new Rule('jsrules_area');
  jsrea_rule.addArg(jsrea_term_Q);
  re.addRule(jsrea_rule);

// ground JSREA_QUESTION to Do you need blah blah
  var assn_q_rule = new Rule('JSREA_QUESTION=Do you need help using the javascript rules engine?');
  jsrea_rule.addRule(assn_q_rule);

    // qa_bool will be actually present the yes/no question
    
    // calls (library) prolog rule qa_bool with the question 
    // and the Answer term then checks if the answer term
    // is grounded to the value yes, 
    // if it is, it then calls the get_rehelp rule

  var qa_bool_call = new Rule('qa_bool');
  var jsrea_q_term = new Term('JSREA_QUESTION');
  var is_jshelp_term = new Term('IS_JSHELP');

  qa_bool_call.addArg(jsrea_q_term);
  qa_bool_call.addArg(is_jshelp_term);

  jsrea_rule.addRule(qa_bool_call);

  var is_jshelp_eq_yes = new Rule('IS_JSHELP==yes');
  jsrea_rule.addRule(is_jshelp_eq_yes);

  var get_rehelp_call = new Rule('get_rehelp');
  var jsrea_term_Q = new Term('Q');
  get_rehelp_call.addArg(jsrea_term_Q);
  jsrea_rule.addRule(get_rehelp_call);



    var qa_t = [
     ['Do you like object oriented javascript backward chaining asynchronous rule engines?', 'yes_no', 'IS_LIKE'],
     ['Do you need help installing the rules engine?', 'yes_no', 'IS_INSTALL'],
    ['Do you need help understanding how to define a rule?', 'yes_no', 'IS_DEFINE_RULE'],
    ['Do you need an overview?', 'yes_no', 'IS_OVERVIEW']    
        ];
    
  var input_args = [];
  input_args.push(new Term('GP_EQ'));
  var gh_rule = Util.create_rule_from_qa_table('get_rehelp', input_args, qa_t, 'get_rehelp_answer'); 
  re.addRule(gh_rule);


  var u = undefined;

  var tt = 
    [
      [ 'no', u, u, u, u, [new Rule('o(ERROR:  Why!!!  Email me at wgheath@gmail.com and tell me why as I cannot believe it :>)'), new Rule('i(CONFIRM)'), new Rule('!')] ],
      [ u, 'yes', u, u, 'Obtain re_lib.js from http://github.com/wheath/jsrule-engine/ and include it in your html page', [new Rule('!')] ],
      [ u, u, 'yes', u, '<br>query example:<br>var q (equal sign) new Rule(\'rule_name\');<br>q.addArg(new Term(\'Q\'));', u],
      [ u, u, 'yes', u, '<br>body rule example:<br>var q (equal sign) new Rule(\'TERM_NAME_VAR double equal \'yes\'\');', [new Rule('!')] ],
        [ u, u, u, 'yes', '<br>This rules engine has a gpl license.  This rules engine is based on prolog and uses rules and logic variables.  Most everything is a rule.  A rule with no body rules is a query.  Rules inside another rule are clauses etc...  You can find the source code here: https://github.com/wheath/jsrule-engine/  There is only one stack used for choice points and logic variables to support backtracking.  It only supports one type of input right now, yes/no radio button.  This javascript rules engine is asynchronous.  As a result you can simply supply callbacks and do other things while it is running.<br>', [new Rule('!')] ]
      
      //[ u, u, u, u, u, '', u],
    ];

  var header_args = gh_rule.rules[gh_rule.rules.length-1].args;
  console.log("_dbg header_args length: " + header_args.length);
  console.log("_dbg last header_arg name: " + header_args[header_args.length-1].name);
  gh_eq_rules = Util.gen_rules_from_truth_table("get_rehelp_answer", header_args, tt);


  for(var i=0; i< gh_eq_rules.length;i++) {
    re.addRule(gh_eq_rules[i]);
  }

//rule engine utility function
  Util.add_qa_bool_rule();

  return re;
}