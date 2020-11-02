
// dependencies
const difflib = require('difflib');
const readline = require('readline');
const fs = require('fs');

// aph modules
const parseCommand = require ( './command-parser.js' );

const VERSION = "v0.1 [alpha]"

const TITLE_ART = `
  █████╗ ██████╗ ███╗ ███╗
 ██╔══██╗██╔══██╗██╔╝ ██╔╝
 ███████║██████╔╝███████║
 ██╔══██║██╔═══╝ ██╔══██║
 ██║  ██║██║     ██║  ██║
 ╚═╝  ╚═╝╚═╝    ███║ ███║
 © 2020 Lukalot ╚══╝ ╚══╝ ${VERSION}`;

const DIVIDER_ART = "=".repeat(48);

// settings
let selection_range = 1;
let prefix = '.';
let should_learn = true;

// program variables
let response = '';
let memory = {};
let bool_onoff = { "true": "on", "false": "off" }

let commands = {
  "get-version" : () => "Aph " + VERSION,
  "about-aph" : () => fs.readFileSync('README.md', "utf8"),
  "get-help" : () => getHelp(),
  "get-memory" : () => JSON.stringify ( memory ),
  "get-memory-size" : () => Object.keys ( memory ).length + " keys are in memory",
  "reset-program" : () => { memory = {}; response = ''; should_learn = true; consoleFresh(TITLE_ART);},
  "forget-memory" : () => { memory = {}; response = ''; console.log ( "Memory cleared" ) },
  "clear-screen" : () => consoleFresh(TITLE_ART),
  "toggle-learn" : () => { should_learn = !should_learn; console.log ( "Learning: " + bool_onoff [ should_learn ] ) },
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
  "set-prefix" : (switches, newprefix) => {
    if (typeOf(newprefix) == 'string') {
      prefix = newprefix; console.log("Command prefix set to '" + prefix + "'")
    } else {
      console.log("incorrect usage");
    } 
  },
  "add-key-response" : (switches, key, resp) => { memory[key].push(resp); console.log("Added response '" + resp + "' to key '" + key + "'") },
  "delete-key" : (switches, key) => { console.log("Deleted key '" + key + "' including " + memory[key].length + " responses from memory"); delete memory[key]; },
}

let aliases = {
    "c": "clear-screen",
    "cls": "clear-screen",
    "dk" : "delete-key",
    "f": "forget-memory",
    "about": "about-aph",
    "h": "get-help",
    "help": "get-help",
    "l": "toggle-learn",
    "ld": "load-memory",
    "load": "load-memory",
    "ls" : "get-saves-list",
    "m": "get-memory",
    "ms": "get-memory-size",
    "pre": "set-prefix",
    "prefix": "set-prefix",
    "r": "reset-program",
    "reset": "reset-program",
    "s": "save-memory",
    "save": "save-memory",
    "skr" : "add-key-response",
    "setkr" : "add-key-response",
    "sl": "should-learn",
    "sp": "set-prefix",
    "v": "get-version",
    "ver": "get-version",
    "version": "get-version"
}

// helper functions
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
  res = res + DIVIDER_ART
  return res;
}

// assign aliases to commands
for ( const [ name, alias ] of Object.entries ( aliases ) ) {
    commands [ name ] = commands [ alias ];
}

// main logic
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
    throw new Error("Should always return a [positive] value, FIXME!");
  }
}

// initial console set
consoleFresh(TITLE_ART);

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
        console.log ( "'" + command + "' is running into a problem." );
      }
    }
  } else {
    response = converse ( user_input );
    console.log ( '< Aph >  ' + response );
  }
  rl.prompt();
}).on('close', () => {
  console.log("\n" + DIVIDER_ART);
  process.exit(0);
});
