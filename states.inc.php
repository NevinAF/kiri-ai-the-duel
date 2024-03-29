<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
 * -----
 */

$machinestates = array(

	/** Initial state. */
	1 => array(
		"name" => "gameSetup",
		"description" => "",
		"type" => "manager",
		"action" => "stGameSetup",
		"transitions" => array( "" => 2 )
	),

	/** For non-Standard Battlefield, lets player choose starting position and stance. */
	2 => array(
		"name" => "setupBattlefield",
		"type" => "multipleactiveplayer",
		"action" => "stSetupBattlefield",
		"description" => 'The opponent must choose a stance and position',
		"descriptionmyturn" => '${you} must choose a stance and position',
		"possibleactions" => array( "confirmedStanceAndPosition" ),
		"transitions" => array( "" => 3 )
	),

	/**
	 * Players pick cards.
	 * Note that each card pick and undo is shared with the opponent (card is obfuscated). This mimics in-person decision making.
	 * There is no way to undo confirming cards played.
	 */
	3 => array(
		"name" => "pickCards",
		"type" => "multipleactiveplayer",
		'action' => 'stPickCardsInit',
		"description" => clienttranslate('The opponent must choose two cards to play'),
		"descriptionmyturn" => clienttranslate('${you} must choose two cards to play'),
		"possibleactions" => array( "pickedFirst", "pickedSecond", "undoFirst", "undoSecond", "confirmedCards" ),
		"transitions" => array( "" => 4, )
	),

	/**
	 * Server state to resolve the cards played. All actions taken send a notification used to update ui.
	 * If a player scores their second point (damages the opponent twice), the game ends, otherwise it goes back to pickCards.
	 */
	4 => array(
		"name" => "resolveCards",
		"description" => '',
		"type" => "game",
		"action" => "stResolveCards",
		"updateGameProgression" => true,
		"transitions" => array( "endGame" => 99, "pickCards" => 3 )
	),

	/** End of game state. */
	99 => array(
		"name" => "gameEnd",
		"description" => clienttranslate("End of game"),
		"type" => "manager",
		"action" => "stGameEnd",
		"args" => "argGameEnd"
	)

);