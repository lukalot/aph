const difflib = require('difflib');
const readline = require('readline');
const fs = require('fs');
const parseCommand = require ( './command-parser.js' );

let title_art = `
  █████╗ ██████╗ ███╗ ███╗
 ██╔══██╗██╔══██╗██╔╝ ██╔╝
 ███████║██████╔╝███████║
 ██╔══██║██╔═══╝ ██╔══██║
 ██║  ██║██║     ██║  ██║
 ╚═╝  ╚═╝╚═╝    ███║ ███║
 © 2020 Lukalot ╚══╝ ╚══╝`;

let selection_range = 1;
let prefix = '.';

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

function get_help() {
  return `================== uwuAI Help ==================
 ${prefix}help : Looks like you found this one
 ${prefix}memory : Output memory data
 ${prefix}memorysize : Output memory size (based on the amount of keys stored in json)
 ${prefix}reset : Reset program to initial state
 ${prefix}forget : Forget all memory data
 ${prefix}clear : Clear console
 ${prefix}shouldlearn : Toggle learning on or off
 ${prefix}save : Save memory to the given save file
 ${prefix}load : Load memory from the given save file
================================================`;
}

let response = '';
let memory = {};
let should_learn = true;
let bool_onoff = { "true": "on", "false": "off" }

let commands = {
  "help" : () => get_help(),
  "memory" : () => JSON.stringify ( memory ),
  "memorysize" : () => Object.keys ( memory ).length,
  "reset" : () => { memory = {}; should_learn = true; console.log ( "Memory cleared, Learning: " + bool_onoff [ should_learn ] ) },
  "forget" : () => { memory = {}; console.log ( "Memory cleared" ) },
  "clear" : () => consoleFresh(title_art),
  "shouldlearn" : () => { should_learn = !should_learn; console.log ( "Learning: " + bool_onoff [ should_learn ] ) },
  "save" : ( switches, filename ) => {
    if (filename) {
      fs.writeFileSync('saves/' + filename + '.json', JSON.stringify ( memory ), "utf8");
      console.log("Saved " + Object.keys ( memory ).length + " memory keys to " + filename + ".json")
    } else {
      fs.writeFileSync('saves/_default.json', JSON.stringify ( memory ), "utf8");
      console.log("Saved " + Object.keys ( memory ).length + " memory keys to default save location (_default.json)")
    }
  },
  "load" : ( switches, filename ) => {
      if (filename) {
        memory = JSON.parse(fs.readFileSync('saves/' + filename + '.json', "utf8"));
        console.log("Loaded " + Object.keys ( memory ).length + " memory keys from " + filename + ".json")
      } else {
        let res = '';
        fs.readdirSync('./saves', { withFileTypes: false }).forEach(file => {
          res = res + file + ', '
        })

        if (res) {
          console.log("Loadable saves:\n" + ((res) ? res : "<none>"));
        } else {
          console.log("No saves found in ./saves")
        }
      }
    },
  "setprefix" : newprefix => { prefix = newprefix }
}

let aliases = {
    "h": "help",
    "m": "memory",
    "ms": "memorysize",
    "r": "reset",
    "f": "forget",
    "c": "clear",
    "cls": "clear",
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
  let command, args, flags, response;
  if (user_input.startsWith(prefix)) {
    { command, args, flags } = parseCommand ( user_input );
    if ( command in commands ) {
      // console.log ( '<USER COMMAND>' );
      response = commands [ command ] ( flags, ...args );
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
