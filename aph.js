const difflib = require('difflib');
const readline = require('readline');
const fs = require('fs');

let title_art = `
  █████╗ ██████╗ ███╗ ███╗
 ██╔══██╗██╔══██╗██╔╝ ██╔╝
 ███████║██████╔╝███████║
 ██╔══██║██╔═══╝ ██╔══██║
 ██║  ██║██║     ██║  ██║
 ╚═╝  ╚═╝╚═╝    ███║ ███║
 © 2020 Lukalot ╚══╝ ╚══╝`;
 
let help_text = `================== uwuAI Help ==================
!h / !help : Looks like you found this one
!m / !memory : Output memory data
!ms / !memorysize : Output memory size (based on the amount of keys stored in json)
!r / !reset : Reset program to initial state
!f / !forget : Forget all memory data
!c / !clear : Clear console
!sl / !shouldlearn : Toggle learning on or off
!s / !save : Save memory to the given save file
!ld / !load : Load memory from the given save file
================================================`;

let selection_range = 1;
let prefix = '!';

function consoleFresh(title) {
  console.clear();
  console.log(title);
  console.log("=".repeat(48));
}

function choice(...values) {
    if (values.length == 1) {
      return values[0][Math.floor(Math.random()*values.length)];
    } else {
      return values[Math.floor(Math.random()*values.length)];
    }
}

let response = '';
let memory = {};
let should_learn = true;
let bool_onoff = { "true": "on", "false": "off" }

let commands = {
  "help" : () => help_text,
  "memory" : () => JSON.stringify ( memory ),
  "memorysize" : () => Object.keys ( memory ).length,
  "reset" : () => { memory = {}; should_learn = true; console.log ( "Memory cleared, Learning: " + bool_onoff [ should_learn ] ) },
  "forget" : () => { memory = {}; console.log ( "Memory cleared" ) },
  "clear" : () => consoleFresh(title_art),
  "shouldlearn" : () => { should_learn = !should_learn; console.log ( "Learning: " + bool_onoff [ should_learn ] ) },
  "save" : filename => { /*???*/ },
  "load" : filename => { /*???*/ },
  "setprefix" : newprefix => { prefix = newprefix }
}

let aliases = {
    "h": "help",
    "m": "memory",
    "ms": "memorysize",
    "r": "reset",
    "f": "forget",
    "c": "clear",
    "sl": "shouldlearn",
    "s": "save",
    "ld": "load",
    "sp": "setprefix",
    "pre": "setprefix" 
}

for ( const [ name, alias ] of Object.entries ( aliases ) ) {
    commands [ name ] = commands [ alias ];
}

function converse(user_input) {
  if (should_learn) {
    if (!memory[response]) {
      // console.log('<CREATING KEY>');
      memory[response] = [];
    }
    memory[response].push(user_input);
  }

  response = '';

  if (Object.keys(memory).length > 0) {
    if (memory[user_input]) {
      // console.log('<EXACT MATCH>')
      response = choice(memory[user_input])
    } else {
      // console.log('<DIFFLIB MATCH>')
      response = choice(memory[choice(difflib.getCloseMatches(user_input, Object.keys(memory), selection_range, 0))])
    }
  }
  
  if (response) {
    // console.log('<RESPONSE>');
    return response;
  } else {
    throw "Should always return a [positive] value, FIXME!";
  }
}

consoleFresh(title_art);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '< User > '
});

rl.prompt()

rl.on('line', (user_input) => {
  let command, response;
  if (user_input.startsWith(prefix)) {
    command = user_input.slice(1).split ( " " );
    if ( command [ 0 ] in commands ) {
      // console.log ( '<USER COMMAND>' );
      response = commands [ command [ 0 ] ] ( ...command.slice ( 1 ) );
      if ( response ) {
        console.log ( response );
      }
    }
  } else {
    response = converse ( user_input );
    console.log ( '< Aph >  ' + response );
  }
  rl.prompt();
}).on('close', () => {
  console.log('end');
  process.exit(0);
});