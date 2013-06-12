exports.parser = prolog;
exports.Parser = prolog.Parser;
//var source = "test:-write('hello world').?-test1,test2.";
var source = "test(PRICEEQ):-i(ISSVC), ISSVC == 'yes', PRICEEQ='t1*t2'.";
exports.parser.parse(source);

var re = RuleEngine.getREInst();

var q_test = new Rule('test');
var t = new Term('PRICEEQ');
q_test.addArg(t);
RuleEngine.base_query = q_test;

if(is_debug) {
  console.log("_dbg about to call fireRule(q_test)");
}
re.fireRule(q_test);
