/// <reference path="jquery.d.ts" />
declare var require: any;


class Util {
  public static is_in_browser() {
    return !(typeof window === 'undefined');
  }

  public static output(s: any) {
    if(Util.is_in_browser()) {
      //alert(s);
      document.getElementById('output_div').innerHTML = s;
      //window.prompt(s, 'info only, just press ok');
    } else {
      console.log(s + '\n');
    }
  }

  public static inputRadio(cb: any, radio_data) {
    //var re = RuleEngine.getREInst();
    RuleEngine.async_hold = true;
    if(is_debug) {
      console.log("_dbg in input");
      console.log("_dbg rule_firing # b_args: " + RuleEngine.rule_firing.b_args.length);
      //console.log("_dbg RuleEngine.body_rule_firing.name: " + RuleEngine.body_rule_firing.name);
    }
    if(Util.is_in_browser()) {
      var radio_input_div = document.getElementById("radio_input_div");

      var btn_string = '';
      var radio_btn_cnt = 0;
      for(var k in radio_data) {
        radio_btn_cnt++;
        if(radio_data.hasOwnProperty(k)) {
          console.log('key is: ' + k + ', value is: ' + radio_data[k]);
          btn_string += '<label for="radB' + radio_btn_cnt + '" class="txtradbttn"><input id="radB' + radio_btn_cnt + '" type="radio" class="processor' + radio_btn_cnt + '" name="radio_input" value="' + radio_data[k] + '">'+k+'</label>';
                    					
        }
      }

      console.log("_dbg btn_string: " + btn_string);
      if(RuleEngine.use_continue_btn == true) {
	$('#radio_input_div').html('\
	  <form id="radio_input_form" method="POST" onsubmit="return false;">\
	    ' + btn_string + ' \
	    <input type="submit" value="Submit" onclick="Util.handle_radio_input();">\
	  </form>');
      } else {
	$('#radio_input_div').html('\
	  <form id="radio_input_form" method="POST" onsubmit="Util.handle_radio_input();return false;">\
	    ' + btn_string + ' \
	  </form>');
	$('input[type="radio"][name="radio_input"]').click(function () { var closestForm = $(this).parents('form');  closestForm.submit();});

      }


      //document.forms['radio_input_form'].parentNode.removeChild(document.forms['radio_input_form']);

      /*
      for(var i = 0; i < radio_btns.length; i++) {
        radio_btns[i].parentNode.removeChild(radio_btns[i]);
      } */


      radio_input_div.style.display = "inline";
      RuleEngine.input_cb = cb;
      //var input_str = window.prompt("Enter input", "Enter yes or no");
      //cb(input_str);
    } else {
      var prompt = require('prompt');
      prompt.start();

      prompt.get(['input_str'], function (err, result) {
          if (err) { return onErr(err); }
              if(is_debug) {
                console.log('Command-line input received:');
                console.log('  input_str: ' + result.input_str);
              } 
              //console.log("_dbg after RuleEngine.body_rule_firing.name: " + RuleEngine.body_rule_firing.name);
              cb(result.input_str);
              //re.handleAsyncInput(result.input_str);
              //console.log('  Email: ' + result.email);
          });

      function onErr(err) {
        console.log(err);
          return 1;
            }



      /*
      var fs = require('fs');
      console.log("\npress ctrl-d ctrl-d when done with input...\n");
      var input_str = fs.readFileSync('/dev/stdin', 'utf-8');
      */

    }

    //re.handleAsyncInput(input_str);
    //return input_str;
  }

  public static input(cb: any) {
    //var re = RuleEngine.getREInst();
    RuleEngine.async_hold = true;
    if(is_debug) {
      console.log("_dbg in input");
      console.log("_dbg rule_firing # b_args: " + RuleEngine.rule_firing.b_args.length);
      //console.log("_dbg RuleEngine.body_rule_firing.name: " + RuleEngine.body_rule_firing.name);
    }
    if(Util.is_in_browser()) {
      var input_div = document.getElementById("input_div");
      input_div.style.display = "inline";
      RuleEngine.input_cb = cb;
      //var input_str = window.prompt("Enter input", "Enter yes or no");
      //cb(input_str);
    } else {
      var prompt = require('prompt');
      prompt.start();

      prompt.get(['input_str'], function (err, result) {
          if (err) { return onErr(err); }
              if(is_debug) {
                console.log('Command-line input received:');
                console.log('  input_str: ' + result.input_str);
              } 
              //console.log("_dbg after RuleEngine.body_rule_firing.name: " + RuleEngine.body_rule_firing.name);
              cb(result.input_str);
              //re.handleAsyncInput(result.input_str);
              //console.log('  Email: ' + result.email);
          });

      function onErr(err) {
        console.log(err);
          return 1;
            }



      /*
      var fs = require('fs');
      console.log("\npress ctrl-d ctrl-d when done with input...\n");
      var input_str = fs.readFileSync('/dev/stdin', 'utf-8');
      */

    }

    //re.handleAsyncInput(input_str);
    //return input_str;
  }

