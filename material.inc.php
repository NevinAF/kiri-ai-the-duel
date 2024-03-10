<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © <Your name here> <Your email address here>
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

$this->cardNames = array(
    0 => clienttranslate('Approach/Retreat'),
    5 => clienttranslate('Approach/Retreat'),
	1 => clienttranslate('Charge/Change Stance'),
	6 => clienttranslate('Charge/Change Stance'),
	2 => clienttranslate('High Strike'),
	7 => clienttranslate('High Strike'),
	3 => clienttranslate('Low Strike'),
	8 => clienttranslate('Low Strike'),
	4 => clienttranslate('Balanced Strike'),
	9 => clienttranslate('Balanced Strike'),
	10 => clienttranslate('Kesa Strike'),
	11 => clienttranslate('Zan-Tetsu Strike'),
	12 => clienttranslate('Counterattack'),

	97 => clienttranslate('<card back>'),
	98 => clienttranslate('<card back>'),
	99 => clienttranslate('<card back>')
);