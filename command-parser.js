module.exports = function parseCommand ( input ) {
    let match, current_state, current_flag;
    const   command = /^[a-zA-Z_$]+[a-zA-Z0-9_$-]*/,
            whitespace = /^\s+/,
            argument = /^"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+/,
            flag = /^-([a-zA-Z_$]+[a-zA-Z0-9_$-]*)/,
            result = {
                command: '',
                args: [],
                flags: {}
            },
            handleState = {
                start: input => {

                    // ignore empty command sequence
                    if ( input ) {
                        // consume command token
                        if ( match = input.match ( command ) ) {
                            result.command = match [ 0 ];
                            current_state = 'args';
                            return input.slice ( match [ 0 ].length );
                        }

                        throw new Error ( 'Command Parser: invalid command syntax "${match[0]}"' );
                    } else {
                        return input;
                    }
                },
                args: input => {
                    // ignore whitespace
                    if ( match = input.match ( whitespace ) ) {
                        input = input.slice ( match [ 0 ].length );
                    }

                    // ignore trailing whitespace
                    if ( input ) {
                        if ( match = input.match ( argument ) ) {       // consume argument if one is available
                            // unescape quotes
                            match [ 0 ] = match [ 0 ].replace ( /\\"/g, '"' ).replace ( /\\'/g, "'" );

                            if ( current_flag ) {
                                result.flags [ current_flag ].push ( match [ 0 ] );
                            } else {
                                result.args.push ( match [ 0 ] );
                            }
                            return input.slice ( match [ 0 ].length );
                        } else if ( input.startsWith ( '-' ) ) {
                            current_state = 'flags';
                            return input;
                        }

                        throw new Error ( 'Command Parser: invalid argument syntax "${match[0]}"' );
                    } else {
                        return input;
                    }
                },
                flags: input => {
                    // ignore whitespace
                    if ( match = input.match ( whitespace ) ) {
                        input = input.slice ( match [ 0 ].length );
                    }

                    // ignore trailing whitespace
                    if ( input ) {
                        if ( match = input.match ( flag ) ) {       // consume argument if one is available
                            if ( match [ 1 ] in result.flags ) {
                                throw new Error ( 'Command Parser: invalid repeated flag "${match[0]}"' );
                            } else {
                                current_flag = match [ 1 ];
                                result.flags [ current_flag ] = [];
                            }

                            return input.slice ( match [ 0 ].length );
                        } else {
                            current_state = 'args';
                            return input;
                        }
                    } else {
                        return input;
                    }
                }
            };

    // ignore command prefix
    input = input.slice ( 1 );

    // consume input, starting with command, then taking command args, then alternating between flags and flag args
    while ( input ) {
        input = handleState [ current_state ] ( input );
    }
    return result;
}
