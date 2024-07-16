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
	const PRIMARY_PLAYER_ID = 'PRIMARY_PLAYER_ID';
	const PRIMARY_PLAYER_STATE = 'PRIMARY_PLAYER_STATE';
	const SECONDARY_PLAYER_STATE = 'SECONDARY_PLAYER_STATE';
	const BATTLEFIELD_TYPE = 'BATTLEFIELD_TYPE';

	protected $stanceNames;
	protected $playedCardNames;
	protected $specialCardNames;
	protected $discardedNames;
	protected $userErrors;
	protected $notifMessages;

	function __construct( )
	{
		parent::__construct();
		self::initGameStateLabels( array(
			self::PRIMARY_PLAYER_ID => 10,
			self::PRIMARY_PLAYER_STATE => 11,
			self::SECONDARY_PLAYER_STATE => 12,
			self::BATTLEFIELD_TYPE => 100,
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
		/** @var array<string> $default_colors */
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

		self::setGameStateInitialValue( self::PRIMARY_PLAYER_ID, reset($players)['player_id'] );
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

		$current_player_id = self::getCurrentPlayerId();
		self::addStateArgs($result, $current_player_id);

		$result['battlefield_type'] = self::getGameStateValue( self::BATTLEFIELD_TYPE );

		return $result;
	}

	/*
		Compute and return the current game progression. beween 0 (=the game just started) and 100 (= the game is finished or almost finished).
	*/
	function getGameProgression()
	{
		$progression = 0;

		// 30% completion for each hit landed.
		$players = self::loadPlayersBasicInfos();
		foreach ($players as $player_id => $player)
		{
			$score = $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");

			// If landed two hits, the game should be over..
			if ($score >= 2)
				return 100;

			$progression += $score * 30;
		}

		// %10 completion if the battlefield is setup 
		$primary_state = self::getGameStateValue( self::PRIMARY_PLAYER_STATE );
		$secondary_state = self::getGameStateValue( self::SECONDARY_PLAYER_STATE );
		if (self::getState_position($primary_state) + self::getState_position($secondary_state) > 0)
			$progression += 10;

		return $progression;
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

	function dbGetScore($players, $primary): int {
		$primary_player_id = self::getGameStateValue( self::PRIMARY_PLAYER_ID );
		foreach ($players as $player_id) {
			if ($primary ^ $player_id != $primary_player_id) {
				return $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
			}
		}

		throw new BgaUserException($this->userErrors['player not found in db']);
	}

	function dbIncrementScore($players, $primary): int {
		$primary_player_id = self::getGameStateValue( self::PRIMARY_PLAYER_ID );
		foreach ($players as $player_id) {
			if ($primary ^ $player_id != $primary_player_id) {
				$value = $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
				$value++;
				$this->DbQuery("UPDATE player SET player_score='$value' WHERE player_id='$player_id'");
				return $player_id;
			}
		}

		throw new BgaUserException($this->userErrors['player not found in db']);
	}

	function addStateArgs(array &$args, int $player_id, int|null $primary_state = null, int|null $secondary_state = null)
	{
		$primary_player_id = self::getGameStateValue( self::PRIMARY_PLAYER_ID );
		$primary_state = $primary_state ?? self::getGameStateValue( self::PRIMARY_PLAYER_STATE );
		$secondary_state = $secondary_state ?? self::getGameStateValue( self::SECONDARY_PLAYER_STATE );

		$player_state = $player_id == $primary_player_id ? $primary_state : $secondary_state;
		$opponent_state = $player_id == $primary_player_id ? $secondary_state : $primary_state;

		$args['player_state'] = $player_state;

		// If both players have not set there battlefield position, keep all opponent information hidden.
		if (self::getState_position($player_state) + self::getState_position($opponent_state) > 0)
		{
			$args['opponent_state'] = 0;
			return;
		}

		// Hide special card if they are not played (and not this player)
		if (!self::getState_SpecialPlayed($opponent_state))
			self::setState_Special($opponent_state, SpecialCard::HIDDEN);

		// If we are picking cards, hide the played cards (and not this player)
		if ($this->gamestate->state()['name'] == 'pickCards')
		{
			if (self::getState_Played0($opponent_state) != PlayedCard::NOT_PLAYED)
				self::setState_Played0($opponent_state, PlayedCard::HIDDEN);
			if (self::getState_Played1($opponent_state) != PlayedCard::NOT_PLAYED)
				self::setState_Played1($opponent_state, PlayedCard::HIDDEN);
		}

		$args['opponent_state'] = $opponent_state;
	}

	function notifyAllWithGameState(array &$players, string $type, array $args, int|null $primary_state = null, int|null $secondary_state = null)
	{
		foreach ($players as $player)
			self::notifyGameState($player, $type, $args, $primary_state, $secondary_state);
	}

	function notifyGameState(array $player, string $type, array $args, int|null $primary_state = null, int|null $secondary_state = null)
	{
		self::addStateArgs($args, $player['player_id'], $primary_state, $secondary_state);
		self::notifyPlayer(
			$player['player_id'],
			$type,
			$this->notifMessages[$type],
			$args );
	}

	public function getCurrentPlayerStateName(): string {
		return self::getCurrentPlayerId() == self::getGameStateValue( self::PRIMARY_PLAYER_ID ) ? self::PRIMARY_PLAYER_STATE : self::SECONDARY_PLAYER_STATE;
	}

	public function getState_position($state): int {
		return ($state >> 0) & 0b1111;
	}
	public function getState_stance($state): int {
		return ($state >> 4) & 0b1;
	}
	public function getState_hit($state): bool {
		return (($state >> 5) & 0b1) == 1;
	}
	public function getState_Played0($state): int {
		return ($state >> 6) & 0b1111;
	}
	public function getState_Played1($state): int {
		return ($state >> 10) & 0b1111;
	}
	public function getState_Discard($state): int {
		return ($state >> 14) & 0b111;
	}
	public function getState_Special($state): int {
		return ($state >> 17) & 0b11;
	}
	public function getState_SpecialPlayed($state): bool {
		return (($state >> 19) & 0b1) == 1;
	}

	protected function setState_position(&$state, int $position) {
		$state &= ~(0b1111 << 0);
		$state |= ($position & 0b1111) << 0;
	}
	protected function setState_stance(&$state, int $stance) {
		$state &= ~(0b1 << 4);
		$state |= ($stance & 0b1) << 4;
	}
	protected function setState_hit(&$state, bool $hit) {
		$state &= ~(0b1 << 5);
		if ($hit) $state |= 1 << 5;
	}
	protected function setState_Played0(&$state, int $card) {
		$state &= ~(0b1111 << 6);
		$state |= ($card & 0b1111) << 6;
	}
	protected function setState_Played1(&$state, int $card) {
		$state &= ~(0b1111 << 10);
		$state |= ($card & 0b1111) << 10;
	}
	protected function setState_Discard(&$state, int $card) {
		$state &= ~(0b111 << 14);
		$state |= ($card & 0b111) << 14;
	}
	protected function setState_Special(&$state, int $card) {
		$state &= ~(0b11 << 17);
		$state |= ($card & 0b11) << 17;
	}
	protected function setState_SpecialPlayed(&$state, bool $played) {
		$state &= ~(0b1 << 19);
		if ($played) $state |= 1 << 19;
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

	function confirmedStanceAndPosition(bool $isHeavenStance, int $position)
	{
		self::checkAction( 'confirmedStanceAndPosition' );
		self::_confirmedStanceAndPosition(self::getCurrentPlayerStateName(), $isHeavenStance, $position);
	}

	function _confirmedStanceAndPosition($player_state_name, bool $isHeavenStance, int $position)
	{
		// Validate the position based on the battlefield type.
		switch (self::getGameStateValue( self::BATTLEFIELD_TYPE ))
		{
			case 2:
				if ($position < 2 || $position > 4)
					throw new BgaUserException("Invalid position for red player. Must be 4-6 inclusive.");
				break;
			case 1: throw new BgaUserException("The standard battle field should be automatically set up.");
			default: throw new BgaVisibleSystemException("Invalid battlefield type");
		}
		
		// Update the player's state.
		$player_state = self::getGameStateValue( $player_state_name );
		self::setState_position($player_state, $position);
		self::setState_stance($player_state, $isHeavenStance ? Stance::HEAVEN : Stance::EARTH);
		self::setGameStateValue( $player_state_name, $player_state);

		// End the player's multiactive turn.
		// If both players have confirmed, also notify the players of the battlefield setup.
		if ($this->gamestate->setPlayerNonMultiactive( self::getCurrentPlayerId(), ''))
		{
			$players = self::loadPlayersBasicInfos();
			$this->notifyAllWithGameState($players, 'battlefield setup', array());
		}
		
	}

	function pickedFirst(int $card_id)
	{
		self::checkAction( 'pickedFirst' );
		self::pickedCard(self::getCurrentPlayerStateName(), $card_id, true);
		$this->gamestate->updateMultiactiveOrNextState( '' );
	}

	function pickedSecond(int $card_id)
	{
		self::checkAction( 'pickedSecond' );
		self::pickedCard(self::getCurrentPlayerStateName(), $card_id, false);
		$this->gamestate->updateMultiactiveOrNextState( '' );
	}

	function pickedCard(string $player_state_name, int $card_id, bool $first)
	{
		$player_state = self::getGameStateValue( $player_state_name );
	
		$this->validateCardPlay($player_state, $card_id, $first); // Throws an exception if the card is invalid.

		if ($first) self::setState_Played0($player_state, $card_id);
		else self::setState_Played1($player_state, $card_id);

		self::setGameStateValue( $player_state_name, $player_state);

		$players = self::loadPlayersBasicInfos();
		self::notifyAllWithGameState($players, 'played card', array());
	}

	function undoFirst()
	{
		self::checkAction( 'undoFirst' );
		self::_undo(self::getCurrentPlayerStateName(), true);
	}

	function undoSecond()
	{
		self::checkAction( 'undoSecond' );
		self::_undo(self::getCurrentPlayerStateName(), false);
	}

	function _undo(string $player_state_name, bool $first)
	{
		// We don't need to validate this (if card is already not played) because the end result is the same.
		// There is little point for throwing an error here.
		$player_state = self::getGameStateValue( $player_state_name );
		if ($first) self::setState_Played0($player_state, PlayedCard::NOT_PLAYED);
		else self::setState_Played1($player_state, PlayedCard::NOT_PLAYED);
		self::setGameStateValue( $player_state_name, $player_state);

		$players = self::loadPlayersBasicInfos();
		self::notifyAllWithGameState($players, 'undo card', array());

		$this->gamestate->updateMultiactiveOrNextState( '' );
	}

	/** All this does is deactivates the player and moved to the next state if both are deactivated. */
	function confirmedCards()
	{
		self::checkAction( 'confirmedCards' );

		$player_state = self::getGameStateValue( self::getCurrentPlayerStateName() );
		if (self::getState_Played0($player_state) == PlayedCard::NOT_PLAYED || self::getState_Played1($player_state) == PlayedCard::NOT_PLAYED)
			throw new BgaUserException($this->userErrors['not all cards played']);

		$player_id = self::getCurrentPlayerId();
		$this->gamestate->setPlayerNonMultiactive( $player_id, '');
	}


//////////////////////////////////////////////////////////////////////////////
//////////// Player Action Validation
////////////

	protected function validateCardPlay(int $player_state, int $card, bool $isFirstCard)
	{
		$discard = self::getState_Discard($player_state);
		$special = self::getState_Special($player_state);
		$played0 = self::getState_Played0($player_state);
		$played1 = self::getState_Played1($player_state);
		$specialPlayed = self::getState_SpecialPlayed($player_state);

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
		$primary_state = 0;
		$secondary_state = 0;

		$first_card = bga_rand(0, 2);
		$primarySpecial = $first_card + 1;
		$secondarySpecial = ($first_card + bga_rand(1, 2)) % 3 + 1;

		self::setState_Special($primary_state, $primarySpecial);
		self::setState_Special($secondary_state, $secondarySpecial);

		$players = self::loadPlayersBasicInfos();

		$primary_player_id = self::getGameStateValue( self::PRIMARY_PLAYER_ID );
		foreach ($players as $player)
		{
			$message_args = array();
			$message_args['card_name'] = $this->specialCardNames[
				$player['player_id'] == $primary_player_id ? $primarySpecial : $secondarySpecial
			];

			self::notifyGameState($player, 'starting special card', $message_args);
		}

		switch (self::getGameStateValue( self::BATTLEFIELD_TYPE ))
		{
			case 1:
				self::setState_Position($primary_state, 1);
				self::setState_Position($secondary_state, 1);
				self::setState_Stance($primary_state, Stance::HEAVEN);
				self::setState_Stance($secondary_state, Stance::HEAVEN);

				self::setGameStateValue( self::PRIMARY_PLAYER_STATE, $primary_state );
				self::setGameStateValue( self::SECONDARY_PLAYER_STATE, $secondary_state );

				$this->notifyAllWithGameState($players, 'battlefield setup', array(), $primary_state, $secondary_state);
				$this->gamestate->nextState( "" );
				break;

			case 2:
				self::setGameStateValue( self::PRIMARY_PLAYER_STATE, $primary_state );
				self::setGameStateValue( self::SECONDARY_PLAYER_STATE, $secondary_state );

				$this->gamestate->setAllPlayersMultiactive();
				break;

			default:
				throw new BgaVisibleSystemException("Invalid battlefield type");
		}
	}

	function stPickCardsInit()
	{
		$this->gamestate->setAllPlayersMultiactive();
	}

	function stResolveCards()
	{
		$players = self::loadPlayersBasicInfos();

		$primary_state = self::getGameStateValue( self::PRIMARY_PLAYER_STATE );
		$secondary_state = self::getGameStateValue( self::SECONDARY_PLAYER_STATE );

		// Setup cards and flip first one over.
		if (self::getState_Played0($primary_state) == PlayedCard::SPECIAL || self::getState_Played1($primary_state) == PlayedCard::SPECIAL)
			self::setState_SpecialPlayed($primary_state, true);
		if (self::getState_Played0($secondary_state) == PlayedCard::SPECIAL || self::getState_Played1($secondary_state) == PlayedCard::SPECIAL)
			self::setState_SpecialPlayed($secondary_state, true);

		self::notifyAllWithGameState($players, 'before first resolve', array(), $primary_state, $secondary_state); 

		// Do the first cards...
		if (self::DoCards($players, $primary_state, $secondary_state, true))
			return; // game over

		// Remove the first played card and flip second one over (presentation que).
		self::setState_Played0($primary_state, PlayedCard::NOT_PLAYED);
		self::setState_Played0($secondary_state, PlayedCard::NOT_PLAYED);
		self::notifyAllWithGameState($players, 'before second resolve', array(), $primary_state, $secondary_state); 

		// Do the second cards...
		if (self::DoCards($players, $primary_state, $secondary_state, false))
			return; // game over

		// Return second card as discarded.
		self::setState_Discard($primary_state, self::playedCardToDiscard(self::getState_Played0($primary_state)));
		self::setState_Discard($secondary_state, self::playedCardToDiscard(self::getState_Played0($secondary_state)));
		self::setState_Played1($primary_state, PlayedCard::NOT_PLAYED);
		self::setState_Played1($secondary_state, PlayedCard::NOT_PLAYED);
		self::notifyAllWithGameState($players, 'after resolve', array(), $primary_state, $secondary_state); 

		// Save the new states and move to the next state.
		self::setGameStateValue( self::PRIMARY_PLAYER_STATE, $primary_state );
		self::setGameStateValue( self::SECONDARY_PLAYER_STATE, $secondary_state );
		$this->gamestate->nextState( "pickCards" );

		// give player some more time
		foreach ($players as $player_id => $player) {
			$this->giveExtraTime( $player_id );
		}
	}

	function DoCards(&$players, int &$primary_state, int &$secondary_state,  bool $first): bool
	{
		$primary_card = $first ? self::getState_Played0($primary_state) : self::getState_Played1($primary_state);
		$secondary_card = $first ? self::getState_Played0($secondary_state) : self::getState_Played1($secondary_state);

		$primary_special_played = $primary_card == PlayedCard::SPECIAL ? self::getState_Special($primary_state) : SpecialCard::HIDDEN;
		$secondary_special_played = $secondary_card == PlayedCard::SPECIAL ? self::getState_Special($secondary_state) : SpecialCard::HIDDEN;

		// Validate
		if ($primary_card == PlayedCard::NOT_PLAYED || $secondary_card == PlayedCard::NOT_PLAYED)
			throw new BgaVisibleSystemException($this->userErrors['not all cards played']);

		switch (self::getGameStateValue( self::BATTLEFIELD_TYPE ))
		{
			case 1:
				$battlefieldSize = 5;
				break;
			case 2:
				$battlefieldSize = 7;
				break;
			default:
				throw new BgaVisibleSystemException("Invalid battlefield type");
		}

		$primary_stance = self::getState_Stance($primary_state);
		$secondary_stance = self::getState_Stance($secondary_state);
		$primary_position = self::getState_Position($primary_state);
		$secondary_position = self::getState_Position($secondary_state);

		// All math is done from bottom-up positions,
		// but the position is stored based on the distance from their end.
		$secondary_position = $battlefieldSize - $secondary_position + 1;

		//
		// MOVEMENT
		//

		// Charge: Move two spaces forward (-2 for red, +2 for blue)

		if ($primary_card == PlayedCard::CHARGE && $secondary_card == PlayedCard::CHARGE)
		{
			if ($primary_stance == $secondary_stance) // Both move at the same time.
			{
				if ($primary_position - $secondary_position <= 1) {} // There is not enough room to move
				else if ($primary_position - $secondary_position <= 3) // Both can move only once.
				{
					$primary_position -= 1;
					$secondary_position += 1;
				}
				else { // Move full amount
					$primary_position -= 2;
					$secondary_position += 2;
				}
			}

			else if ($primary_stance == 0) // Red Player moves first
			{
				$primary_position = max($primary_position - 2, $secondary_position);
				$secondary_position = min($secondary_position + 2, $primary_position);
			}

			else // Blue Player moves first
			{
				$secondary_position = min($secondary_position + 2, $primary_position);
				$primary_position = max($primary_position - 2, $secondary_position);
			}
		}

		else if ($primary_card == PlayedCard::CHARGE)
		{
			$primary_position = max($primary_position - 2, $secondary_position);
		}

		else if ($secondary_card == PlayedCard::CHARGE)
		{
			$secondary_position = min($secondary_position + 2, $primary_position);
		}

		if ($primary_card == PlayedCard::CHARGE || $secondary_card == PlayedCard::CHARGE)
		{
			self::setState_position($primary_state, $primary_position);
			self::setState_position($secondary_state, $battlefieldSize - $secondary_position + 1);// see note near $secondary_position init
			self::notifyAllWithGameState($players, 'player(s) charged', array(), $primary_state, $secondary_state);
		}

		// Approach/Retreat: Move one space forward/backward (-1 for red, +1 for blue)

		$primary_move =
			$primary_card == PlayedCard::APPROACH ? -1 :
			($primary_card == PlayedCard::RETREAT ? 1 : 0);
		$secondary_move =
			$secondary_card == PlayedCard::APPROACH ? 1 :
			($secondary_card == PlayedCard::RETREAT ? -1 : 0);

		if ($primary_move != 0 && $secondary_move != 0)
		{
			if ($primary_stance == $secondary_stance) // Both move at the same time.
			{
				if ($primary_card == PlayedCard::APPROACH && $secondary_card == PlayedCard::APPROACH)
				{
					if ($primary_position - $secondary_position <= 1) {} // There is not enough room to move
					else {
						$primary_position -= 1;
						$secondary_position += 1;
					}
				}
				else { // Otherwise, both players can move according to card without interference
					$primary_position = max(min($primary_position + $primary_move, $battlefieldSize), 1);
					$secondary_position = max(min($secondary_position + $secondary_move, $battlefieldSize), 1);
				}
			}

			else if ($primary_stance == 0) // Red Player moves first
			{
				$primary_position = max(min($primary_position + $primary_move, $battlefieldSize), $secondary_position);
				$secondary_position = max(min($secondary_position + $secondary_move, $primary_position), 1);
			}

			else // Blue Player moves first
			{
				$secondary_position = max(min($secondary_position + $secondary_move, $primary_position), 1);
				$primary_position = max(min($primary_position + $primary_move, $battlefieldSize), $secondary_position);
			}
		}
		// Only one or the other is trying to move...
		else if ($primary_move != 0 || $secondary_move != 0)
		{
			$primary_position = max(min($primary_position + $primary_move, $battlefieldSize), $secondary_position);
			$secondary_position = max(min($secondary_position + $secondary_move, $primary_position), 1);
		}

		if ($primary_move != 0 || $secondary_move != 0)
		{
			self::setState_position($primary_state, $primary_position);
			self::setState_position($secondary_state, $battlefieldSize - $secondary_position + 1);// see note near $secondary_position init
			self::notifyAllWithGameState($players, 'player(s) moved', array(), $primary_state, $secondary_state);
		}

		// Change stance: Invert the current stance

		if ($primary_card == PlayedCard::CHANGE_STANCE) {
			$primary_stance = $primary_stance == Stance::HEAVEN ? Stance::EARTH : Stance::HEAVEN;
			self::setState_stance($primary_state, $primary_stance);
		}
		if ($secondary_card == PlayedCard::CHANGE_STANCE) {
			$secondary_stance = $secondary_stance == Stance::HEAVEN ? Stance::EARTH : Stance::HEAVEN;
			self::setState_stance($secondary_state, $secondary_stance);
		}

		if ($primary_card == PlayedCard::CHANGE_STANCE || $secondary_card == PlayedCard::CHANGE_STANCE)
			self::notifyAllWithGameState($players, 'player(s) changed stance', array(), $primary_state, $secondary_state);

		//
		// ATTACKS
		//

		$primary_landed_hit = false;
		$secondary_landed_hit = false;
		$distance = $primary_position - $secondary_position;

		// High Strike: If the opponent is two spaces away and in heaven stance, deal 1 damage

		if ($primary_card == PlayedCard::HIGH_STRIKE && $primary_stance == Stance::HEAVEN && $distance == 2)
			$primary_landed_hit = true;
		if ($secondary_card == PlayedCard::HIGH_STRIKE && $secondary_stance == Stance::HEAVEN && $distance == 2)
			$secondary_landed_hit = true;

		// Low Strike: If the opponent is one space away and in earth stance, deal 1 damage

		if ($primary_card == PlayedCard::LOW_STRIKE && $primary_stance == Stance::EARTH && $distance == 1)
			$primary_landed_hit = true;
		if ($secondary_card == PlayedCard::LOW_STRIKE && $secondary_stance == Stance::EARTH && $distance == 1)
			$secondary_landed_hit = true;

		// Balanced Strike: If the opponent is on the same space, deal 1 damage

		if ($primary_card == PlayedCard::BALANCED_STRIKE && $distance == 0)
			$primary_landed_hit = true;
		if ($secondary_card == PlayedCard::BALANCED_STRIKE && $distance == 0)
			$secondary_landed_hit = true;

		// Kesa Strike: If the opponent is zero or one space away and in heaven stance, deal 1 damage. Switch to earth stance.

		if ($primary_special_played == SpecialCard::KESA_STRIKE)
		{
			if ($primary_stance == 0 && $distance <= 1)
				$primary_landed_hit = true;
			$primary_stance = Stance::EARTH;
		}

		if ($secondary_special_played == SpecialCard::KESA_STRIKE)
		{
			if ($secondary_stance == 0 && $distance <= 1)
				$secondary_landed_hit = true;
			$secondary_stance = Stance::EARTH;
		}

		// Zan-Tetsu Strike: If the opponent is two or three spaces away and in earth stance, deal 1 damage. Switch to heaven stance.

		if ($primary_special_played == SpecialCard::ZAN_TETSU_STRIKE)
		{
			if ($primary_stance == 1 && ($distance == 2 || $distance == 3))
				$primary_landed_hit = true;
			$primary_stance = Stance::HEAVEN;
		}

		if ($secondary_special_played == SpecialCard::ZAN_TETSU_STRIKE)
		{
			if ($secondary_stance == 1 && ($distance == 2 || $distance == 3))
				$secondary_landed_hit = true;
			$secondary_stance = Stance::HEAVEN;
		}

		// Counterattack: If the opponent played a card that would hit you, deal 1 damage and negate the opponent's card

		if ($primary_special_played == SpecialCard::COUNTERATTACK && $secondary_landed_hit)
		{
			$primary_landed_hit = true;
			$secondary_landed_hit = false;
		}

		if ($secondary_special_played == SpecialCard::COUNTERATTACK && $primary_landed_hit)
		{
			$secondary_landed_hit = true;
			$primary_landed_hit = false;
		}

		if ($primary_card == PlayedCard::HIGH_STRIKE || $primary_card == PlayedCard::LOW_STRIKE || $primary_card == PlayedCard::BALANCED_STRIKE || $primary_card == PlayedCard::SPECIAL || $secondary_card == PlayedCard::HIGH_STRIKE || $secondary_card == PlayedCard::LOW_STRIKE || $secondary_card == PlayedCard::BALANCED_STRIKE || $secondary_card == PlayedCard::SPECIAL
		) {
			self::notifyAllWithGameState($players, 'player(s) attacked', array(), $primary_state, $secondary_state);

			if ($primary_card == PlayedCard::SPECIAL && $primary_special_played != SpecialCard::COUNTERATTACK || $secondary_card == PlayedCard::SPECIAL && $secondary_special_played != SpecialCard::COUNTERATTACK)
			{
				self::setState_stance($primary_state, $primary_stance);
				self::setState_stance($secondary_state, $secondary_stance);
				self::notifyAllWithGameState($players, 'player(s) changed stance', array(), $primary_state, $secondary_state);
			}
		}

		if ($primary_landed_hit && !$secondary_landed_hit)
		{
			$wasHit = self::getState_hit($secondary_state);
			self::setState_hit($secondary_state, true);

			$primary_id = self::dbIncrementScore($players, true);
			self::notifyAllWithGameState($players, 'player(s) hit', array(
				"winner" => $primary_id
			), $primary_state, $secondary_state);

			if ($wasHit)
			{
				$this->gamestate->nextState( "endGame" );
				return true;
			}
		}

		else if ($secondary_landed_hit && !$primary_landed_hit)
		{
			$wasHit = self::getState_hit($primary_state);
			self::setState_hit($primary_state, true);

			$secondary_id = self::dbIncrementScore($players, false);
			self::notifyAllWithGameState($players, 'player(s) hit', array(
				"winner" => $secondary_id
			), $primary_state, $secondary_state);

			if ($wasHit)
			{
				$this->gamestate->nextState( "endGame" );
				return true;
			}
		}

		else if ($primary_landed_hit && $secondary_landed_hit) {
			self::notifyAllWithGameState($players, 'player(s) hit', array(), $primary_state, $secondary_state);
		}

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

		$primary_player_id = self::getGameStateValue( self::PRIMARY_PLAYER_ID );
		$player_state_name = $active_player == $primary_player_id ? self::PRIMARY_PLAYER_STATE : self::SECONDARY_PLAYER_STATE;


		// Check if it's a player's turn
		if ($statename === "setupBattlefield")
		{
			// TODO
			$position = bga_rand(2, 5);
			$isHeavenStance = bga_rand(0, 1) == 0;
			self::_confirmedStanceAndPosition($player_state_name, $isHeavenStance, $position);
			return;
		}
		else if ($statename === "pickCards")
		{
			$cards = self::getGameStateValue( $player_state_name );

			if (self::getState_Played0($cards) == PlayedCard::NOT_PLAYED)
			{
				while (true)
				{
					try {
						$card_id = bga_rand(1, 8);
						self::pickedCard($player_state_name, $card_id, true);
						break;
					}
					catch (BgaUserException $e) {}
				}
				return;
			}

			if (self::getState_Played1($cards) == PlayedCard::NOT_PLAYED)
			{
				while (true)
				{
					try {
						$card_id = bga_rand(1, 8);
						self::pickedCard($player_state_name, $card_id, false);
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
