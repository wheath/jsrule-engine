var Util = (function () {
    function Util() { }
    Util.is_in_browser = function is_in_browser() {
        return !(typeof window === 'undefined');
    }
    Util.output = function output(s) {
        if(Util.is_in_browser()) {
            document.getElementById('output_div').innerHTML = s;
        } else {
            console.log(s + '\n');
        }
    }
    Util.input = function input(cb) {
        RuleEngine.async_hold = true;
        if(is_debug) {
            console.log("_dbg in input");
            console.log("_dbg rule_firing # b_args: " + RuleEngine.rule_firing.b_args.length);
        }
        if(Util.is_in_browser()) {
            var input_div = document.getElementById("input_div");
            input_div.style.display = "inline";
            RuleEngine.input_cb = cb;
        } else {
            var prompt = require('prompt');
            prompt.start();
            prompt.get([
                'input_str'
            ], function (err, result) {
                if(err) {
                    return onErr(err);
                }
                if(is_debug) {
                    console.log('Command-line input received:');
                    console.log('  input_str: ' + result.input_str);
                }
                cb(result.input_str);
            });
            function onErr(err) {
                console.log(err);
                return 1;
            }
        }
    }
    Util.add_qa_bool_rule = function add_qa_bool_rule() {
        var re = RuleEngine.getREInst();
        var qa_bool_rule = new Rule('qa_bool');
        var qa_question_term = new Term('Q');
        var qa_answer_term = new Term('BOOL_A');
        qa_bool_rule.addArg(qa_question_term);
        qa_bool_rule.addArg(qa_answer_term);
        re.addRule(qa_bool_rule);
        var qa_rule_o1 = new Rule('ov(Q)');
        re.addRule(qa_rule_o1);
        qa_bool_rule.addRule(qa_rule_o1);
        var qa_rule_i1 = new Rule('i(BOOL_A)');
        re.addRule(qa_rule_i1);
        qa_bool_rule.addRule(qa_rule_i1);
    }
    Util.handle_binary_input = function handle_binary_input(document) {
        console.log("_dbg in handle_binary_input");
        var oRadio = document.forms[0].elements['binary_input'];
        var radio_val = '';
        for(var i = 0; i < oRadio.length; i++) {
            if(oRadio[i].checked) {
                radio_val = oRadio[i].value;
            }
        }
        console.log("_dbg radio_val: " + radio_val);
        var input_div = document.getElementById("input_div");
        input_div.style.display = "none";
        RuleEngine.input_cb(radio_val);
    }
    Util.create_rule_from_qa_table = function create_rule_from_qa_table(input_rule_name, input_rulehdr_args, qa_t, call_rule_name) {
        var qa_input_rule = Util.create_rule_header(input_rule_name, input_rulehdr_args);
        var call_rule_args = [];
        for(var i = 0; i < qa_t.length; i++) {
            var qa_info = qa_t[i];
            qa_input_rule.rules.push(new Rule('o(' + qa_info[0] + ')'));
            if(qa_info[1] == 'yes_no') {
                qa_input_rule.rules.push(new Rule('i(' + qa_info[2] + ')'));
                call_rule_args.push(new Term(qa_info[2]));
            }
        }
        for(var i = 0; i < input_rulehdr_args.length; i++) {
            call_rule_args.push(new Term(input_rulehdr_args[i].name));
        }
        var call_rule = Util.create_rule_header(call_rule_name, call_rule_args);
        qa_input_rule.rules.push(call_rule);
        return qa_input_rule;
    }
    Util.gen_rules_from_truth_table = function gen_rules_from_truth_table(rule_name, header_args, tt) {
        var generated_rules = [];
        for(var i = 0; i < tt.length; i++) {
            var rule = Util.create_rule_header(rule_name, header_args);
            var body_tt_row = tt[i];
            for(var j = 0; j < body_tt_row.length; j++) {
                if(body_tt_row[j] === undefined) {
                    continue;
                }
                if(j == body_tt_row.length - 2) {
                    if(body_tt_row[j] !== undefined) {
                        rule.addRule(new Rule(header_args[j].name + '=' + body_tt_row[j]));
                    }
                } else {
                    if(j == body_tt_row.length - 1) {
                        if(Object.prototype.toString.call(body_tt_row[j]) == "[object Array]") {
                            var suffix_rules = body_tt_row[j];
                            for(var k = 0; k < suffix_rules.length; k++) {
                                rule.addRule(suffix_rules[k]);
                            }
                        }
                    } else {
                        rule.addRule(new Rule(header_args[j].name + '==' + body_tt_row[j]));
                    }
                }
            }
            generated_rules.push(rule);
        }
        return generated_rules;
    }
    Util.create_rule_header = function create_rule_header(rule_name, header_args) {
        var new_rule = new Rule(rule_name);
        for(var i = 0; i < header_args.length; i++) {
            new_rule.addArg(header_args[i]);
        }
        return new_rule;
    }
    return Util;
})();
var is_debug = true;
var Types = (function () {
    function Types() { }
    Types.types = [];
    Types.registerType = function registerType(clsName, classDcl) {
        Types.types[clsName] = classDcl;
    }
    return Types;
})();
var Atom = (function () {
    function Atom(name) {
        this.name = name;
    }
    Atom.prototype.deepcopy = function () {
        var atom_copy = new Atom(this.name);
        return atom_copy;
    };
    return Atom;
})();
Types.registerType('Atom', Atom);
var Term = (function () {
    function Term(name) {
        this.name = name;
        this.grounded = this;
    }
    Term.prototype.deepcopy = function () {
        var term_copy = new Term(this.name);
        term_copy.name = this.name;
        if(!this.isGrounded()) {
            term_copy.grounded = this.grounded;
        } else {
            term_copy.grounded = term_copy;
        }
        return term_copy;
    };
    Term.prototype.isBoundorAliased = function () {
        var ret_val = false;
        if(RuleEngine.getTypeName(this.grounded) == 'Atom') {
            ret_val = true;
        }
        if(RuleEngine.getTypeName(this.grounded) == 'Term') {
            ret_val = true;
        }
        return ret_val;
    };
    Term.prototype.isFree = function () {
        if(this.grounded == this) {
            return true;
        } else {
            return false;
        }
    };
    Term.prototype.isGrounded = function () {
        var is_grounded = true;
        if(this.grounded == this) {
            is_grounded = false;
        } else {
            if(this.isBoundorAliased()) {
                is_grounded = this.grounded.isGrounded();
            }
        }
        return is_grounded;
    };
    Term.prototype.reset = function () {
        this.grounded = this;
    };
    Term.prototype.unify = function (t) {
        if(is_debug) {
            console.log("_dbg in unify");
            console.log("_dbg this.name: " + this.name);
            console.log("_dbg t type: " + RuleEngine.getTypeName(t));
            if(RuleEngine.getTypeName(t)) {
                console.log("_dbg value: " + t);
            }
        }
        var unified = false;
        if(this.isFree()) {
            if(is_debug) {
                console.log("_dbg term is free, assigning grounded");
                if(RuleEngine.getTypeName(t)) {
                    console.log("_dbg to Term with name: " + t.name);
                }
            }
            this.grounded = t;
            unified = true;
        } else {
            if(this.isBoundorAliased()) {
                unified = this.grounded.unify(t);
            } else {
                unified = false;
            }
        }
        if(unified) {
            RuleEngine.choices.push(this);
        }
        return unified;
    };
    Term.prototype.getGrounded = function () {
        if(is_debug) {
        }
        if(this.isFree()) {
            return this;
        }
        var ret_val = this.grounded;
        if(this.isBoundorAliased()) {
            if(is_debug) {
            }
            ret_val = this.grounded.getGrounded();
            if(is_debug) {
            }
        }
        return ret_val;
    };
    return Term;
})();
Types.registerType('Term', Term);
var Rule = (function () {
    function Rule(name) {
        this.args = [];
        this.b_args = [];
        this.rules = [];
        this.is_context_change = false;
        this.non_call_regex = /=|fail|!|o\(|ov\(|i\(/;
        this.solutions = [];
        this.name = name;
        this.proven = false;
    }
    Rule.prototype.deepcopy = function () {
        if(is_debug) {
            console.log("_dbg in Rule.deepcopy");
        }
        var rule_copy = new Rule(this.name);
        for(var i = 0; i < this.args.length; i++) {
            if(is_debug) {
                console.log("_dbg about to call deepcopy on arg with name: " + this.args[i].name);
            }
            rule_copy.args.push(this.args[i].deepcopy());
        }
        for(var r = 0; r < this.rules.length; r++) {
            var call_copy = new Rule(this.rules[r].name);
            for(var a = 0; a < this.rules[r].args.length; a++) {
                call_copy.args.push(this.rules[r].args[a].deepcopy());
            }
            for(var b = 0; b < this.rules[r].b_args.length; b++) {
                call_copy.b_args.push(this.rules[r].b_args[b].deepcopy());
            }
            rule_copy.rules.unshift(call_copy);
        }
        rule_copy.proven = this.proven;
        rule_copy.solutions = this.solutions;
        rule_copy.is_context_change = this.is_context_change;
        if(is_debug) {
            console.log("_dbg about to return from Rule.deepcopy");
        }
        return rule_copy;
    };
    Rule.prototype.addArg = function (arg) {
        this.args.push(arg);
    };
    Rule.prototype.addBarg = function (b_arg) {
        this.b_args.push(b_arg);
    };
    Rule.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    Rule.prototype.is_query = function () {
        return !this.rules.length && this.args.length && !this.non_call_regex.test(this.name);
    };
    Rule.prototype.is_non_call = function () {
        return !this.rules.length && !this.args.length && this.non_call_regex.test(this.name);
    };
    return Rule;
})();
Types.registerType('Rule', Rule);
var Choice = (function () {
    function Choice(query, rule, body_rules) {
        this.body_rules = [];
        this.query = query;
        this.rule = rule;
        this.body_rules = body_rules;
    }
    return Choice;
})();
Types.registerType('Choice', Choice);
var RuleEngine = (function () {
    function RuleEngine() { }
    RuleEngine.re_inst = 0;
    RuleEngine.rules = [];
    RuleEngine.choices = [];
    RuleEngine.body_rules = [];
    RuleEngine.rule_firing = undefined;
    RuleEngine.body_rule_firing = undefined;
    RuleEngine.async_hold = false;
    RuleEngine.base_query = undefined;
    RuleEngine.input_cb = undefined;
    RuleEngine.finished_cb = undefined;
    RuleEngine.more_solutions_prompt = true;
    RuleEngine.reset = function reset() {
        RuleEngine.re_inst = 0;
        RuleEngine.rules = [];
        RuleEngine.choices = [];
        RuleEngine.body_rules = [];
        RuleEngine.async_hold = false;
        RuleEngine.input_cb = 0;
        RuleEngine.base_query = 0;
        RuleEngine.rule_firing = 0;
        RuleEngine.body_rule_firing = 0;
        RuleEngine.finished_cb = 0;
        RuleEngine.more_solutions_prompt = true;
    }
    RuleEngine.prototype.isFinished = function () {
        var is_finished = false;
        if(RuleEngine.body_rules.length == 0) {
            if(RuleEngine.choices.length == 0) {
                is_finished = true;
            }
        }
        return is_finished;
    };
    RuleEngine.prototype.handleBaseQueryFinish = function () {
        if(RuleEngine.async_hold) {
            return;
        }
        if(is_debug) {
            console.log("_dbg in handleBaseQueryFinish");
        }
        if(RuleEngine.body_rules.length == 0) {
            if(is_debug) {
                console.log("_dbg base_query == r, about to call handleQueryResult");
            }
            if(this.isFinished()) {
                if(RuleEngine.finished_cb) {
                    RuleEngine.finished_cb();
                }
            }
            this.handleQueryResult();
        }
    };
    RuleEngine.getREInst = function getREInst() {
        if(!RuleEngine.re_inst) {
            RuleEngine.re_inst = new RuleEngine();
        }
        return RuleEngine.re_inst;
    }
    RuleEngine.prototype.addBodyRule = function (rule) {
        RuleEngine.body_rules.push(rule);
    };
    RuleEngine.prototype.addRule = function (rule) {
        RuleEngine.rules.push(rule);
        for(var i = 0; i < rule.rules.length; i++) {
            if(!rule.is_query()) {
                var foundRules = this.searchRules(RuleEngine.rules, rule.name, rule.args);
                if(foundRules.length == 1) {
                    for(var j = 0; j < foundRules.length; j++) {
                        var found_bodyRule = foundRules[j];
                        if(found_bodyRule.is_non_call()) {
                            rule.rules[i] = found_bodyRule;
                        }
                    }
                }
            }
        }
    };
    RuleEngine.getTypeName = function getTypeName(inst) {
        var typeName = undefined;
        for(var clsName in Types.types) {
            if(inst instanceof Types.types[clsName]) {
                typeName = clsName;
            }
        }
        return typeName;
    }
    RuleEngine.findArg = function findArg(name, args) {
        for(var i = 0; i < args.length; i++) {
            if(name == args[i].name) {
                return args[i];
            }
        }
    }
    RuleEngine.prototype.backTrack = function () {
        var is_backTracked = false;
        var found_choice = undefined;
        RuleEngine.rule_firing = undefined;
        RuleEngine.body_rule_firing = undefined;
        RuleEngine.body_rules = [];
        if(is_debug) {
            console.log("_dbg in backTrack");
            console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
            RuleEngine.dump_choices();
        }
        while(!is_backTracked) {
            if(RuleEngine.choices.length > 0) {
                var choice_or_term = RuleEngine.choices.pop();
                if(RuleEngine.getTypeName(choice_or_term) == 'Term') {
                    choice_or_term.reset();
                } else {
                    if(RuleEngine.getTypeName(choice_or_term) == 'Choice') {
                        found_choice = choice_or_term;
                        is_backTracked = true;
                    } else {
                        throw new TypeError("BackTrack error, unknown type popped from choice point stack");
                    }
                }
            } else {
                is_backTracked = true;
            }
        }
        if(found_choice) {
            RuleEngine.body_rules = found_choice.body_rules;
            var rule_copy = this.prepareToFire(found_choice.query, found_choice.rule, false);
            if(is_debug) {
                if(!this.check_copy_args_link_to_base_args(rule_copy)) {
                    console.log("_dbg 6 rule_copy: " + rule_copy.name + " args not found in alias chain of base query args after unifying with query: " + found_choice.query.name);
                } else {
                    console.log("_dbg 6 rule_copy: " + rule_copy.name + " args found in alias chain of base query args after unifying with query: " + found_choice.query.name);
                }
            }
            this.fireRule(rule_copy);
        } else {
            if(is_debug) {
                console.log("_dbg backTrack found no choices to fire on choice point stack");
            }
        }
    };
    RuleEngine.prototype.isArgsMatch = function (args1, args2) {
        var match = true;
        if(args1.length == args2.length) {
            if(is_debug) {
                console.log("_dbg num args match\n");
            }
        } else {
            match = false;
        }
        return match;
    };
    RuleEngine.prototype.searchRules = function (rules, name, args) {
        if(is_debug) {
            console.log("_dbg in searchRules\n");
            console.log("_dbg num rules searching: " + rules.length + "\n");
            console.log("_dbg searching for name: " + name + "\n");
        }
        var foundRules = [];
        for(var i in rules) {
            if(is_debug) {
                console.log("_dbg rule name: " + rules[i].name + "\n");
            }
            if(name == rules[i].name) {
                if(is_debug) {
                    console.log("_dbg found rule\n");
                }
                if(this.isArgsMatch(rules[i].args, args)) {
                    if(is_debug) {
                        console.log("_dbg args match\n");
                    }
                    foundRules.push(rules[i]);
                } else {
                    console.log("_dbg args do not match\n");
                }
            }
        }
        return foundRules;
    };
    RuleEngine.prototype.unifyHeaderBodyArgsToQueryArgs = function (query) {
        if(is_debug) {
            console.log("_dbg in unifyHeaderBodyArgsToQueryArgs");
        }
        var header = RuleEngine.rule_firing;
        for(var i = 0; i < header.b_args.length; i++) {
            for(var j = 0; j < query.args.length; j++) {
                if(is_debug) {
                    console.log("_dbg cmp b arg name: " + query.args[j].name + " with  header arg name" + header.b_args[i].name);
                }
                if(query.args[j].name == header.b_args[i].name) {
                    query.args[j] = header.b_args[i];
                }
            }
        }
    };
    RuleEngine.prototype.unifyHeaderArgsToBodyCallArgs = function (rule) {
        var header = rule;
        var body_rules = rule.rules;
        for(var k = 0; k < body_rules.length; k++) {
            var body_rule = body_rules[k];
            if(is_debug) {
                console.log("_dbg in unifyHeaderArgsToBodyCallArgs h: " + header.name + " b: " + body_rule.name);
            }
            for(var i = 0; i < header.args.length; i++) {
                for(var j = 0; j < body_rule.args.length; j++) {
                    if(is_debug) {
                        console.log("_dbg cmp b arg name: " + body_rule.args[j].name + " with  header arg name" + header.args[i].name);
                    }
                    if(body_rule.args[j].name == header.args[i].name) {
                        body_rule.args[j] = header.args[i];
                    }
                }
            }
        }
    };
    RuleEngine.prototype.unifyRuleHeaders = function (r1, r2) {
        if(is_debug) {
            console.log("_dbg in unifyRuleHeaders");
            console.log("_dbg unifying r1: " + r1.name);
            RuleEngine.dump_rule(r1);
            console.log("_dbg with r2: " + r2.name);
            RuleEngine.dump_rule(r2);
        }
        for(var i = 0; i < r1.args.length; i++) {
            if(RuleEngine.getTypeName(r1.args[i]) == 'Term' && !r1.args[i].isGrounded()) {
                if(is_debug) {
                    console.log("_dbg calling unify on arg: " + r1.args[i].name + " v: " + r1.args[i].getGrounded() + " with arg: " + r2.args[i].name + " v: " + r2.args[i].getGrounded());
                }
                r1.args[i].unify(r2.args[i]);
                if(is_debug) {
                    console.log("_dbg unifying " + r2.args[i].name + " with " + r1.args[i].name);
                    console.log("_dbg r1.args[i].grounded type: " + RuleEngine.getTypeName(r1.args[i].grounded));
                    RuleEngine.dump_term_alias_chain(r1.args[i]);
                    if(r2.args[i].name == 'X1') {
                        var bq_hd_arg = RuleEngine.base_query.args[0];
                        console.log("\n_dbg dumping base query arg name: " + bq_hd_arg.name);
                        if(RuleEngine.is_term_in_alias_chain(r1.args[i], bq_hd_arg)) {
                            console.log("_dbg 2 term: " + r1.args[i].name + " is in alias chain of base query arg: " + bq_hd_arg.name);
                        } else {
                            console.log("_dbg 2 term: " + r1.args[i].name + " is not in alias chain of base query arg: " + bq_hd_arg.name);
                        }
                        if(RuleEngine.is_term_in_alias_chain(r2.args[i], bq_hd_arg)) {
                            console.log("_dbg term: " + r2.args[i].name + " is in alias chain of base query arg: " + bq_hd_arg.name);
                        } else {
                            console.log("_dbg term: " + r2.args[i].name + " is not in alias chain of base query arg: " + bq_hd_arg.name);
                        }
                        RuleEngine.dump_term_alias_chain(bq_hd_arg);
                        console.log("_dbg r1.args[i].getGrounded: " + r1.args[i].getGrounded());
                    }
                }
            } else {
                if(RuleEngine.getTypeName(r2.args[i]) == 'Term' && !r2.args[i].isGrounded()) {
                    if(is_debug) {
                        console.log("_dbg calling unify on r2");
                    }
                    if(is_debug) {
                        console.log("_dbg unifying " + r1.args[i].name + " with " + r2.args[i].name);
                    }
                    r2.args[i].unify(r1.args[i]);
                }
            }
            if((RuleEngine.getTypeName(r2.args[i]) == 'Term' && r2.args[i].isGrounded()) && (RuleEngine.getTypeName(r2.args[i]) == 'Term' && !r2.args[i].isGrounded())) {
                throw "cannot unify two grounded header args";
            }
        }
        if(is_debug) {
            console.log("_dbg exiting unifyRuleHeaders");
        }
    };
    RuleEngine.prototype.handleFoundRules = function (query, foundRules) {
        if(is_debug) {
            console.log("_dbg in handleFoundRules");
            console.log("_dbg # foundRules: " + foundRules.length);
            console.log("_dbg # RuleEngine.body_rules: " + RuleEngine.body_rules.length);
            if(!this.check_copy_args_link_to_base_args(query)) {
                console.log("_dbg 5 rule: " + query.name + " args not found in alias chain of base query args!");
            } else {
                console.log("_dbg 5 rule: " + query.name + " args found in alias chain of base query args!");
            }
        }
        if(is_debug) {
            console.log("_dbg choices before adding: ");
            RuleEngine.dump_choices();
        }
        for(var i = foundRules.length - 1; i > 0; i--) {
            var body_rules_copy = [];
            for(var j = 0; j < RuleEngine.body_rules.length; j++) {
                body_rules_copy.unshift(RuleEngine.body_rules[j].deepcopy());
            }
            var choice = new Choice(query, foundRules[i], body_rules_copy);
            if(is_debug) {
                console.log("_dbg adding choice: " + foundRules[i].name);
            }
            RuleEngine.choices.push(choice);
        }
        if(is_debug) {
            console.log("_dbg choices after adding: ");
            RuleEngine.dump_choices();
        }
    };
    RuleEngine.prototype.check_copy_args_link_to_base_args = function (rule_copy) {
        var bq_args = RuleEngine.base_query.args;
        for(var i = 0; i < bq_args.length; i++) {
            for(var j = 0; j < rule_copy.args.length; j++) {
                if(RuleEngine.is_term_in_alias_chain(rule_copy.args[j], bq_args[i])) {
                    return true;
                }
            }
        }
        return false;
    };
    RuleEngine.prototype.prepareToFire = function (query, rule, is_body_rule) {
        if(is_debug) {
            console.log("_dbg in prepareToFire");
            var rule_check = query;
            if(!this.check_copy_args_link_to_base_args(rule_check)) {
                console.log("_dbg 4 rule: " + rule_check.name + " args not found in alias chain of base query args!");
            } else {
                console.log("_dbg 4 rule: " + rule_check.name + " args found in alias chain of base query args!");
            }
        }
        var rule_copy = rule.deepcopy();
        if(rule_copy.rules.length > 0) {
            this.unifyHeaderArgsToBodyCallArgs(rule_copy);
        }
        if(is_debug) {
            if(query.name == 'choose_hd') {
                console.log("_dbg choose_hd call: ");
                RuleEngine.dump_rule(query);
            }
        }
        if(!is_body_rule) {
            this.unifyRuleHeaders(query, rule_copy);
        } else {
            RuleEngine.rule_firing.is_context_change = true;
            if(is_debug) {
                console.log("_dbg adding RuleEngine.rule_firing.is_context_change = true: " + RuleEngine.rule_firing.name);
            }
            this.addBodyRule(RuleEngine.rule_firing);
            this.addHeaderBodyArgs(query);
            this.unifyHeaderBodyArgsToQueryArgs(query);
            this.unifyRuleHeaders(query, rule_copy);
        }
        if(is_debug) {
            if(query.name == 'choose_hd') {
                console.log("_dbg choose_hd call after unifyRuleHeaders: ");
                RuleEngine.dump_rule(rule_copy);
            }
        }
        if(is_debug) {
            if(!this.check_copy_args_link_to_base_args(rule_copy)) {
                console.log("_dbg 3 rule_copy: " + rule_copy.name + " args not found in alias chain of base query args after unifying with query: " + query.name);
            } else {
                console.log("_dbg 3 rule_copy: " + rule_copy.name + " args found in alias chain of base query args after unifying with query: " + query.name);
            }
        }
        if(is_debug) {
            if(query.name == 'choose_hd') {
                console.log("_dbg choose_hd rule after unifying header and body args: ");
                RuleEngine.dump_rule(rule_copy);
            }
        }
        return rule_copy;
    };
    RuleEngine.prototype.popBodyRule = function () {
        if(!RuleEngine.async_hold) {
            if(is_debug) {
                console.log("_dbg about to pop a body rule");
                console.log("_dbg RuleEngine.body_rules.length: " + RuleEngine.body_rules.length);
            }
            var popped_body_rule = RuleEngine.body_rules.pop();
            if(popped_body_rule && popped_body_rule.is_context_change) {
                if(is_debug) {
                    console.log("_dbg context change to RuleEngine.rule_firing: " + popped_body_rule.name);
                }
                RuleEngine.rule_firing = popped_body_rule;
                this.popBodyRule();
            } else {
                RuleEngine.body_rule_firing = popped_body_rule;
            }
        }
    };
    RuleEngine.prototype.handleAsyncInput = function (input_str) {
        if(is_debug) {
            console.log("_dbg in handleAsyncInput");
        }
        RuleEngine.async_hold = false;
        var re = RuleEngine.getREInst();
        var header = RuleEngine.rule_firing;
        var bodyRule = RuleEngine.body_rule_firing;
        if(bodyRule) {
            if(is_debug) {
                console.log("_dbg bodyRule is defined");
            }
        } else {
            if(is_debug) {
                console.log("_dbg bodyRule is not defined");
            }
        }
        if(is_debug) {
            console.log("_dbg bodyRule.name: " + bodyRule.name);
        }
        var r = /^i\((.*)\)/;
        var arg_name = bodyRule.name.match(r)[1];
        console.log("\n");
        var arg = RuleEngine.findArg(arg_name, header.args);
        if(!arg) {
            arg = RuleEngine.findArg(arg_name, header.b_args);
        }
        if(!arg) {
            if(is_debug) {
                console.log("_dbg Term variable with name: " + arg_name + " not found, creating and adding to body args of header rule name:" + header.name);
            }
            arg = new Term(arg_name);
            header.addBarg(arg);
        }
        if(is_debug) {
            console.log("_dbg unifying value: " + input_str + " with arg name: " + arg.name);
        }
        arg.unify(input_str);
        if(is_debug) {
            console.log("_dbg num header.b_args: " + header.b_args.length);
        }
        re.handleNonCallAsync(false);
    };
    RuleEngine.prototype.addHeaderBodyArgs = function (call_rule) {
        if(is_debug) {
            console.log("_dbg in addHeaderBodyArgs");
        }
        var header = RuleEngine.rule_firing;
        for(var i = 0; i < call_rule.args.length; i++) {
            var arg = RuleEngine.findArg(call_rule.args[i].name, header.args);
            if(!arg) {
                if(is_debug) {
                }
                arg = RuleEngine.findArg(call_rule.args[i].name, header.b_args);
            }
            if(!arg) {
                if(is_debug) {
                    console.log("_dbg adding term to header body args: " + call_rule.args[i].name);
                }
                arg = new Term(call_rule.args[i].name);
                header.addBarg(arg);
            }
        }
    };
    RuleEngine.prototype.handleNonCallBodyRule = function (header, bodyRule) {
        if(is_debug) {
            console.log("_dbg in handleNonCallBodyRule\n");
            console.log("_dbg header.name: " + header.name);
        }
        var is_fail = false;
        if(bodyRule.name.indexOf('==') > -1) {
            var n = bodyRule.name.split('==');
            if(is_debug) {
                console.log("_dbg n: " + JSON.stringify(n) + "\n");
                console.log("_dbg num header args: " + header.args.length + "\n");
                console.log("_dbg num header b_args: " + header.b_args.length + "\n");
            }
            var arg = RuleEngine.findArg(n[0], header.args);
            if(!arg) {
                if(is_debug) {
                    console.log("_dbg header.b_args: " + JSON.stringify(header.b_args) + "\n");
                }
                arg = RuleEngine.findArg(n[0], header.b_args);
            }
            if(is_debug) {
                console.log("_dbg arg name: " + arg.name + "\n");
                console.log("_dbg == arg.getGrounded(): " + arg.getGrounded() + "\n");
            }
            if(arg.getGrounded() != n[1]) {
                is_fail = true;
            }
        } else {
            if(bodyRule.name.indexOf('=') > -1) {
                var n = bodyRule.name.split('=');
                var arg = RuleEngine.findArg(n[0], header.args);
                if(!arg) {
                    arg = RuleEngine.findArg(n[0], header.b_args);
                }
                if(!arg) {
                    if(is_debug) {
                        console.log("_dbg Term variable with name: " + n[0] + " not found, creating and adding to body args of header rule");
                    }
                    arg = new Term(n[0]);
                    header.addBarg(arg);
                }
                if(is_debug) {
                    console.log("_dbg about to unity value: " + n[1] + " with arg name: " + arg.name + "\n");
                }
                arg.unify(n[1]);
                if(is_debug) {
                    RuleEngine.dump_term_alias_chain(arg);
                    var bq_hd_arg = RuleEngine.base_query.args[0];
                    RuleEngine.dump_term_alias_chain(bq_hd_arg);
                }
            } else {
                if(bodyRule.name == '!') {
                    console.log("_dbg executing cut, emptying choice points");
                    RuleEngine.choices = [];
                } else {
                    if(bodyRule.name.indexOf('fail') > -1) {
                        if(is_debug) {
                            console.log("_dbg executing fail");
                        }
                        is_fail = true;
                    } else {
                        if(bodyRule.name.indexOf('o(') > -1) {
                            var r = /^o\((.*)\)/;
                            Util.output(bodyRule.name.match(r)[1]);
                        } else {
                            if(bodyRule.name.indexOf('i(') > -1) {
                                var r = /^i\((.*)\)/;
                                var arg_name = bodyRule.name.match(r)[1];
                                if(is_debug) {
                                    console.log("_dbg input into varible: " + arg_name);
                                }
                                Util.input(this.handleAsyncInput);
                            } else {
                                if(bodyRule.name.indexOf('ov(') > -1) {
                                    if(is_debug) {
                                        console.log("_dbg in ov body rule");
                                    }
                                    var r = /^ov\((.*)\)/;
                                    var arg_name = bodyRule.name.match(r)[1];
                                    if(is_debug) {
                                        console.log("_dbg arg_name: " + arg_name);
                                    }
                                    var arg = RuleEngine.findArg(arg_name, header.args);
                                    if(!arg) {
                                        arg = RuleEngine.findArg(arg_name, header.b_args);
                                    }
                                    Util.output(arg.getGrounded());
                                }
                            }
                        }
                    }
                }
            }
        }
        if(is_debug) {
            console.log("_dbg about to call handleNonCallAsync");
            console.log("_dbg is_fail: " + is_fail);
        }
        this.handleNonCallAsync(is_fail);
    };
    RuleEngine.prototype.prepareToCall = function (call_rule, is_body_rule) {
        if (typeof is_body_rule === "undefined") { is_body_rule = false; }
        if(is_debug) {
            console.log("_dbg processing rule name: " + call_rule.name + " in prepareToCall");
            RuleEngine.dump_rule(call_rule);
            console.log("_dbg   RuleEngine.rule_firing.name: " + RuleEngine.rule_firing.name);
        }
        this.addHeaderBodyArgs(call_rule);
        var foundRules = this.searchRules(RuleEngine.rules, call_rule.name, call_rule.args);
        if(is_debug) {
            console.log("_dbg num rules found: " + foundRules.length + "\n");
        }
        this.handleFoundRules(call_rule, foundRules);
        if(foundRules.length) {
            if(is_debug) {
                console.log("_dbg foundRules[0].rules.length: " + foundRules[0].rules.length);
            }
            var rule_copy = this.prepareToFire(call_rule, foundRules[0], is_body_rule);
            if(is_debug) {
                console.log("_dbg copy of rule name: " + call_rule.name);
                RuleEngine.dump_rule(rule_copy);
            }
            return rule_copy;
        }
    };
    RuleEngine.prototype.handleNonCallAsync = function (is_fail) {
        if(is_debug) {
            console.log("_dbg in handleNonCallAsync");
            console.log("_dbg RuleEngine.async_hold: " + RuleEngine.async_hold);
            if(RuleEngine.rule_firing.b_args.length > 0) {
                console.log("RuleEngine.rule_firing.b_args[0].getGrounded(): " + RuleEngine.rule_firing.b_args[0].getGrounded());
            }
        }
        if(RuleEngine.async_hold) {
            return;
        }
        if(!RuleEngine.async_hold) {
            if(is_debug) {
                console.log("_dbg RuleEngine.async_hold is false");
            }
            if(is_fail) {
                if(is_debug) {
                    console.log("_dbg fail detected in bodyRules execution, backtracking...");
                }
                this.backTrack();
            }
            this.popBodyRule();
            if(is_debug) {
                console.log("_dbg about to call handleBodyRule");
            }
            this.handleBodyRule();
            this.handleBaseQueryFinish();
        }
    };
    RuleEngine.prototype.handleBodyRule = function () {
        if(RuleEngine.async_hold) {
            if(is_debug) {
                console.log("_dbg async_hold is true not executing body rule");
            }
            return;
        }
        var header = RuleEngine.rule_firing;
        var bodyRule = RuleEngine.body_rule_firing;
        if(!bodyRule) {
            return;
        }
        if(!bodyRule.is_non_call()) {
            var is_body_rule = true;
            var rule_copy = this.prepareToCall(bodyRule, is_body_rule);
            this.fireRule(rule_copy);
        } else {
            if(is_debug) {
                console.log("_dbg processing non call rule name: " + bodyRule.name);
            }
            this.handleNonCallBodyRule(header, bodyRule);
        }
    };
    RuleEngine.prototype.fireRule = function (r) {
        RuleEngine.rule_firing = r;
        if(is_debug) {
            console.log("_dbg firing rule: " + r.name + "\n");
            console.log("_dbg r.rules.length: " + r.rules.length);
            console.log("_dbg r.args[0]: " + RuleEngine.getTypeName(r.args[0]));
        }
        if(r.is_query()) {
            if(is_debug) {
                console.log("_dbg executing query rule: " + r.name + "\n");
            }
            var rule_copy = this.prepareToCall(r);
            if(is_debug) {
                console.log("_dbg about to fire rule_copy with name: " + rule_copy.name);
                console.log("_dbg  rule_copy.rules.length: " + rule_copy.rules.length);
            }
            this.fireRule(rule_copy);
            if(RuleEngine.async_hold) {
                return;
            }
        } else {
            if(is_debug) {
                console.log("_dbg rule: " + r.name + " is not a query\n");
            }
        }
        for(var l in r.rules) {
            var bodyRule = r.rules[l];
            this.addBodyRule(bodyRule);
        }
        if(is_debug) {
            console.log("_dbg added all body rules of rule: " + bodyRule.name);
            RuleEngine.dump_body_rules();
        }
        this.popBodyRule();
        if(is_debug) {
            console.log("_dbg current rule firing: " + RuleEngine.rule_firing.name);
            if(RuleEngine.body_rule_firing) {
                console.log("_dbg body rule processing after popBodyRule: " + RuleEngine.body_rule_firing.name);
            }
        }
        this.handleBodyRule();
        if(is_debug) {
            console.log("_dbg after handleBodyRule in fireRule");
        }
    };
    RuleEngine.is_term_in_alias_chain = function is_term_in_alias_chain(needle, haystack) {
        var done = false;
        var found = false;
        while(!done) {
            if(needle == haystack) {
                found = true;
                done = true;
            }
            if(RuleEngine.getTypeName(haystack.grounded) != 'Term' || haystack.isFree()) {
                done = true;
            } else {
                haystack = haystack.grounded;
            }
        }
        return found;
    }
    RuleEngine.dump_term_alias_chain = function dump_term_alias_chain(t) {
        return;
        if(RuleEngine.getTypeName(t.grounded) != 'Term') {
            console.log("_dbg t.name: " + t.name + " is bound to value" + t.grounded);
            return;
        }
        console.log("_dbg dumping alias chain:");
        console.log("_dbg t.name: " + t.name);
        if(t.isFree()) {
            console.log("_dbg t.name: " + t.name + " is free");
            return;
        }
        if(t.isBoundorAliased()) {
            if(RuleEngine.getTypeName(t.grounded) == 'Term') {
                console.log("_dbg t.name: " + t.name + " is aliased to " + t.grounded.name);
                RuleEngine.dump_term_alias_chain(t.grounded);
            } else {
                console.log("_dbg t.name: " + t.name + " is bound to value" + t.grounded);
            }
        }
    }
    RuleEngine.dump_rule = function dump_rule(r1) {
        console.log("_dbg rule name: " + r1.name);
        if(r1.args.length > 0) {
            for(var i = 0; i < r1.args.length; i++) {
                console.log("_dbg   args[" + i + "]: " + r1.args[i].name + " value: " + r1.args[i].getGrounded());
            }
        } else {
            console.log("_dbg   has no args");
        }
        if(r1.rules.length > 0) {
        } else {
            console.log("_dbg   has no body rules");
        }
    }
    RuleEngine.dump_body_rules = function dump_body_rules() {
        if(is_debug) {
            console.log("_dbg dumping body rules");
            for(var i = 0; i < RuleEngine.body_rules.length; i++) {
                var bodyRule = RuleEngine.body_rules[i];
                console.log("_dbg position: " + i + " bodyRule name: " + bodyRule.name + " is_context_change: " + bodyRule.is_context_change);
            }
        }
    }
    RuleEngine.dump_choices = function dump_choices() {
        if(is_debug) {
            console.log("_dbg dumping choices");
            for(var i = 0; i < RuleEngine.choices.length; i++) {
                var choice = RuleEngine.choices[i];
                if(RuleEngine.getTypeName(choice) == 'Choice') {
                    console.log("_dbg position: " + i + " query name: " + choice.query.name + " rule name: " + choice.rule.name + " type: " + RuleEngine.getTypeName(choice));
                    console.log("_dbg choice.body_rules: ");
                    for(var l = 0; l < choice.body_rules.length; l++) {
                        var bodyRule = choice.body_rules[l];
                        console.log("_dbg position: " + l + " bodyRule name: " + bodyRule.name + " is_context_change: " + bodyRule.is_context_change);
                    }
                } else {
                    console.log("_dbg position: " + i + " choice name: " + choice.name + " type: " + RuleEngine.getTypeName(choice));
                }
            }
        }
    }
    RuleEngine.prototype.isQuerySolved = function (r_args) {
        var is_solved = true;
        if(is_debug) {
            console.log("_dbg in isQuerySolved");
        }
        for(var i = 0; i < r_args.length; i++) {
            if(!r_args[i].isGrounded()) {
                if(is_debug) {
                    console.log("_dbg term: " + r_args[i].name + " is not grounded");
                }
                is_solved = false;
            } else {
                if(is_debug) {
                    console.log("_dbg term: " + r_args[i].name + " is grounded with value: " + r_args[i].getGrounded());
                }
            }
        }
        return is_solved;
    };
    RuleEngine.prototype.handleFindMoreSolutions = function (input_str) {
        if(is_debug) {
            console.log("_dbg in handleFireMoreSolutions");
        }
        RuleEngine.async_hold = false;
        if(input_str == 'yes') {
            var re = RuleEngine.getREInst();
            re.backTrack();
        } else {
            if(RuleEngine.finished_cb) {
                RuleEngine.finished_cb();
            }
        }
    };
    RuleEngine.prototype.handleQueryResult = function () {
        if(is_debug) {
            console.log("_dbg in handleQueryResult");
        }
        var q = RuleEngine.base_query;
        var output_ar = [];
        if(this.isQuerySolved(q.args)) {
            output_ar.push('Query: ' + q.name + ' was solved, solutions are: \n');
            for(var i = 0; i < q.args.length; i++) {
                output_ar.push('arg name: ' + q.args[i].name + ' ground val: ' + q.args[i].getGrounded() + '\n');
            }
        } else {
            output_ar.push('Query: ' + q.name + ' was not solved\n');
        }
        if(RuleEngine.choices.length > 0) {
            if(is_debug) {
                console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
            }
            output_ar.push('There are other possible solutions, should the solver continue?\n');
            Util.output(output_ar.join(''));
            output_ar = [];
            RuleEngine.dump_choices();
            if(RuleEngine.more_solutions_prompt == true) {
                Util.input(this.handleFindMoreSolutions);
            }
        }
        if(output_ar.length > 0) {
            Util.output(output_ar.join(''));
        }
    };
    return RuleEngine;
})();