  public static add_qa_bool_rule() {
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

  public static handle_radio_input(document) {
    console.log("_dbg in handle_radio_input");
    var radio_val = $("#radio_input_form input[type='radio']:checked").val();
    console.log("_dbg radio_val: " + radio_val);
    $("#radio_input_div").hide();
    $("input:radio[name='radio_input']").each(function () { 
      $(this).prop('checked', false); 
    });

    RuleEngine.input_cb(radio_val);
  }


  public static handle_binary_input(document) {
    console.log("_dbg in handle_binary_input");
    var oRadio = document.forms[1].elements['binary_input'];
    var radio_val = $("#input_form input[type='radio']:checked").val();
   
    console.log("_dbg radio_val: " + radio_val);
    $("#input_div").hide();
    RuleEngine.input_cb(radio_val);
  }

  //utility function to help with disjunction approximation via backtracking

  public static create_rule_header(rule_name, header_args) {
    var new_rule = new Rule(rule_name);
    for(var i=0; i < header_args.length;i++) {
      new_rule.addArg(header_args[i]);
    }

    return new_rule;
  }

  //gen_rules_from_qa table

  public static create_rule_from_qa_table(input_rule_name, input_rulehdr_args,  
				   qa_t, call_rule_name) {

    var qa_input_rule = this.create_rule_header(input_rule_name, input_rulehdr_args);
    var call_rule_args = []; 
    for(var i=0; i < qa_t.length; i++) {
      var qa_info = qa_t[i];
      qa_input_rule.rules.push(new Rule('o(' + qa_info[0] + ')'));
      if(qa_info[1] == 'yes_no') {
	qa_input_rule.rules.push(new Rule('i(' + qa_info[2] + ')'));
	call_rule_args.push(new Term(qa_info[2]));
      }
    }

    //TODO: assumes last arg is not grounded and should be passed etc...
    //this may not always be true.  Not sure why a new Term is necesary but if
    //not it gets into an infinite loop
    for(var i=0; i < input_rulehdr_args.length; i++) {
      call_rule_args.push(new Term(input_rulehdr_args[i].name));
    }

    var call_rule = this.create_rule_header(call_rule_name, call_rule_args);
    //console.log("_dbg call_rule_args.length: " + call_rule_args.length);
    //console.log("_dbg last call_rule_args name: " + call_rule_args[call_rule_args.length-1].name);
    qa_input_rule.rules.push(call_rule);

    return qa_input_rule;
  } 


  //truth table function to quickly generate rules from simple arrays

  public static gen_rules_from_truth_table(rule_name, header_args, tt) {
    var generated_rules = [];
    for(var i=0; i < tt.length; i++) {
      var rule = this.create_rule_header(rule_name, header_args);
      var body_tt_row = tt[i];
      for(var j=0; j < body_tt_row.length; j++) {
	if(body_tt_row[j] === undefined) {
	  continue;
	}
	if(j == body_tt_row.length-2) {
	  if(body_tt_row[j]!==undefined) { 
	    rule.addRule(new Rule(header_args[j].name + '=' + body_tt_row[j]));
	  }
	} else if(j==body_tt_row.length-1) {
	  if(Object.prototype.toString.call(body_tt_row[j]) == "[object Array]") {
	    var suffix_rules = body_tt_row[j];
	    for(var k=0; k < suffix_rules.length; k++) {
	      rule.addRule(suffix_rules[k]);  
	    }
	  } 
	} else {
	  rule.addRule(new Rule(header_args[j].name + '==' + body_tt_row[j]));
	}
      }
      generated_rules.push(rule); 
    }
    return generated_rules;
  }




}
