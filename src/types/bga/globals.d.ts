/**
 * Framework interfaces
 */

/**
 * The dependencies that are valid requirements for defining a game class.
 */
type BGA_Dependency =
	'dojo' |
	'dojo/_base/declare' |
	'ebg/core/gamegui' |
	'ebg/counter' |
	'ebg/stock' |
	'ebg/expandablesection' |
	'ebg/scrollmap' |
	'ebg/zone' |
	string;

/**
 * Defines an object by assigning it to some target with a key. For simplicity, this has been restricted to defining the game specific module, requiring the game to be defined as a class.
 * @param dependencies The dependencies required for the game class to be defined.
 * @param callback The function that will define the game class and return it.
 * - param `module_name`: The name of the module to be defined. Should be 'bgagame.yourgamename'.
 * - param `module_target`: The target to define the module on. Should be `ebg.core.gamegui`.
 * - param `module`: The game class to be defined. Should be a new instance of the game class: `new YourGameName()`.
 * @example
 * define([
 * 	"dojo",
 * 	"dojo/_base/declare",
 * 	"ebg/core/gamegui",
 * 	"ebg/counter",
 * ],
 * function (dojo, declare) {
 * 	return declare("bgagame.yourgamename", ebg.core.gamegui, new YourGameName());
 * });
 */
declare const define: <T>(
	dependencies: BGA_Dependency[],
	callback: (
		dojo: any,
		factory: (module_name: string, module_target: '__ebg_core_gamegui_hidden__', module: Game) => T
	) => T
) => void;

/** The global jQuery-like selector function included in all BGA pages, used to resolve an id to an element if not already an element. */
declare const $: (selectorOrElement: string | HTMLElement) => HTMLElement;

/** The global translation function included in all BGA pages, used to translate a string. */
declare const _: (source: string) => string;

/**
 * Play a sound file. This file must have both a .mp3 and a .ogg file with the names <gamename>_<soundname>[.ogg][.mp3] amd must be defined in the .tpl file:
 * 
 * `<audio id="audiosrc_<gamename>_<yoursoundname>" src="{GAMETHEMEURL}img/<gamename>_<yoursoundname>.mp3" preload="none" autobuffer></audio>	
 * `<audio id="audiosrc_o_<gamename>_<yoursoundname>" src="{GAMETHEMEURL}img/<gamename>_<yoursoundname>.ogg" preload="none" autobuffer></audio>`
 * @param sound The name of the sound file to play in the form '<gamename>_<soundname>'.
 * @example
 * playSound('kiriaitheduel_yoursoundname');
 */
declare const playSound: (sound: string) => void;

/** The replay number in live game. It is set to undefined (i.e. not set) when it is not a replay mode, so the good check is `typeof g_replayFrom != 'undefined'` which returns true if the game is in replay mode during the game (the game is ongoing but the user clicked "reply from this move" in the log). */
declare const g_replayFrom: number;

/** True if the game is in archive mode after the game (the game has ended). */
declare const g_archive_mode: boolean;

/** An object if the game is in tutorial mode, or undefined otherwise. Tutorial mode is a special case of archive mode where comments have been added to a previous game to teach new players the rules. */
declare const g_tutorialwritten: {
	author: string;
	id: number;
	mode: string;
	status: string;
	version_override: string | null;
	viewer_id: string;
} | undefined;

/**
 * A namespace that represents the module's defined by BGA.
 */
declare namespace ebg {
	/** Defines the module that the game needs to be defined inside by using the dojo 'define' function. */
	namespace core { const gamegui: '__ebg_core_gamegui_hidden__'; }
	/** Creates a new {@link Counter}. */
	const counter: new () => Counter;
	/** Creates a new {@link Stock}. */
	const stock: new () => Stock;
}