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
  * kiriaitheduel.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

class Stance
{
	const HEAVEN = 0;
	const EARTH = 1;
}

class PlayedCard
{
	const NOT_PLAYED = 0;
	const HIDDEN = 9;

	const APPROACH = 1;
	const CHARGE = 2;
	const HIGH_STRIKE = 3;
	const LOW_STRIKE = 4;
	const BALANCED_STRIKE = 5;
	const RETREAT = 6;
	const CHANGE_STANCE = 7;
	const SPECIAL = 8;
}

class Discarded
{
	const NONE = 0;

	const APPROACH_RETREAT = 1;
	const CHARGE_CHANGE_STANCE = 2;
	const HIGH_STRIKE = 3;
	const LOW_STRIKE = 4;
	const BALANCED_STRIKE = 5;
}

class SpecialCard
{
	const HIDDEN = 0;
	const KESA_STRIKE = 1;
	const ZAN_TETSU_STRIKE = 2;
	const COUNTERATTACK = 3;
}


class KiriaiTheDuel extends Table
{
	const BATTLEFIELD = 'battlefield';
	const CARDS = 'cardsPlayed';

	protected $stanceNames;
	protected $playedCardNames;
	protected $specialCardNames;
	protected $discardedNames;
	protected $userErrors;
	protected $notifMessages;

	const RED_COLOR = "e54025";
	const BLUE_COLOR = "5093a3";

	function __construct( )
	{
		parent::__construct();
		
		self::initGameStateLabels( array(

			self::BATTLEFIELD => 10,
			self::CARDS => 11,
		) );
	}

	protected function getGameName( ) {
		return "kiriaitheduel";
	}

	/*
		setupNewGame:
		
		This method is called only once, when a new game is launched.
		In this method, you must setup the game according to the game rules, so that
		the game is ready to be played.
	*/
	protected function setupNewGame( $players, $options = array() )
	{
		// Set the colors of the players with HTML color code
		// The default below is red/green/blue/orange/brown
		// The number of colors defined here must correspond to the maximum number of players allowed for the gams
		$gameinfos = self::getGameinfos();
		$default_colors = $gameinfos['player_colors'];
 
		// Create players
		// Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
		$sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
		$values = array();
		foreach( $players as $player_id => $player )
		{
			$color = array_shift( $default_colors );
			$values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
		}
		$sql .= implode( ',', $values );
		self::DbQuery( $sql );
		self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
		self::reloadPlayersBasicInfos();
	}

	/*
		getAllDatas: 
		
		Gather all informations about current game situation (visible by the current player).
		
		The method is called each time the game interface is displayed to a player, ie:
		_ when the game starts
		_ when a player refreshes the game page (F5)
	*/
	protected function getAllDatas()
	{
		$result = array();

		// Get information about players
		// Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
		$sql = "SELECT player_id id, player_score score FROM player ";
		$result['players'] = self::getCollectionFromDb( $sql );

		// Get game state data
		self::addStateArgs(
			$result,
			self::getGameStateValue( self::BATTLEFIELD ),
			self::getGameStateValue( self::CARDS ),
			self::getCurrentPlayerColor());

		return $result;
	}

