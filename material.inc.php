<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * KiriaiTheDuel game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

$this->stanceNames = array(
	Stance::HEAVEN => clienttranslate('Heaven Stance'),
	Stance::EARTH => clienttranslate('Earth Stance'),
);
$this->playedCardNames = array(
	PlayedCard::APPROACH => clienttranslate('Approach'),
	PlayedCard::CHARGE => clienttranslate('Charge'),
	PlayedCard::HIGH_STRIKE => clienttranslate('High Strike'),
	PlayedCard::LOW_STRIKE => clienttranslate('Low Strike'),
	PlayedCard::BALANCED_STRIKE => clienttranslate('Balanced Strike'),
	PlayedCard::RETREAT => clienttranslate('Retreat'),
	PlayedCard::CHANGE_STANCE => clienttranslate('Change Stance'),
);
$this->specialCardNames = array(
	SpecialCard::KESA_STRIKE => clienttranslate('Kesa Strike'),
	SpecialCard::ZAN_TETSU_STRIKE => clienttranslate('Zan-Tetsu Strike'),
	SpecialCard::COUNTERATTACK => clienttranslate('Counterattack'),
);
$this->discardedNames = array(
	Discarded::APPROACH_RETREAT => clienttranslate('Approach/Retreat'),
	Discarded::CHARGE_CHANGE_STANCE => clienttranslate('Charge/Change Stance'),
	Discarded::HIGH_STRIKE => clienttranslate('High Strike'),
	Discarded::LOW_STRIKE => clienttranslate('Low Strike'),
	Discarded::BALANCED_STRIKE => clienttranslate('Balanced Strike'),
);

$this->userErrors = array (
	'playing discarded card' => clienttranslate("You cannot play the %s card because it is currently discarded."),
	'double play card' => clienttranslate("You cannot play the same card twice in a turn. Trying to play %s twice."),
	'already played first' => clienttranslate("You have already played your first card for this turn."),
	'already played second' => clienttranslate("You have already played your second card for this turn."),
	'not all cards played' => clienttranslate("You have not picked all of your cards for this turn!"),
	'player not found in db' => clienttranslate("Player was somehow not found in database."),
);

$this->notifMessages = array (
	'starting special card' => clienttranslate('You started the game with the ${card_name} special card'),
	'played card' => '',
	'undo card' => '',
	'battlefield setup' => '',
	'before first resolve' => '',
	'before second resolve' => '',
	'after resolve' => '',
	'player(s) charged' => '',
	'player(s) moved' => '',
	'player(s) changed stance' => '',
	'player(s) attacked' => '',
	'player(s) hit' => '',
);