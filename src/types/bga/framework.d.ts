/** Utility type which converts a union of object types to an intersection of object types. This allows for all possible properties to be accessible on a type without needing to do any casting. */
type AnyOf<T> = 
	(T extends any ? (x: T) => any : never) extends 
	(x: infer R) => any ? R : never;

/** Utility type which returns all keys of an object type that have a value type of ValueType. */
type KeysWithType<T, ValueType> = {
	[K in keyof T]: T[K] extends ValueType ? K : never;
}[keyof T];

/** Utility type that filters a union type for all types that contain at least one of U. */
type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

/** Utility Type that filters all empty types from a union type. */
type ExcludeEmpty<T> = T extends AtLeastOne<T> ? T : never;

interface Gamedatas {
    // current_player_id: string;
    // decision: {decision_type: string};
    // game_result_neutralized: string;
    // gamestate: GameStateName;
    // gamestates: { [K in keyof GameStates]: GameStateNameById<K> };
    // neutralized_player_id: string;
    // notifications: {last_packet_id: string, move_nbr: string}
    // playerorder: (string | number)[];
    // players: { [playerId: number]: Player };
    // tablespeed: string;

    // Add here variables you set up in getAllDatas
}

/**
 * An interface type that represents all possible game states. This is only used as a type for internal validation, ensuring the all string literal state names, numeric state IDs, and state arguments are typed correctly.
 * 
 * All entries should follow the format as follows: `[id: number]: string | { name: string, args: object};`. All entries in the form `id: name` will be inferred as `id: { name: name, args: {} }`. This format is omitted so coding intellisense can restrict parameters/types. At runtime, this may not accurately represent the game state id/name depending on if this matches the state machine (states.inc.php).
 * 
 * There are a handful of helper types that are used to pull the types from this interface. They are: {@link GameStateName}, {@link AnyGameStateArgs}, {@link GameStateNameById}, {@link GameStateArgs}.
 */
interface GameStates {
	// [id: number]: string | { name: string, args: object}; // Uncomment to remove type safety with ids, names, and arguments for game states
	1: 'gameSetup';
	99: { name: 'gameEnd', args: { /* TODO: check what the end game args are */ } };
}

/**
 * A helper type that must match one the of defined state names on the {@link GameStates} type.
 * @example
 * // This function can only accept state names that are defined in the GameStates type, like 'gameSetup' and 'gameEnd'. It will throw an error otherwise.
 * function doSomething(state: GameStateName) { ... }
 */
type GameStateName = {
	[K in keyof GameStates]:
		GameStates[K] extends string ? GameStates[K] :
		GameStates[K] extends { name: string } ? GameStates[K]['name'] :
		never;
}[keyof GameStates];

/**
 * A helper type which is the intersection of all game state arguments. This is used to avoid a mandatory cast and maintains much better type safety then using the 'any' type.
 * 
 * This type is intend {@link Game.onEnteringState} and {@link Game.onUpdateActionButtons} which cannot infer the arg types from the state name when preforming checks. That is, typescript isn't able to type the object based on the state name. Because of this, a cast would be required on a standard union type (type that matches only one or the args which is always an empty object, {}).
 * 
 * Note that any game state that is in the form number:string will have an empty object, {}, as the argument.
 * @example
 * // Because this is an intersection type, we can pull any of the possible args without a cast:
 * override onEnteringState(stateName: GameStateName, args?: { args: AnyGameStateArgs }): void
 * {
 * 	switch( stateName )
 * 	{
 * 		// Without any casting
 * 		case 'playerTurn':
 * 			this.updatePossibleMoves( args.args.possibleMoves );
 * 			break;
 * 		// With casting for type safety.
 * 		// This ensures that only the properties defined for this state are accessible.
 * 		case 'newHand':
 * 			const newHandArgs = args.args as GameStateArgs<'newHand'>;
 * 			this.onNewHand( newHandArgs.cards );
 * 			break;
 * 	...
 * 	}
 * }
 */
