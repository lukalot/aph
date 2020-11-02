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

function getHelp() {
  help = "help";
  res = "=================== Aph Help ===================\n";
  for ( const name of Object.keys ( commands ) ) {
    res = res + " " + prefix + name + " : " + help + "\n";
  }
  res = res + "================================================"
  return res;
}

let response = '';
let memory = {};
let should_learn = true;
let bool_onoff = { "true": "on", "false": "off" }

let commands = {
  "get-help" : () => getHelp(),
  "get-memory" : () => JSON.stringify ( memory ),
  "get-memory-size" : () => Object.keys ( memory ).length,
  "reset-program" : () => { memory = {}; response = ''; should_learn = true; consoleFresh(title_art);},
  "forget-memory" : () => { memory = {}; response = ''; console.log ( "Memory cleared" ) },
  "clear-screen" : () => consoleFresh(title_art),
  "should-learn" : () => { should_learn = !should_learn; console.log ( "Learning: " + bool_onoff [ should_learn ] ) },
  "save-memory" : ( switches, filename ) => {
    if (filename) {
      try {
        fs.writeFileSync('saves/' + filename + '.json', JSON.stringify ( memory ), "utf8");
        console.log("Saved " + Object.keys ( memory ).length + " memory keys to " + filename + ".json")
      } catch {
        console.log("Couldn't save to file '"+ filename + ".json' (Invalid filename?)")
      }
    } else {
      fs.writeFileSync('saves/_default.json', JSON.stringify ( memory ), "utf8");
      console.log("Saved " + Object.keys ( memory ).length + " memory keys to default save location (_default.json)")
    }
  },
  "load-memory" : ( switches, filename ) => {
      if (filename) {
        try {
          memory = JSON.parse(fs.readFileSync('saves/' + filename + '.json', "utf8"));
          console.log("Loaded " + Object.keys ( memory ).length + " memory keys from " + filename + ".json")
        } catch {
          console.log("Couldn't find save file '"+ filename + ".json'")
        }
      } else {
        memory = JSON.parse(fs.readFileSync('saves/_default.json', "utf8"));
        console.log("Loaded " + Object.keys ( memory ).length + " memory keys from default save location (_default.json)")
      }
    },
  "get-saves-list" : () => {
      let res = '';
      fs.readdirSync('./saves', { withFileTypes: false }).forEach((filen, idx, array) => {
        res = res + filen
        if (idx !== array.length - 1) {
          // insert commas on all but the last iteration.
          res = res + ', ';
        }
      })

      if (res) {
        console.log(((res) ? res : "<none>"));
      } else {
        console.log("No saves found in ./saves")
      }
    },
  "set-prefix" : newprefix => { prefix = newprefix },
}

let aliases = {
    "h": "get-help",
    "help": "get-help",
    "m": "get-memory",
    "ms": "get-memory-size",
    "r": "reset-program",
    "reset": "reset-program",
    "f": "forget-memory",
    "c": "clear-screen",
    "cls": "clear-screen",
    "sl": "should-learn",
    "l": "should-learn",
    "save": "save-memory",
    "s": "save-memory",
    "load": "load-memory",
    "ld": "load-memory",
    "sp": "set-prefix",
    "pre": "set-prefix",
    "prefix": "set-prefix",
    "ls" : "get-saves-list"
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

    ( { command, args, flags } = parseCommand ( user_input ) );
    
    if ( command in commands ) {
      // console.log ( '<USER COMMAND>' );
      try {
        response = commands [ command ] ( flags, ...args );
        if ( response ) {
          console.log ( response );
        }
      } catch {
        console.log ( "Alias '" + command + "' seems to point to a non-existant command name." );
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
