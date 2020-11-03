const
    VERSION = "v0.1 [alpha]",
    TITLE_ART = `
  █████╗ ██████╗ ███╗ ███╗
 ██╔══██╗██╔══██╗██╔╝ ██╔╝
 ███████║██████╔╝███████║
 ██╔══██║██╔═══╝ ██╔══██║
 ██║  ██║██║     ██║  ██║
 ╚═╝  ╚═╝╚═╝    ███║ ███║
 © 2020 Lukalot ╚══╝ ╚══╝ ${VERSION}`,
    DIVIDER_ART = "=".repeat ( 48 );

const difflib = require ( 'difflib' );

module.exports = class Aph {

    static VERSION = VERSION;
    static TITLE_ART = TITLE_ART;
    static DIVIDER_ART = DIVIDER_ART;

    constructor ( memory = {}, commands = {}, aliases = {}, prefix = '.', selection_range = 1, should_learn = true ) {
        this.memory = memory;
        this.commands = commands;
        this.aliases = aliases;
        this.prefix = prefix;
        this.selection_range = selection_range;
        this.should_learn = should_learn;
        this.response = '';
    }

    _choice ( ...values ) {
        if ( values.length == 1 ) {
            return values [ 0 ] [ Math.floor ( Math.random () * values.length ) ];
        } else {
            return values [ Math.floor ( Math.random () * values.length ) ];
        }
    }

    converse ( user_input ) {
        let memory = this.memory,
            response = this.response,
            should_learn = this.should_learn;

        if ( should_learn ) {
            if ( !memory [ response ] ) {
                // console.log('<CREATING KEY>');
                memory [ response ] = [];
            }
            memory [ response ].push ( user_input );
        }

        response = '';

        if ( Object.keys ( memory ).length > 0) {
            if ( memory [ user_input ] ) {
                // console.log('<EXACT MATCH>')
                response = this._choice ( memory [ user_input ] );
            } else {
                // console.log('<DIFFLIB MATCH>')
                response = this._choice(memory[this._choice(difflib.getCloseMatches(user_input, Object.keys(memory), this.selection_range, 0))])
            }
        }

        this.response = response;

        if (response) {
            // console.log('<RESPONSE>');
            return response;
        } else {
            throw new Error ( "Should always return a [positive] value, FIXME!" );
        }
    }
}
