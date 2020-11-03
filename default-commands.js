const bool_onoff = require ( "./helpers.js" ).bool_onoff;

let aliases = {};

let helpers = {
    consoleFresh: ( title ) => {
        console.clear ();
        console.log ( title );
        console.log ( "=".repeat ( 48 ) );
    },
    showAliases: () => "{\n    " +
        Object.entries ( aliases ).sort ( ( a, b ) => a [ 0 ] < b [ 0 ] ? -1 : a [ 0 ] > b [ 0 ] ? 1 : 0 ).map ( i => i.join ( ": " ) ).join ( "\n    " ) +
        "\n}"
};

let commands = {
    "about-aph": [ "about", () =>
        fs.readFileSync( 'README.md', "utf8" )
    ],
    "add-key-response": [ "setkr", "skr", function ( switches, key, resp ) {
        this.memory [ key ].push ( resp );
        console.log ( "Added response '" + resp + "' to key '" + key + "'" )
    } ],
    "clear-screen": [ "c", "cls", function () {
        consoleFresh ( this.constructor.TITLE_ART )
    } ],
    "delete-key": [ "dk", function ( switches, key ) {
        let memory = this.memory;
        console.log ( "Deleted key '" + key + "' including " + memory [ key ].length + " responses from memory" );
        delete memory [ key ];
    } ],
    "forget-memory": [ "f", function () {
        this.memory = {};
        this.response = '';
        console.log ( "Memory cleared" );
    } ],
    "get-help": [ "h", "help", function () {
        let help = "help";
        let res = "=================== Aph Help ===================\n";
        for ( const name of Object.keys ( this.commands ) ) {
            res = res + " " + this.prefix + name + " : " + help + "\n";
        }
        res = res + this.constructor.DIVIDER_ART
        return res;
    } ],
    "get-memory": [ "m", function () {
        return JSON.stringify ( this.memory );
    } ],
    "get-memory-size": [ "ms", function () {
        return Object.keys ( this.memory ).length + " keys are in memory"
    } ],
    "get-saves-list": [ "ls", () => {
        let res = '';
        fs.readdirSync ( './saves', {
            withFileTypes: false
        } ).forEach ( ( filen, idx, array ) => {
            res = res + filen;
            if ( idx !== array.length - 1 ) {
                // insert commas on all but the last iteration.
                res = res + ', ';
            }
        } )

        if ( res ) {
            console.log ( res ? res : "<none>" );
        } else {
            console.log ( "No saves found in ./saves" );
        }
    } ],
    "get-version": [ "v", "ver", "version", function () {
        return "Aph " + this.constructor.VERSION;
    } ],
    "load-memory": [ "ld", "load", ( switches, filename ) => {
        let memory;
        if ( filename ) {
            try {
                memory = JSON.parse ( fs.readFileSync ( 'saves/' + filename + '.json', "utf8" ) );
                console.log ( "Loaded " + Object.keys ( memory ).length + " memory keys from " + filename + ".json" );
            } catch {
                console.log ( "Couldn't find save file '" + filename + ".json'" );
            }
        } else {
            memory = JSON.parse ( fs.readFileSync ( 'saves/_default.json', "utf8" ) );
            console.log ( "Loaded " + Object.keys ( memory ).length + " memory keys from default save location (_default.json)" );
        }

        this.memory = memory;
    } ],
    "reset-program": [ "r", "reset", function () {
        this.memory = {};
        this.response = '';
        this.should_learn = true;
        helpers.consoleFresh ( this.constructor.TITLE_ART );
    } ],
    "save-memory": [ "s", "save", function ( switches, filename ) {
        let memory = this.memory;

        if ( filename ) {
            try {
                fs.writeFileSync ( 'saves/' + filename + '.json', JSON.stringify ( memory ), "utf8" );
                console.log ( "Saved " + Object.keys ( memory ).length + " memory keys to " + filename + ".json" );
            } catch {
                console.log ( "Couldn't save to file '" + filename + ".json' (Invalid filename?)" );
            }
        } else {
            fs.writeFileSync ( 'saves/_default.json', JSON.stringify ( memory ), "utf8");
            console.log ( "Saved " + Object.keys ( memory ).length + " memory keys to default save location (_default.json)" );
        }
    } ],
    "set-prefix": [ "pre", "prefix", "sp", function ( switches, newprefix ) {
        if (typeOf(newprefix) == 'string') {
            this.prefix = newprefix;
            console.log("Command prefix set to '" + this.prefix + "'")
        } else {
            console.log("incorrect usage");
        }
    } ],
    "should-learn": [ "sl", () => {} ],
    "toggle-learn": [ "l", function () {
        this.should_learn = !this.should_learn;
        console.log("Learning: " + bool_onoff [ this.should_learn ] );
    } ],
};

for ( let [ key, val ] of Object.entries ( commands ) ) {
    let callback = val.pop ();

    for ( name in val ) {
        if ( name in aliases ){
            throw new Error ( "Duplicate aliases are not allowed" );
        }
        aliases [ name ] = key;
    }

    commands [ key ] = callback;
}

module.exports = {
    commands: commands,
    aliases: aliases,
    helpers: helpers,
    get prefix () {
        return prefix;
    },
    set prefix ( val ) {
        prefix = val;
    }
};
