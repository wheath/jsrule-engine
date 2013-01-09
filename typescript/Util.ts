declare var require: any;

class Util {
  public static is_in_browser() {
    return !(typeof window === 'undefined');
  }

  public static output(s: any) {
    if(Util.is_in_browser()) {
      alert(s);
    } else {
      console.log(s + '\n');
    }
  }

  public static input() {
    if(Util.is_in_browser()) {
      var input_str = prompt("Enter input", "Type your input here");
    } else {
      var fs = require('fs');
      console.log("\npress ctrl-d ctrl-d when done with input...\n");
      var input_str = fs.readFileSync('/dev/stdin', 'utf-8');
    }

    return input_str;
  }

}
