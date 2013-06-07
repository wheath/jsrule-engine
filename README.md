jsrule-engine
=============

backward chaining object oriented typescript inference rules engine

see the demo of it running in a web page here:

http://jsfiddle.net/xp_prg/ZZrdy/5/

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/xp_prg/ZZrdy/5/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

You can also run it on the command line with node.js.

Quickstart:

```
cd typescript
make
node raw.js
```

Goal:

To make a very simple, fast, ood, backward chaining inference rules engine using a small amount of code.

Background:

Javascript is everywhere!!!!  I hate regular javascript and want modules, objects, type checking,
etc... closure work arounds be damned.  Typescript offers this, bugs or not, I will take it :>

I want to use rules with backchaining, why is it sooo hard to find in a small javascript
library that does this?!!!  Everything is forward chaining and not easy to work with or uses some 
intermediate scripting language that makes it impossible or difficult to work with the underlying
objects.

Examples of this:
drools
nools (closest I could find)
using emscripten to convert swi prolog c/c++ code to js (gigantic mess)
jools

Thanks to a genius named RLa, he has created an actual prolog to js transpiler!!

Check it out here: https://gist.github.com/3869174

It is my hope to adapt this to my more ood simplistic approach

Tools used:

node js
node js modules:
  typescript
  nodeunit

Support:
  come to #prolog and talk to xp_prg (me) or email me at wgheath@gmail.com

