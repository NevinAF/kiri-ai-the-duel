/**
 * @gameSpecific The global `dojo` object included in all BGA pages. This object is already defined with a TON of properties and methods, even without including many of the dojo modules as a dependency in the {@link define} function. This object type is a subset of the actual `dojo` object, and should be expanded as needed based on what dojo modules are being used. Make sure to include the `dojo` module as a dependency in the {@link define} function to avoid any unexpected errors.
 * @example
 * // Use the '&' operator to combine multiple dojo modules into one type. (intersection of all properties and methods, i.e. use this AND that properties).
 * declare const dojo: dojo._base.Connect & dojo.DomGeometry & dojo._base.Dojo & dojo._base.Lang;
 */
declare const dojo: dojo._base.Connect & dojo.DomGeometry & dojo._base.Dojo & dojo._base.Lang;

/**
 * @gameSpecific Add game specific states here as a number: string literal pair, or in the form number: { name: string, args: object} . See {@link GameStates} for more information.
 * 1: 'gameSetup'; and 99: 'gameEnd'; are already defined in the framework, and should not be modified as stated in the states.inc.php file.
 * @example
 * // Example from the Hearts Tutorial.
 * interface GameState {
 * 	2: 'newHand';
 * 	21: 'giveCards';
 * 	22: 'takeCards';
 * 	30: 'newTrick';
 * 	31: 'playerTurn';
 * 	32: 'nextPlayer';
 * 	40: 'endHand';
 * }
 * @example
 * // Example from Reversi Tutorial
 * interface GameState {
 * 	10: { name: 'playerTurn', args: {
 * 		possibleMoves: {
 * 			[x: number]: {
 * 				[y: number]: boolean;
 * 			};
 * 		}
 * 	};
 * 	11: 'nextPlayer';
 * }
 */
interface GameStates {
	2: 'drawSpecialCards';
	3: 'pickCards';
	4: 'resolveCards';
}

/**
 * @gameSpecific Add game specific player actions arguments here as a string: object pair. See {@link PlayerActions} for more information.
 * @example
 * // Example from the Hearts Tutorial.
 * interface GameStateArgs {
 * 	'giveCards': { cards: number[] };
 * 	'playCard': { id: number };
 * }
 */
interface PlayerActions {
	'pickedCards': { firstCard: number, secondCard: number };

	'giveCards': { cards: number[] };
	'playCard': { id: number };
}

/**
 * @gameSpecific Add game specific notification here as a `string: object | null` pair. See {@link NotifTypes} for more information.
 * @example
 * interface NotifTypes {
 * 	'newHand': { cards: Card[] };
 * 	'playCard': { player_id: number, color: number, value: number, card_id: number };
 * 	'trickWin': { };
 * 	'giveAllCardsToPlayer': { player_id: number };
 * 	'newScores': { newScores: { [player_id: number]: number } };
 * }
 */
interface NotifTypes {
	'playCards': { state: StateData };
	'cardsResolved': { state: StateData };
	'drawSpecialCard': { state: StateData };
	'cardsPlayed': null;
	'cardFlipped': { back_card_id: number; card_id: number };
}

/**
 * @gameSpecific Add game specific state arguments here as a number: object pair. See {@link GameStates} for more information.
 * @example
 * // Example from the Reversi Tutorial
 * interface Gamedatas {
 * 	board: { x: number, y: number, player: number }[];
 * }
 */
interface Gamedatas {
	redPlayer: number;
	bluePlayer: number;
	state: StateData;
}

interface StateData {
	cards: {
		redHand?: number[];
		blueHand?: number[];
		redPlayed?: number[];
		bluePlayed?: number[];
		redDiscard?: number[];
		blueDiscard?: number[];
		deck?: number[];
	},
	flippedState: {
		redPlayed_0_Flipped: number;
		redPlayed_1_Flipped: number;
		bluePlayed_0_Flipped: number;
		bluePlayed_1_Flipped: number;
	},
	stances: {
		red_samurai: number;
		blue_samurai: number;
	},
	positions: {
		red_samurai: number;
		blue_samurai: number;
	},
	damage: {
		red_samurai: number;
		blue_samurai: number;
	}
}