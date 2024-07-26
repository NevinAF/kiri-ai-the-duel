/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/** @gameSpecific Add game specific notifications / arguments here. See {@link NotifTypes} for more information. */
interface NotifTypes {
	// [name: string]: any; // Uncomment to remove type safety on notification names and arguments
	'starting special card': { card_name: string } & GameStateData;
	'battlefield setup': GameStateData;
	'played card': GameStateData;
	'undo card': GameStateData;
	'before first resolve': GameStateData;
	'before second resolve': GameStateData;
	'after resolve': GameStateData;
	'player(s) charged': GameStateData & { isHeaven: boolean };
	'player(s) moved': GameStateData & { isHeaven: boolean };
	'player(s) changed stance': GameStateData & { isSpecial: boolean };
	'player(s) attacked': GameStateData & { first: boolean };
	'player(s) hit': GameStateData & { winner: Player['id'] };

	'_spectator_ starting special card': { card_name: string } & GameStateData;
	'_spectator_ battlefield setup': GameStateData;
	'_spectator_ played card': GameStateData;
	'_spectator_ undo card': GameStateData;
	'_spectator_ before first resolve': GameStateData;
	'_spectator_ before second resolve': GameStateData;
	'_spectator_ after resolve': GameStateData;
	'_spectator_ player(s) charged': GameStateData & { isHeaven: boolean };
	'_spectator_ player(s) moved': GameStateData & { isHeaven: boolean };
	'_spectator_ player(s) changed stance': GameStateData & { isSpecial: boolean };
	'_spectator_ player(s) attacked': GameStateData & { first: boolean };
	'_spectator_ player(s) hit': GameStateData & { winner: Player['id'] };

	'log': any;
}

/** @gameSpecific Add game specific gamedatas arguments here. See {@link Gamedatas} for more information. */
interface Gamedatas extends GameStateData {
	// [key: string | number]: Record<keyof any, any>; // Uncomment to remove type safety on game state arguments
}

interface GameStateData {
	player_state: number;
	opponent_state: number;
	battlefield_type: BattlefieldType[keyof BattlefieldType];
}

interface Stance
{
	HEAVEN: 0;
	EARTH: 1;
}

interface BattlefieldType
{
	Standard: 1;
	Advanced: 2;
}

interface PlayedCard
{
	NOT_PLAYED: 0;
	HIDDEN: 9;

	APPROACH: 1;
	CHARGE: 2;
	HIGH_STRIKE: 3;
	LOW_STRIKE: 4;
	BALANCED_STRIKE: 5;
	RETREAT: 6;
	CHANGE_STANCE: 7;
	SPECIAL: 8;
}

interface Discarded
{
	NONE: 0;

	APPROACH_RETREAT: 1;
	CHARGE_CHANGE_STANCE: 2;
	HIGH_STRIKE: 3;
	LOW_STRIKE: 4;
	BALANCED_STRIKE: 5;
}

interface SpecialCard
{
	HIDDEN: 0;
	KESA_STRIKE: 1;
	ZAN_TETSU_STRIKE: 2;
	COUNTERATTACK: 3;
}

declare const PLAYER_IMAGES: string;
declare const PLAYER_COLOR: string;
declare const OPPONENT_COLOR: string;