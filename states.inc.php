<?php
declare(strict_types=1);
/**
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. ANY CHANGES MADE DIRECTLY MAY BE OVERWRITTEN.
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * TYPE CHECKING ONLY, this function is never called.
 * If there are any undefined function errors here, you MUST rename the action within the game states file, or create the function in the game class.
 * If the function does not match the parameters correctly, you are either calling an invalid function, or you have incorrectly added parameters to a state function.
 */
if (false) {
	/** @var kiriaitheduel $game */
	$game->stSetupBattlefield();
	$game->stPickCardsInit();
	$game->stResolveCards();
}

$machinestates = array(
	1 => array(
		'name' => 'gameSetup',
		'description' => '',
		'type' => 'manager',
		'action' => 'stGameSetup',
		'transitions' => array(
			'' => 2,
		),
	),
	2 => array(
		'name' => 'setupBattlefield',
		'type' => 'multipleactiveplayer',
		'action' => 'stSetupBattlefield',
		'description' => clienttranslate('The opponent must choose a stance and position'),
		'descriptionmyturn' => clienttranslate('${you} must choose a stance and position'),
		'possibleactions' => ['confirmedStanceAndPosition'],
		'transitions' => array(
			'' => 3,
		),
	),
	3 => array(
		'name' => 'pickCards',
		'type' => 'multipleactiveplayer',
		'action' => 'stPickCardsInit',
		'description' => clienttranslate('The opponent must choose two cards to play'),
		'descriptionmyturn' => clienttranslate('${you} must choose two cards to play'),
		'possibleactions' => ['pickedFirst', 'pickedSecond', 'undoFirst', 'undoSecond', 'confirmedCards'],
		'transitions' => array(
			'' => 4,
		),
	),
	4 => array(
		'name' => 'resolveCards',
		'description' => '',
		'type' => 'game',
		'action' => 'stResolveCards',
		'updateGameProgression' => true,
		'transitions' => array(
			'endGame' => 99,
			'pickCards' => 3,
		),
	),
	99 => array(
		'name' => 'gameEnd',
		'description' => clienttranslate('End of game'),
		'type' => 'manager',
		'action' => 'stGameEnd',
		'args' => 'argGameEnd',
	),
);