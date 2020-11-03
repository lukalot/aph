// dependencies
const   difflib = require ( 'difflib' ),
        readline = require ( 'readline' ),
        fs = require ( 'fs' ),

// aph modules
        parseCommand = require ( './command-parser.js' ),
        default_commands = require ( './default-commands.js' ),
        { commands, aliases, helpers: cmd_helpers } = default_commands,
        Aph = require ( './Aph.js' );

// defaults
// memory = {}, commands = {}, aliases = {}, prefix = '.', selection_range = 1, should_learn = true,
const aph = new Aph ( {}, commands, aliases );

// initial console set
cmd_helpers.consoleFresh ( Aph.TITLE_ART );

const rl = readline.createInterface ( {
    input: process.stdin,
    output: process.stdout,
    prompt: '< User > '
} );

rl.prompt()

rl.on ( 'line', ( user_input ) => {
    let response;
    if ( user_input.startsWith ( prefix ) ) {

        let { command, args, flags } = parseCommand ( user_input ) );

        if ( command in aph.aliases ) {
            command = aph.aliases [ command ];
        }

        if ( command in aph.commands ) {
            // console.log ( '<USER COMMAND>' );
            try {
                let callback = aph.commands [ command ]
                aph.response = callback [ callback.length - 1 ] .call ( aph, flags, ...args );
                if ( aph.response ) {
                    console.log ( aph.response );
                }
            } catch {
                console.log("'" + command + "' is running into a problem.");
            }
        }
    } else {
        aph.converse ( user_input );
        console.log( '< Aph >  ' + aph.response );
    }
    rl.prompt();
} ).on ( 'close', () => {
    console.log ( "\n" + Aph.DIVIDER_ART );
    process.exit ( 0 );
} );
