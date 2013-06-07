jison prolog.jison
head -n -16 prolog.js > prolog_js_headed.js
sh compile.sh
sh cat_lib.sh
cat re_lib.js prolog_js_headed.js use_parser.js > prolog_parser_cmd.js
node prolog_parser_cmd.js