type AnyGameStateArgs = AnyOf<{
	[K in keyof GameStates]:
		GameStates[K] extends string ? {} :
		GameStates[K] extends { args: infer T } ? T :
		never;
}[keyof GameStates]>;

/**
 * A helper type for getting the string literal from a game state id. Generally not useful for game specific code.
 */
type GameStateNameById<K extends keyof GameStates> =
	GameStates[K] extends string ? GameStates[K] :
	GameStates[K] extends { name: string } ? GameStates[K]['name'] :
	never;

/**
 * A helper type for getting the argument types for a game state, usually used for casting the args in {@link Game.onEnteringState} and {@link Game.onUpdateActionButtons}. The generic parameter can be either a state name or a state id, and will throw an error if its neither.
 * @example
 * override onEnteringState(stateName: GameStateName, args?: { args: AnyGameStateArgs }): void
 * {
 * 	switch( stateName )
 * 	{
 * 		// This ensures that only the properties defined for this state are accessible.
 * 		case 'newHand':
 * 			const newHandArgs = args.args as GameStateArgs<'newHand'>;
 * 			this.onNewHand( newHandArgs.cards );
 * 			break;
 * 	...
 * 	}
 * }
 */
type GameStateArgs<N extends keyof GameStates | GameStateName> = 
	N extends keyof GameStates ?
		GameStates[N] extends string ? {} :
		GameStates[N] extends { args: infer T } ? T :
		never
	: {
		[K in keyof GameStates]:
			GameStates[K] extends N ? { } :
			GameStates[K] extends { name: N, args: infer T } ? T :
			never;
	}[keyof GameStates];

/**
 * An interface type that represents all possible player actions. This is only used as a type for internal validation, ensuring the all player action string literal names and arguments are typed correctly.
 * 
 * All entries should follow the format as follows: `[action: string]: object;`. This format is omitted so coding intellisense can restrict parameters/types. At runtime, this may not accurately represent the possible actions for a player depending on if this matches the state machine (states.inc.php).
 */
interface PlayerActions {
	// [action: string]: object; // Uncomment to remove type safety on player action names and arguments
}

/**
 * An interface type that represents all possible notification types. This is only used as a type for internal validation, ensuring the all notification string literal names and arguments are typed correctly.
 * 
 * All entries should follow the format as follows: `[name: string]: object | null;`. For notifications without arguments, use null and not an empty object. This format is omitted so coding intellisense can restrict parameters/types. At runtime, this may not accurately represent all possible notifications depending on if this matches the notify functions used with server code (<yourgame>.game.php).
 */
interface NotifTypes {
	// [name: string]: object; // Uncomment to remove type safety on notification names and arguments
}

interface Notif<T extends ExcludeEmpty<NotifTypes[keyof NotifTypes]> | null = null> {
	/** The type of the notification (as passed by php function). */
	type: KeysWithType<NotifTypes, T>;
	/** The arguments passed from the server for this notification. This type should always match the notif.type. */
	args: T;
	/** The message string passed from php notification. */
	log: string;
	/** True when NotifyAllPlayers method is used (false otherwise), i.e. if all player are receiving this notification. */
	bIsTableMsg: boolean;
	/** Information about table ID (formatted as : "/table/t[TABLE_NUMBER]"). */
	channelorig: string;
	/** Name of the game. */
	gamenameorig: string;
	/** ID of the move associated with the notification. */
	move_id: string;
	/** ID of the table (comes as string). */
	table_id: string;
	/** UNIX GMT timestamp. */
	time: number;
	/** Unique identifier of the notification. */
	uid: string;
	/** Unknown. */
	h: any;
}

interface Card {
    id: number;
    location: string;
    location_arg: number;
    type: number;
    number: number;
}

interface Player {
	beginner: boolean;
	color: string;
	color_back: any | null;
	eliminated: number;
	id: string;
	is_ai: string;
	name: string;
	score: string;
	zombie: number;
}