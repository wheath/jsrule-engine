declare var require: any;


class Util {
  public static is_in_browser() {
    return !(typeof window === 'undefined');
  }

  public static output(s: any) {
    if(Util.is_in_browser()) {
      //alert(s);
      document.getElementById('output_div').innerHTML = s;
      window.prompt(s, 'info only, just press ok');
    } else {
      console.log(s + '\n');
    }
  }

  public static input(re: RuleEngine) {
    re.async_hold = true;
    if(is_debug) {
      console.log("_dbg in input");
      console.log("_dbg rule_firing # b_args: " + re.rule_firing.b_args.length);
    }
    if(Util.is_in_browser()) {
      var input_str = window.prompt("Enter input", "Enter yes or no");
      re.handleAsyncInput(input_str);
    } else {
      var prompt = require('prompt');
      prompt.start();

      prompt.get(['input_str'], function (err, result) {
          if (err) { return onErr(err); }
              if(is_debug) {
                console.log('Command-line input received:');
                console.log('  input_str: ' + result.input_str);
              } 
              re.handleAsyncInput(result.input_str);
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

}