	/*
		Compute and return the current game progression. beween 0 (=the game just started) and 100 (= the game is finished or almost finished).
	*/
	function getGameProgression()
	{
		$progression = 0;

		$players = self::loadPlayersBasicInfos();
		foreach ($players as $player_id => $player)
		{
			$score = $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");

			// If landed two hits, the game should be over..
			if ($score >= 2)
				return 100;

			$progression += $score * 30;
		}

		$battlefield = self::getGameStateValue( self::BATTLEFIELD );
		if ($battlefield != 0) // battlefield is setup
			$progression += 10;

		return $progression;
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

	function dbGetScore($players, $color): int {
		foreach ($players as $player_id => $player) {
			if ($player['player_color'] == $color) {
				return $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
			}
		}

		throw new BgaUserException(sprintf($this->userErrors['player color not found'], $color));
	}

	function dbIncrementScore($players, $color): int {
		foreach ($players as $player_id => $player) {
			if ($player['player_color'] == $color) {
				$value = $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
				$value++;
				$this->DbQuery("UPDATE player SET player_score='$value' WHERE player_id='$player_id'");
				return $value;
			}
		}

		throw new BgaUserException(sprintf($this->userErrors['player color not found'], $color));
	}

	function addStateArgs(array &$args, int $battlefield, int $cards, string $player_color)
	{
		// Battlefield is public information, but we need to hide if not set up yet.
		if (!self::get_battlefieldValid($battlefield))
		{
			if ($player_color != self::RED_COLOR)
				$battlefield &= ~(0b11111 << 0);
			if ($player_color != self::BLUE_COLOR)
				$battlefield &= ~(0b11111 << 5);
		}
		$args['battlefield'] = $battlefield;

		// Hide special card if they are not played (and not this player)
		if (!self::get_redSpecialPlayed($cards) && $player_color != self::RED_COLOR)
			self::set_redSpecial($cards, SpecialCard::HIDDEN);
		if (!self::get_blueSpecialPlayed($cards) && $player_color != self::BLUE_COLOR)
			self::set_blueSpecial($cards, SpecialCard::HIDDEN);

		if (self::get_hidePlayedCards($cards))
		{
			if ($player_color != self::RED_COLOR)
			{
				if (self::get_redPlayed0($cards) != PlayedCard::NOT_PLAYED)
					self::set_redPlayed0($cards, PlayedCard::HIDDEN);
				if (self::get_redPlayed1($cards) != PlayedCard::NOT_PLAYED)
					self::set_redPlayed1($cards, PlayedCard::HIDDEN);
			}
			if ($player_color != self::BLUE_COLOR) {
				if (self::get_bluePlayed0($cards) != PlayedCard::NOT_PLAYED)
					self::set_bluePlayed0($cards, PlayedCard::HIDDEN);
				if (self::get_bluePlayed1($cards) != PlayedCard::NOT_PLAYED)
					self::set_bluePlayed1($cards, PlayedCard::HIDDEN);
			}
		}
		$args['cards'] = $cards;
	}

	function notifyAllGameState(array &$players, string $type, array $args, $battlefield, $cards)
	{
		foreach ($players as $player)
			self::notifyGameState($player, $type, $args, $battlefield, $cards);
	}

	function notifyGameState(array $player, string $type, array $args, $battlefield, $cards)
	{
		self::addStateArgs($args, $battlefield, $cards, $player['player_color']);
		self::notifyPlayer(
			$player['player_id'],
			$type,
			$this->notifMessages[$type],
			$args );
	}

	protected function currentMultiPlayerIsRed() {
		return self::getCurrentPlayerColor() == 'e54025';
	}

	protected function get_redPosition($battlefield): int {
		return ($battlefield >> 0) & 0b1111;
	}
	protected function get_redStance($battlefield): int {
		return ($battlefield >> 4) & 0b1;
	}
	protected function get_bluePosition($battlefield): int {
		return ($battlefield >> 5) & 0b1111;
	}
	protected function get_blueStance($battlefield): int {
		return ($battlefield >> 9) & 0b1;
	}
	protected function get_battlefieldValid($battlefield): bool {
		return (($battlefield >> 13) & 0b1) == 1;
	}
	protected function get_redHit($battlefield): bool {
		return (($battlefield >> 14) & 0b1) == 1;
	}
	protected function get_blueHit($battlefield): bool {
		return (($battlefield >> 15) & 0b1) == 1;
	}

	protected function set_redPosition(&$battlefield, $position) {
		$battlefield &= ~(0b1111 << 0);
		$battlefield |= ($position & 0b1111) << 0;
	}
	protected function set_redStance(&$battlefield, int $stance) {
		$battlefield &= ~(0b1 << 4);
		$battlefield |= ($stance & 0b1) << 4;
	}
	protected function set_bluePosition(&$battlefield, $position) {
		$battlefield &= ~(0b1111 << 5);
		$battlefield |= ($position & 0b1111) << 5;
	}
	protected function set_blueStance(&$battlefield, int $stance) {
		$battlefield &= ~(0b1 << 9);
		$battlefield |= ($stance & 0b1) << 9;
	}
	protected function set_battlefieldValid(&$battlefield, bool $valid) {
		$battlefield &= ~(0b1 << 13);
		$battlefield |= $valid ? 1 << 13 : 0;
	}
	protected function set_redHit(&$battlefield, bool $valid) {
		$battlefield &= ~(0b1 << 14);
		$battlefield |= $valid ? 1 << 14 : 0;
	}
	protected function set_blueHit(&$battlefield, bool $valid) {
		$battlefield &= ~(0b1 << 15);
		$battlefield |= $valid ? 1 << 15 : 0;
	}

	protected function get_redPlayed0($cards): int {
		return ($cards >> 0)  & 0b1111;
	}
	protected function get_redPlayed1($cards): int {
		return ($cards >> 4)  & 0b1111;
	}
	protected function get_bluePlayed0($cards): int {
		return ($cards >> 8)  & 0b1111;
	}
	protected function get_bluePlayed1($cards): int {
		return ($cards >> 12) & 0b1111;
	}
	protected function get_redDiscard($cards): int {
		return ($cards >> 16) & 0b111;
	}
	protected function get_blueDiscard($cards): int {
		return ($cards >> 19) & 0b111;
	}
	protected function get_redSpecial($cards): int {
		return ($cards >> 22) & 0b11;
	}
	protected function get_blueSpecial($cards): int {
		return ($cards >> 24) & 0b11;
	}
	protected function get_redSpecialPlayed($cards): bool {
		return (($cards >> 26) & 0b1) == 1;
	}
	protected function get_blueSpecialPlayed($cards): bool {
		return (($cards >> 27) & 0b1) == 1;
	}
	protected function get_hidePlayedCards($cards): bool {
		return (($cards >> 28) & 0b1) == 1;
	}

	protected function set_redPlayed0(&$cards, int $card) {
		$cards &= ~(0b1111 << 0);
		$cards |= ($card & 0b1111) << 0;
	}
	protected function set_redPlayed1(&$cards, int $card) {
		$cards &= ~(0b1111 << 4);
		$cards |= ($card & 0b1111) << 4;
	}
	protected function set_bluePlayed0(&$cards, int $card) {
		$cards &= ~(0b1111 << 8);
		$cards |= ($card & 0b1111) << 8;
	}
	protected function set_bluePlayed1(&$cards, int $card) {
		$cards &= ~(0b1111 << 12);
		$cards |= ($card & 0b1111) << 12;
	}
	protected function set_redDiscard(&$cards, int $card) {
		$cards &= ~(0b111 << 16);
		$cards |= ($card & 0b111) << 16;
	}
	protected function set_blueDiscard(&$cards, int $card) {
		$cards &= ~(0b111 << 19);
		$cards |= ($card & 0b111) << 19;
	}
	protected function set_redSpecial(&$cards, int $card) {
		$cards &= ~(0b11 << 22);
		$cards |= ($card & 0b11) << 22;
	}
	protected function set_blueSpecial(&$cards, int $card) {
		$cards &= ~(0b11 << 24);
		$cards |= ($card & 0b11) << 24;
	}
	protected function set_redSpecialPlayed(&$cards, bool $played) {
		$cards &= ~(0b1 << 26);
		$cards |= $played ? 1 << 26 : 0;
	}
	protected function set_blueSpecialPlayed(&$cards, bool $played) {
		$cards &= ~(0b1 << 27);
		$cards |= $played ? 1 << 27 : 0;
	}
	protected function set_hidePlayedCards(&$cards, bool $hide) {
		$cards &= ~(0b1 << 28);
		$cards |= $hide ? 1 << 28 : 0;
	}

	protected function playedCardToDiscard(int $played)
	{
		switch($played)
		{
			case PlayedCard::APPROACH: return Discarded::APPROACH_RETREAT;
			case PlayedCard::RETREAT: return Discarded::APPROACH_RETREAT;
			case PlayedCard::CHARGE: return Discarded::CHARGE_CHANGE_STANCE;
			case PlayedCard::CHANGE_STANCE: return Discarded::CHARGE_CHANGE_STANCE;
			case PlayedCard::HIGH_STRIKE: return Discarded::HIGH_STRIKE;
			case PlayedCard::LOW_STRIKE: return Discarded::LOW_STRIKE;
			case PlayedCard::BALANCED_STRIKE: return Discarded::BALANCED_STRIKE;
			default: return Discarded::NONE;
		}
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

	/*
		Each time a player is doing some game action, one of the methods below is called.
		(note: each method below must match an input method in kiriaitheduel.action.php)
	*/

	function confirmedStanceAndPosition(bool $isHeavenStance, int $position )
	{
		self::checkAction( 'confirmedStanceAndPosition' );

		$player_id = self::getCurrentPlayerId();
		$isRedPlayer = self::currentMultiPlayerIsRed();
		self::_confirmedStanceAndPosition($player_id, $isRedPlayer, $isHeavenStance, $position);
	}

	function _confirmedStanceAndPosition($player_id, $isRedPlayer, bool $isHeavenStance, int $position )
	{
		$battlefield = self::getGameStateValue( self::BATTLEFIELD );

		// TODO: Validate action

		if ($isRedPlayer)
		{
			self::set_redStance($battlefield, $isHeavenStance ? Stance::HEAVEN : Stance::EARTH);
			self::set_redPosition($battlefield, $position);
		}
		else
		{
			self::set_blueStance($battlefield, $isHeavenStance ? Stance::HEAVEN : Stance::EARTH);
			self::set_bluePosition($battlefield, $position);
		}

		if ($this->gamestate->setPlayerNonMultiactive( $player_id, ''))
		{
			// If both players have confirmed.
			self::set_battlefieldValid($battlefield, true);
		}

		self::setGameStateValue( self::BATTLEFIELD, $battlefield );
	}

	function pickedFirst(int $card_id)
	{
		self::checkAction( 'pickedFirst' );

		$isRedPlayer = self::currentMultiPlayerIsRed();
		$cards =  self::getGameStateValue( self::CARDS );
		self::_picked($cards, $isRedPlayer, $card_id, true);

		$this->gamestate->updateMultiactiveOrNextState( '' );
	}

	function pickedSecond(int $card_id)
	{
		self::checkAction( 'pickedSecond' );

		$isRedPlayer = self::currentMultiPlayerIsRed();
		$cards =  self::getGameStateValue( self::CARDS );
		self::_picked($cards, $isRedPlayer, $card_id, false);

		$this->gamestate->updateMultiactiveOrNextState( '' );
	}

	function _picked($cards, $isRedPlayer, int $card_id, bool $first)
	{
		$this->validateCardPlay($card_id, $cards, $isRedPlayer, $first);

		if ($first) {
			if ($isRedPlayer) self::set_redPlayed0($cards, $card_id);
			else self::set_bluePlayed0($cards, $card_id);
		} else {
			if ($isRedPlayer) self::set_redPlayed1($cards, $card_id);
			else self::set_bluePlayed1($cards, $card_id);
		}

		self::setGameStateValue( self::CARDS, $cards );

		$players = self::loadPlayersBasicInfos();
		self::notifyAllGameState($players, 'played card', array(
		), self::getGameStateValue( self::BATTLEFIELD ), $cards);
	}

	function undoFirst()
	{
		self::checkAction( 'undoFirst' );
		self::_undo(true);
	}

	function undoSecond()
	{
		self::checkAction( 'undoSecond' );
		self::_undo(false);
	}

	function _undo($first)
	{
		$cards =  self::getGameStateValue( self::CARDS );
		$isRedPlayer = self::currentMultiPlayerIsRed();

		// We don't need to validate this (if card is already not played) because the end result is the same.
		// There is little point for throwing an error here.

		if ($first) {
			if ($isRedPlayer) {
				self::set_redPlayed0($cards, PlayedCard::NOT_PLAYED);
			} else {
				self::set_bluePlayed0($cards, PlayedCard::NOT_PLAYED);
			}
		} else {
			if ($isRedPlayer) {
				self::set_redPlayed1($cards, PlayedCard::NOT_PLAYED);
			} else {
				self::set_bluePlayed1($cards, PlayedCard::NOT_PLAYED);
			}
		}

		self::setGameStateValue( self::CARDS, $cards );
		$players = self::loadPlayersBasicInfos();
		self::notifyAllGameState($players, 'undo card', array(), self::getGameStateValue( self::BATTLEFIELD ), $cards);

		$this->gamestate->updateMultiactiveOrNextState( '' );
		
	}

	/** All this does is deactivates the player and moved to the next state if both are deactivated. */
	function confirmedCards()
	{
		self::checkAction( 'confirmedCards' );
		$player_id = self::getCurrentPlayerId();
		$this->gamestate->setPlayerNonMultiactive( $player_id, '');
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Player Action Validation
////////////

	protected function validateCardPlay(int $card, int $cards, bool $isRedPlayer, bool $isFirstCard)
	{
		if ($isRedPlayer) {
			$discard = self::get_redDiscard($cards);
			$special = self::get_redSpecial($cards);
			$played0 = self::get_redPlayed0($cards);
			$played1 = self::get_redPlayed1($cards);
			$specialPlayed = self::get_redSpecialPlayed($cards);
		} else {
			$discard = self::get_blueDiscard($cards);
			$special = self::get_blueSpecial($cards);
			$played0 = self::get_bluePlayed0($cards);
			$played1 = self::get_bluePlayed1($cards);
			$specialPlayed = self::get_blueSpecialPlayed($cards);
		}

		self::notifyAllPlayers('log', '', array(
			"card" => $card,
			"discard" => $discard
		));

		// Make sure the card being played is not discarded...
		if ($card == PlayedCard::SPECIAL && $specialPlayed) {
			throw new BgaUserException(sprintf($this->userErrors['playing discarded card'], $special));
		}
		else if (
			($discard == Discarded::APPROACH_RETREAT && ($card == PlayedCard::APPROACH || $card == PlayedCard::RETREAT)) ||
			($discard == Discarded::CHARGE_CHANGE_STANCE && ($card == PlayedCard::CHARGE || $card == PlayedCard::CHANGE_STANCE)) ||
			($discard == Discarded::HIGH_STRIKE && $card == PlayedCard::HIGH_STRIKE) ||
			($discard == Discarded::LOW_STRIKE && $card == PlayedCard::LOW_STRIKE) ||
			($discard == Discarded::BALANCED_STRIKE && $card == PlayedCard::BALANCED_STRIKE)
		) {
			throw new BgaUserException(sprintf($this->userErrors['playing discarded card'], $this->playedCardNames[$card]));
		}

		// Make sure the card slot is open...
		if ($isFirstCard && $played0 != PlayedCard::NOT_PLAYED) {
			throw new BgaUserException($this->userErrors['already played first']);
		}
		else if (!$isFirstCard && $played1 != PlayedCard::NOT_PLAYED) {
			throw new BgaUserException($this->userErrors['already played second']);
		}

		// Make sure the card being played is not already played...
		$checkType_1 = $card;
		$checkType_2 = $card;
		if ($card == PlayedCard::APPROACH || $card == PlayedCard::RETREAT)
		{
			$checkType_1 = PlayedCard::APPROACH;
			$checkType_2 = PlayedCard::RETREAT;
		}
		else if ($card == PlayedCard::CHARGE || $card == PlayedCard::CHANGE_STANCE)
		{
			$checkType_1 = PlayedCard::CHARGE;
			$checkType_2 = PlayedCard::CHANGE_STANCE;
		}

		if ($played0 == $checkType_1 || $played1 == $checkType_1 || $played0 == $checkType_2 || $played1 == $checkType_2) {
			throw new BgaUserException(sprintf($this->userErrors['double play card'], $this->playedCardNames[$card]));
		}
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

	/*
		Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
		These methods function is to return some additional information that is specific to the current
		game state.
	*/

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

	function stSetupBattlefield()
	{
		// These are the default, which is always the case when the game starts.
		$cards = 0;
		$battlefield = 0;

		$first_card = bga_rand(0, 2);
		$redSpecial = $first_card + 1;
		$blueSpecial = ($first_card + bga_rand(1, 2)) % 3 + 1;

		self::set_redSpecial($cards, $redSpecial);
		self::set_blueSpecial($cards, $blueSpecial);

		$players = self::loadPlayersBasicInfos();

		foreach ($players as $player)
		{
			$message_args = array();
			if ($player['player_color'] == self::RED_COLOR) {
				$message_args['card_name'] = $this->specialCardNames[$redSpecial];
			}
			else if ($player['player_color'] == self::BLUE_COLOR) {
				$message_args['card_name'] = $this->specialCardNames[$blueSpecial];
			}
			else continue; // Spectators don't need to see a message with no new game information.

			self::notifyGameState($player, 'starting special card', $message_args, $battlefield, $cards);
		}

		self::setGameStateValue( self::CARDS, $cards );

		if (true /* standard battlefield setup */)
		{
			self::set_redPosition($battlefield, 6);
			self::set_bluePosition($battlefield, 1);
			self::set_redStance($battlefield, Stance::HEAVEN);
			self::set_blueStance($battlefield, Stance::HEAVEN);
			self::set_battlefieldValid($battlefield, true);

			self::setGameStateValue( self::BATTLEFIELD, $battlefield );

			$this->notifyAllGameState($players, 'battlefield setup', array(), $battlefield, $cards);
			$this->gamestate->nextState( "" );
		}
		else {
			// TODO: Add advanced battlefield setup where the users can choose positions and stance to start.
		}
	}

	function stPickCardsInit()
	{
		$cards = self::getGameStateValue( self::CARDS );
		self::set_hidePlayedCards($cards, true);
		self::setGameStateValue( self::CARDS, $cards );

		$this->gamestate->setAllPlayersMultiactive();
	}

	function stResolveCards()
	{
		$players = self::loadPlayersBasicInfos();
		$cards = self::getGameStateValue( self::CARDS );
		$battlefield = self::getGameStateValue( self::BATTLEFIELD );

		self::set_hidePlayedCards($cards, false);

		self::notifyAllGameState($players, 'before first resolve', array(), $battlefield, $cards); // Setup cards and flip first one over

		if (self::DoCards($players, $battlefield, $cards, true))
			return; // game over

		self::notifyAllGameState($players, 'before second resolve', array(), $battlefield, $cards); // Return first card and flip second one over

		// Save the discard before playing the cards
		$redDiscard = self::playedCardToDiscard(self::get_redPlayed1($cards));
		$blueDiscard = self::playedCardToDiscard(self::get_bluePlayed1($cards));

		if (self::DoCards($players, $battlefield, $cards, false))
			return; // game over

		self::set_redDiscard ($cards, $redDiscard);
		self::set_blueDiscard($cards, $blueDiscard);

		self::setGameStateValue( self::BATTLEFIELD, $battlefield );
		self::setGameStateValue( self::CARDS, $cards );

		self::notifyAllGameState($players, 'after resolve', array(), $battlefield, $cards); // Return second card as discarded.

		$this->gamestate->nextState( "pickCards" );
	}

	function DoCards(&$players, &$battlefield, &$cards, bool $first): bool
	{
		$red_card = $first ? self::get_redPlayed0($cards) : self::get_redPlayed1($cards);
		$blue_card = $first ? self::get_bluePlayed0($cards) : self::get_bluePlayed1($cards);

		// Validate
		if ($red_card == PlayedCard::NOT_PLAYED || $blue_card == PlayedCard::NOT_PLAYED)
			throw new BgaVisibleSystemException($this->userErrors['not all cards played']);

		$redStance = self::get_redStance($battlefield);
		$blueStance = self::get_blueStance($battlefield);
		$redPosition = self::get_redPosition($battlefield);
		$bluePosition = self::get_bluePosition($battlefield);

		$battlefieldSize = 6;

		//
		// MOVEMENT
		//

		// Charge: Move two spaces forward (-2 for red, +2 for blue)

		if ($red_card == PlayedCard::CHARGE && $blue_card == PlayedCard::CHARGE)
		{
			if ($redStance == $blueStance) // Both move at the same time.
			{
				if ($redPosition - $bluePosition <= 1) {} // There is not enough room to move
				else if ($redPosition - $bluePosition <= 3) // Both can move only once.
				{
					$redPosition -= 1;
					$bluePosition += 1;
				}
				else { // Move full amount
					$redPosition -= 2;
					$bluePosition += 2;
				}
			}

			else if ($redStance == 0) // Red Player moves first
			{
				$redPosition = max($redPosition - 2, $bluePosition);
				$bluePosition = min($bluePosition + 2, $redPosition);
			}

			else // Blue Player moves first
			{
				$bluePosition = min($bluePosition + 2, $redPosition);
				$redPosition = max($redPosition - 2, $bluePosition);
			}
		}

		else if ($red_card == PlayedCard::CHARGE)
		{
			$redPosition = max($redPosition - 2, $bluePosition);
		}

		else if ($blue_card == PlayedCard::CHARGE)
		{
			$bluePosition = min($bluePosition + 2, $redPosition);
		}

		if ($red_card == PlayedCard::CHARGE || $blue_card == PlayedCard::CHARGE)
		{
			self::set_redPosition($battlefield, $redPosition);
			self::set_bluePosition($battlefield, $bluePosition);
			self::notifyAllGameState($players, 'player(s) charged', array(), $battlefield, $cards);
		}

		// Approach/Retreat: Move one space forward/backward (-1 for red, +1 for blue)

		$redMove =
			$red_card == PlayedCard::APPROACH ? -1 :
			($red_card == PlayedCard::RETREAT ? 1 : 0);
		$blueMove =
			$blue_card == PlayedCard::APPROACH ? 1 :
			($blue_card == PlayedCard::RETREAT ? -1 : 0);

		if ($redMove != 0 && $blueMove != 0)
		{
			if ($redStance == $blueStance) // Both move at the same time.
			{
				if ($red_card == PlayedCard::APPROACH && $blue_card == PlayedCard::APPROACH)
				{
					if ($redPosition - $bluePosition <= 1) {} // There is not enough room to move
					else {
						$redPosition -= 1;
						$bluePosition += 1;
					}
				}
				else { // Otherwise, both players can move according to card without interference
					$redPosition = max(min($redPosition + $redMove, $battlefieldSize), 1);
					$bluePosition = max(min($bluePosition + $blueMove, $battlefieldSize), 1);
				}
			}

			else if ($redStance == 0) // Red Player moves first
			{
				$redPosition = max(min($redPosition + $redMove, $battlefieldSize), $bluePosition);
				$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 1);
			}

			else // Blue Player moves first
			{
				$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 1);
				$redPosition = max(min($redPosition + $redMove, $battlefieldSize), $bluePosition);
			}
		}
		// Only one or the other is trying to move...
		else if ($redMove != 0 || $blueMove != 0)
		{
			$redPosition = max(min($redPosition + $redMove, $battlefieldSize), $bluePosition);
			$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 1);
		}

		if ($redMove != 0 || $blueMove != 0)
		{
			self::set_redPosition($battlefield, $redPosition);
			self::set_bluePosition($battlefield, $bluePosition);
			self::notifyAllGameState($players, 'player(s) moved', array(), $battlefield, $cards);
		}

		// Change stance: Invert the current stance

		if ($red_card == PlayedCard::CHANGE_STANCE)
			$redStance = $redStance == Stance::HEAVEN ? Stance::EARTH : Stance::HEAVEN;
		if ($blue_card == PlayedCard::CHANGE_STANCE)
			$blueStance = $blueStance == Stance::HEAVEN ? Stance::EARTH : Stance::HEAVEN;

		if ($red_card == PlayedCard::CHANGE_STANCE || $blue_card == PlayedCard::CHANGE_STANCE)
		{
			self::set_redStance($battlefield, $redStance);
			self::set_blueStance($battlefield, $blueStance);
			self::notifyAllGameState($players, 'player(s) changed stance', array(), $battlefield, $cards);
		}

		//
		// ATTACKS
		//

		$redScored = false;
		$blueScored = false;
		$distance = $redPosition - $bluePosition;

		// High Strike: If the opponent is two spaces away and in heaven stance, deal 1 damage

		if ($red_card == PlayedCard::HIGH_STRIKE && $redStance == Stance::HEAVEN && $distance == 2)
			$redScored = true;
		if ($blue_card == PlayedCard::HIGH_STRIKE && $blueStance == Stance::HEAVEN && $distance == 2)
			$blueScored = true;

		// Low Strike: If the opponent is one space away and in earth stance, deal 1 damage

		if ($red_card == PlayedCard::LOW_STRIKE && $redStance == Stance::EARTH && $distance == 1)
			$redScored = true;
		if ($blue_card == PlayedCard::LOW_STRIKE && $blueStance == Stance::EARTH && $distance == 1)
			$blueScored = true;

		// Balanced Strike: If the opponent is on the same space, deal 1 damage

		if ($red_card == PlayedCard::BALANCED_STRIKE && $distance == 0)
			$redScored = true;
		if ($blue_card == PlayedCard::BALANCED_STRIKE && $distance == 0)
			$blueScored = true;

		// Kesa Strike: If the opponent is zero or one space away and in heaven stance, deal 1 damage. Switch to earth stance.

		$red_special = $red_card == PlayedCard::SPECIAL ? self::get_redSpecial($cards) : SpecialCard::HIDDEN;
		$blue_special = $blue_card == PlayedCard::SPECIAL ? self::get_blueSpecial($cards) : SpecialCard::HIDDEN;

		if ($red_special == SpecialCard::KESA_STRIKE)
		{
			if ($redStance == 0 && $distance <= 1)
				$redScored = true;
			$redStance = Stance::EARTH;
		}

		if ($blue_special == SpecialCard::KESA_STRIKE)
		{
			if ($blueStance == 0 && $distance <= 1)
				$blueScored = true;
			$blueStance = Stance::EARTH;
		}

		// Zan-Tetsu Strike: If the opponent is two or three spaces away and in earth stance, deal 1 damage. Switch to heaven stance.

		if ($red_special == SpecialCard::ZAN_TETSU_STRIKE)
		{
			if ($redStance == 1 && ($distance == 2 || $distance == 3))
				$redScored = true;
			$redStance = Stance::HEAVEN;
		}

		if ($blue_special == SpecialCard::ZAN_TETSU_STRIKE)
		{
			if ($blueStance == 1 && ($distance == 2 || $distance == 3))
				$blueScored = true;
			$blueStance = Stance::HEAVEN;
		}

		// Counterattack: If the opponent played a card that would hit you, deal 1 damage and negate the opponent's card

		if ($red_special == SpecialCard::COUNTERATTACK && $blueScored)
		{
			$redScored = true;
			$blueScored = false;
		}

		if ($blue_special == SpecialCard::COUNTERATTACK && $redScored)
		{
			$blueScored = true;
			$redScored = false;
		}

		if ($red_card == PlayedCard::HIGH_STRIKE || $red_card == PlayedCard::LOW_STRIKE || $red_card == PlayedCard::BALANCED_STRIKE || $red_card == PlayedCard::SPECIAL || $blue_card == PlayedCard::HIGH_STRIKE || $blue_card == PlayedCard::LOW_STRIKE || $blue_card == PlayedCard::BALANCED_STRIKE || $blue_card == PlayedCard::SPECIAL
		) {
			self::notifyAllGameState($players, 'player(s) attacked', array(), $battlefield, $cards);

			if ($red_card == PlayedCard::SPECIAL && $red_special != SpecialCard::COUNTERATTACK || $blue_card == PlayedCard::SPECIAL && $blue_special != SpecialCard::COUNTERATTACK)
			{
				self::set_redStance($battlefield, $redStance);
				self::set_blueStance($battlefield, $blueStance);
				self::notifyAllGameState($players, 'player(s) changed stance', array(), $battlefield, $cards);
			}
		}

		if ($redScored) {
			$redScore = self::dbIncrementScore($players, self::RED_COLOR);
			self::notifyAllGameState($players, 'red hit', array(), $battlefield, $cards);

			if ($redScore >= 2)
			{
				$this->gamestate->nextState( "endGame" );
				return true;
			}

			self::set_redHit($battlefield, true);
		}

		if ($blueScored) {
			$blueScore = self::dbIncrementScore($players, self::BLUE_COLOR);
			self::notifyAllGameState($players, 'blue hit', array(), $battlefield, $cards);

			if ($blueScore >= 2)
			{
				$this->gamestate->nextState( "endGame" );
				return true;
			}

			self::set_blueHit($battlefield, true);
		}

		if ($red_card == PlayedCard::SPECIAL)
			self::set_redSpecialPlayed($cards, true);
		if ($first)
			self::set_redPlayed0($cards, PlayedCard::NOT_PLAYED);
		else self::set_redPlayed1($cards, PlayedCard::NOT_PLAYED);

		if ($blue_card == PlayedCard::SPECIAL)
			self::set_blueSpecialPlayed($cards, true);
		if ($first)
			self::set_bluePlayed0($cards, PlayedCard::NOT_PLAYED);
		else self::set_bluePlayed1($cards, PlayedCard::NOT_PLAYED);

		return false;
	}
	
	/*
	
	Example for game state "MyGameState":

	function stMyGameState()
	{
		// Do some stuff ...
		
		// (very often) go to another gamestate
		$this->gamestate->nextState( 'some_gamestate_transition' );
	}    
	*/

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

	/*
		zombieTurn:
		
		This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
		You can do whatever you want in order to make sure the turn of this player ends appropriately
		(ex: pass).
		
		Important: your zombie code will be called when the player leaves the game. This action is triggered
		from the main site and propagated to the gameserver from a server, not from a browser.
		As a consequence, there is no current player associated to this action. In your zombieTurn function,
		you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
	*/

	function zombieTurn( $state, $active_player )
	{
		$statename = $state['name'];

		$players = self::loadPlayersBasicInfos();
		$isRedPlayer = $players[$active_player]['player_color'] == self::RED_COLOR;


		// Check if it's a player's turn
		if ($statename === "setupBattlefield")
		{
			// TODO
			$position = ($isRedPlayer) ? bga_rand(6, 9) : bga_rand(2, 5);
			$isHeavenStance = bga_rand(0, 1) == 0;
			self::_confirmedStanceAndPosition($active_player, $isRedPlayer, $isHeavenStance, $position);
			return;
		}
		else if ($statename === "pickCards")
		{
			$cards = self::getGameStateValue( self::CARDS );

			if (self::get_redPlayed0($cards) == PlayedCard::NOT_PLAYED)
			{
				while (true)
				{
					try {
						$card_id = bga_rand(1, 8);
						self::_picked($cards, $isRedPlayer, $card_id, true);
						break;
					}
					catch (BgaUserException $e) {}
				}
				return;
			}

			if (self::get_redPlayed1($cards) == PlayedCard::NOT_PLAYED)
			{
				while (true)
				{
					try {
						$card_id = bga_rand(1, 8);
						self::_picked($cards, $isRedPlayer, $card_id, false);
						break;
					}
					catch (BgaUserException $e) {}
				}
				return;
			}

			$this->gamestate->setPlayerNonMultiactive( $active_player, '');
		}

		throw new feException( "Zombie mode not supported at this game state: ".$statename );
	}
	
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

	/*
		upgradeTableDb:
		
		You don't have to care about this until your game has been published on BGA.
		Once your game is on BGA, this method is called everytime the system detects a game running with your old
		Database scheme.
		In this case, if you change your Database scheme, you just have to apply the needed changes in order to
		update the game database and allow the game to continue to run with your new version.
	
	*/
	
	function upgradeTableDb( $from_version )
	{
		// $from_version is the current version of this game database, in numerical form.
		// For example, if the game was running with a release of your game named "140430-1345",
		// $from_version is equal to 1404301345
		
		// Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


	}    
}
