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

const difflib = require('difflib');
const readline = require('readline');

let selection_range = 1;

function consoleFresh(title) {
  console.clear();
  console.log(title);
  console.log("=".repeat(47));
}

function choice(...values) {
    if (values.length == 1) {
      return values[0][Math.floor(Math.random()*values.length)];
    } else {
      return values[Math.floor(Math.random()*values.length)];
    }
}

let response = undefined;
let memory = {};
let should_learn = true;
let awaiting_input = false;

function converse(user_input) {
  if (should_learn) {
    if (!memory[response]) {
      // console.log('<CREATING KEY>');
      memory[response] = [];
    }
    memory[response].push(user_input);
    response = undefined;
  }
  
  if (Object.keys(memory).length > 0) {
    if (memory[user_input]) {
      // console.log('<EXACT MATCH>');
      response = choice(memory[user_input]);
    } else {
      // console.log('<DIFFLIB MATCH>');
      response = choice(memory[choice(difflib.getCloseMatches(user_input, Object.keys(memory), selection_range, 0))]);
    }
  }
  
  if (response) {
    // console.log('<RESPONSE>');
    return response;
  } else {
    throw "Should always return a value, FIXME!";
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
  let response;
  while (!( response = converse(user_input) )) {}
  console.log ( '< Aph >  ' + response );
  rl.prompt();
}).on('close', () => {
  console.log('end');
  process.exit(0);
});