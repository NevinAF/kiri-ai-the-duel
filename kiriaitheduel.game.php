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


class KiriaiTheDuel extends Table
{
	protected $cards;
	protected $cardNames;

	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array(
            "redSamuraiDamage" => 10,
			"blueSamuraiDamage" => 11,
			"redSamuraiPosition" => 12,
			"blueSamuraiPosition" => 13,
			"redSamuraiStance" => 14,
			"blueSamuraiStance" => 15,
			"redPlayer" => 16,
			"bluePlayer" => 17,

			"redFirstPlayedFlipped" => 20,
			"redSecondPlayedFlipped" => 21,
			"blueFirstPlayedFlipped" => 22,
			"blueSecondPlayedFlipped" => 23
        ) );

		$this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "card" );
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
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
        
        /************ Start the game initialization *****/

		// TODO: Boolean for if the game uses the standard or advanced battle field

        // Init global values with their initial values
        self::setGameStateInitialValue( 'redSamuraiDamage', 0 );
		self::setGameStateInitialValue( 'blueSamuraiDamage', 0 );
		self::setGameStateInitialValue( 'redSamuraiPosition', 5 ); // Standard, at the end
		self::setGameStateInitialValue( 'blueSamuraiPosition', 0 ); // Standard, at the end
		self::setGameStateInitialValue( 'redSamuraiStance', 0 ); // 0 = Heaven Stance, 1 = Earth Stance
		self::setGameStateInitialValue( 'blueSamuraiStance', 0 ); // 0 = Heaven Stance, 1 = Earth Stance

		self::setGameStateInitialValue( 'redFirstPlayedFlipped', 0 );
		self::setGameStateInitialValue( 'redSecondPlayedFlipped', 0 );
		self::setGameStateInitialValue( 'blueFirstPlayedFlipped', 0 );
		self::setGameStateInitialValue( 'blueSecondPlayedFlipped', 0 );

		// Set the red player
		$players = self::loadPlayersBasicInfos();
		$playerIds = array();
		foreach( $players as $player_id => $player )
			$playerIds[] = $player_id;

		if ($players[$playerIds[0]]['player_color'] == $gameinfos['player_colors'][0])
		{
			$redPlayer = $playerIds[0];
			$bluePlayer = $playerIds[1];
		}
		else {
			$redPlayer = $playerIds[1];
			$bluePlayer = $playerIds[0];
		}

		self::setGameStateInitialValue( 'redPlayer', $redPlayer );
		self::setGameStateInitialValue( 'bluePlayer', $bluePlayer );

        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // Create the cards
		// Types: 0/5 = Approach/Retreat, 1/6 = Charge/Change Stance, 2/7 = High Strike, 3/8 = Low Strike, 4/9 = Balanced Strike, 10 = Kesa Strike, 11 = Zan-Tetsu Strike, 12 = Counterattack
		$redCards = array();
		$blueCards = array();
		$deckCards = array();

		// Initialize players hands (1-5 and 6-10)
		for ($i = 0; $i < 5; $i++) {
			$redCards[] = array('type' => 0, 'type_arg' => 0, 'nbr' => 1 );
			$blueCards[] = array('type' => 0, 'type_arg' => 0, 'nbr' => 1 );
		}

		// Initialize Special cards (11-13)
		for ($i = 10; $i < 13; $i++) {
			$deckCards[] = array('type' => 0, 'type_arg' => 0, 'nbr' => 1);
		}

		$this->cards->createCards( $redCards, 'hand', $redPlayer );
		$this->cards->createCards( $blueCards, 'hand', $bluePlayer );
		$this->cards->createCards( $deckCards, 'deck' );
		$this->cards->shuffle('deck');

        /************ End of the game initialization *****/

		// No
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

		$result['redPlayer'] = self::getGameStateValue( 'redPlayer' );
		$result['bluePlayer'] = self::getGameStateValue( 'bluePlayer' );

		$result['state'] = self::getCurrentCards($this->getCurrentPlayerId());

        return $result;
    }

	protected function getCurrentCards($current_player_id, $hidePlayedCards = true)
	{
		// TODO only send updated information??

        $cards = array();
		$flippedState = array();
		$stances = array();
		$positions = array();
		$damage = array();
		
		$positions['red_samurai'] = self::getGameStateValue( 'redSamuraiPosition' );
		$positions['blue_samurai'] = self::getGameStateValue( 'blueSamuraiPosition' );
		$stances['red_samurai'] = self::getGameStateValue( 'redSamuraiStance' );
		$stances['blue_samurai'] = self::getGameStateValue( 'blueSamuraiStance' );
		$damage['red_samurai'] = self::getGameStateValue( 'redSamuraiDamage' );
		$damage['blue_samurai'] = self::getGameStateValue( 'blueSamuraiDamage' );

		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );
		$otherPlayer = $current_player_id == $redPlayer ? $bluePlayer : $redPlayer;

		$cards['redHand'] = self::getCardIdsInLocation('hand', $redPlayer, $current_player_id == $redPlayer ? -1 : 97);
		$cards['blueHand'] = self::getCardIdsInLocation('hand', $bluePlayer, $current_player_id == $bluePlayer ? -1 : 98);

		$cards['redPlayed']= array(
			'0' => self::getCardIdInLocation('firstPlayed', $redPlayer),
			'1' => self::getCardIdInLocation('secondPlayed', $redPlayer)
		);
		$cards['bluePlayed']= array(
			'0' => self::getCardIdInLocation('firstPlayed', $bluePlayer),
			'1' => self::getCardIdInLocation('secondPlayed', $bluePlayer)
		);

		$cards['redDiscard'] = self::getCardIdsInLocation('discard', $redPlayer);
		$cards['blueDiscard'] = self::getCardIdsInLocation('discard', $bluePlayer);

		$cards['deck'] = self::getCardIdsInLocation( 'deck', -1, 99 );

		// If we are picking cards and the other player has already picked, we need to add the cards played back to their hand to avoid showing their cards played before the player has picked.
		$state = $this->gamestate->state();
		if( $hidePlayedCards && $state['name'] == 'pickCards' )
		{
			$otherPlayed = $cards[$otherPlayer == $redPlayer ? 'redPlayed' : 'bluePlayed'];

			if ($otherPlayed[0] != -1 || $otherPlayed[1] != -1)
			{
				// Merge and Sort $otherHand by ID so there is no additional information given to the player
				$otherHand = array_merge($cards[$otherPlayer == $redPlayer ? 'redHand' : 'blueHand'], $otherPlayed);
				sort($otherHand);

				$cards[$otherPlayer == $redPlayer ? 'redHand' : 'blueHand'] = $otherHand;
				$cards[$otherPlayer == $redPlayer ? 'redPlayed' : 'bluePlayed'] = array(-1, -1);
			}

			if ($current_player_id == $redPlayer)
			{
				$flippedState['redPlayed_0_Flipped'] = self::getGameStateValue( 'redFirstPlayedFlipped' );
				$flippedState['redPlayed_1_Flipped'] = self::getGameStateValue( 'redSecondPlayedFlipped' );
				$flippedState['bluePlayed_0_Flipped'] = -1; // not shown
				$flippedState['bluePlayed_1_Flipped'] = -1; // not shown
			}
			else {
				$flippedState['redPlayed_0_Flipped'] = -1; // not shown
				$flippedState['redPlayed_1_Flipped'] = -1; // not shown
				$flippedState['bluePlayed_0_Flipped'] = self::getGameStateValue( 'blueFirstPlayedFlipped' );
				$flippedState['bluePlayed_1_Flipped'] = self::getGameStateValue( 'blueSecondPlayedFlipped' );
			}
		}
		else {
			$flippedState['redPlayed_0_Flipped'] = self::getGameStateValue( 'redFirstPlayedFlipped' );
			$flippedState['redPlayed_1_Flipped'] = self::getGameStateValue( 'redSecondPlayedFlipped' );
			$flippedState['bluePlayed_0_Flipped'] = self::getGameStateValue( 'blueFirstPlayedFlipped' );
			$flippedState['bluePlayed_1_Flipped'] = self::getGameStateValue( 'blueSecondPlayedFlipped' );
		}

		return array(
			'cards' => $cards,
			'flippedState' => $flippedState,
			'positions' => $positions,
			'stances' => $stances,
			'damage' => $damage
		);
	}

	protected function getCardIdsInLocation($location, $player_id, $hideSpecialAs = -1)
	{
		$cards = $this->cards->getCardsInLocation( $location, $player_id );
		$result = array();
		foreach ($cards as $card)
		{
			if ($card['id'] > 10 && $hideSpecialAs != -1)
				$result[] = $hideSpecialAs;
			else $result[] = $card['id'];
		}
		return $result;
	}

	protected function getCardIdInLocation($location, $player_id)
	{
		$cards = $this->cards->getCardsInLocation( $location, $player_id );

		if (count($cards) > 1)
			throw new BgaUserException( self::_("Player has more than one card in the first played slot? This should not be possible.") );
		else if (count($cards) == 0)
			return -1;
		else foreach ($cards as $card)
			return $card['id'];
	}

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

		$redDamage = self::getGameStateValue( 'redSamuraiDamage' );
		$blueDamage = self::getGameStateValue( 'blueSamuraiDamage' );

		if ($redDamage >= 2 || $blueDamage >= 2)
			return 100;

        return $redDamage * 33 + $blueDamage * 33;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in kiriaitheduel.action.php)
    */

	function pickedCards( $firstCard_id, $secondCard_id )
	{
		self::checkAction( 'pickedCards' );
		self::doPickedCards( $this->getCurrentPlayerId(), $firstCard_id, $secondCard_id );
	}

    function doPickedCards( $player_id,  $firstCard_id, $secondCard_id )
    {
		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );

		// if firstCard_id is negative, it means the card is flipped
		if ($player_id == $redPlayer)
		{
			self::setGameStateValue ( 'redFirstPlayedFlipped', $firstCard_id < 0 ? 1 : 0 );
			self::setGameStateValue ( 'redSecondPlayedFlipped', $secondCard_id < 0 ? 1 : 0 );
		}
		else
		{
			self::setGameStateValue ( 'blueFirstPlayedFlipped', $firstCard_id < 0 ? 1 : 0 );
			self::setGameStateValue ( 'blueSecondPlayedFlipped', $secondCard_id < 0 ? 1 : 0 );
		}
		
		$firstCard_id = abs($firstCard_id);
		$secondCard_id = abs($secondCard_id);
		// VALIDATE ACTION
		if (count($this->cards->getCardsInLocation( 'firstPlayed', $player_id )) != 0) {
			throw new BgaUserException( self::_("You have already played your cards (first played not empty)? This should not be possible.") );
		}
		if (count($this->cards->getCardsInLocation( 'secondPlayed', $player_id )) != 0) {
			throw new BgaUserException( self::_("You have already played your cards (second played not empty)? This should not be possible.") );
		}
		$firstCard = $this->cards->getCard( $firstCard_id );
		$secondCard = $this->cards->getCard( $secondCard_id );
		if ($firstCard['location'] != 'hand' || $firstCard['location_arg'] != $player_id) {
			throw new BgaUserException( self::_("You do not have that card in your hand (firstCard)! This should not be possible!") );
		}
		if ($secondCard['location'] != 'hand' || $secondCard['location_arg'] != $player_id) {
			throw new BgaUserException( self::_("You do not have that card in your hand (secondCard)! This should not be possible!") );
		}

		// Move the cards to the play area
		$this->cards->moveCard( $firstCard_id, 'firstPlayed', $player_id );
		$this->cards->moveCard( $secondCard_id, 'secondPlayed', $player_id );

		$players = self::loadPlayersBasicInfos();

        // Notify all players about the card played
        self::notifyAllPlayers( "cardsPlayed", clienttranslate( '${player_name} has picked cards for this round' ), array(
            'player_id' => $player_id,
            'player_name' => $players[$player_id]['player_name'],
        ) );

		if ($this->gamestate->setPlayerNonMultiactive( $player_id, ''))
		{
			// Flip over any cards that are special in the play area not working here??
		}
	}

	protected function notifyCardFlip($location, $player_id, $pseudoId, $otherPlayerId)
	{
		$cards = $this->cards->getCardsInLocation( $location, $player_id );

		foreach ($cards as $card) {
			if ($card['id'] >= 11) {
				$players = self::loadPlayersBasicInfos();
				self::notifyPlayer( $otherPlayerId, "cardFlipped", clienttranslate( 'The ${card_name} special card was played by ${player_name' ), array(
					'player_id' => $player_id,
					'player_name' => $players[$player_id]['player_name'],
					'back_card_id' => $pseudoId,
					'card_id' => $card['id'],
					'card_name' => $this->cardNames[$card['id']]
				) );
			}
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

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

	function stDrawSpecialCards()
	{
		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );

		$this->drawAndNotify($redPlayer);
		$this->drawAndNotify($bluePlayer);

		$this->gamestate->nextState( "" );
	}

	function drawAndNotify($player_id)
	{
		$card = $this->cards->pickCard('deck', $player_id);

		self::resetAndNotify(
			$player_id,
			'drawSpecialCard',
			'You started the game with the ${card_name} special card',
			array( 
				'card' => $card,
				'card_name' => $this->cardNames[$card['id']]
			)
		);
	}

	function resetAndNotify($player_id, $type, $message, $message_args, $hidePlayedCards = true)
	{
		$message_args['state'] = self::getCurrentCards($player_id, $hidePlayedCards);
		self::notifyPlayer($player_id, $type, clienttranslate( $message ), $message_args );
	}

	function stPickCardsInit() {
		$this->gamestate->setAllPlayersMultiactive();
	}

	function getFirstCard($cards) {
		foreach ($cards as $card) {
			return $card;
		}
		throw new BgaUserException( self::_("Player has no cards in their hand? This should not be possible.") );
	}

	function stResolveCards()
	{
		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );

		$redDiscardCards = $this->cards->getCardsInLocation( 'discard', $redPlayer );
		$redFirstCards = $this->cards->getCardsInLocation( 'firstPlayed', $redPlayer );
		$redSecondCards = $this->cards->getCardsInLocation( 'secondPlayed', $redPlayer );

		$blueDiscardCards = $this->cards->getCardsInLocation( 'discard', $bluePlayer );
		$blueFirstCards = $this->cards->getCardsInLocation( 'firstPlayed', $bluePlayer );
		$blueSecondCards = $this->cards->getCardsInLocation( 'secondPlayed', $bluePlayer );

		//
		// VALIDATE
		//

		if (count($redFirstCards) != 1) {
			throw new BgaUserException( self::_("Red player did not play a card in the first slot? This should not be possible.") );
		}
		if (count($redSecondCards) != 1) {
			throw new BgaUserException( self::_("Red player did not play a card in the second slot? This should not be possible.") );
		}
		if (count($redDiscardCards) > 2) {
			throw new BgaUserException( self::_("Red player has more than two cards in their discard pile? This should not be possible.") );
		}

		if (count($blueFirstCards) != 1) {
			throw new BgaUserException( self::_("Blue player did not play a card in the first slot? This should not be possible.") );
		}
		if (count($blueSecondCards) != 1) {
			throw new BgaUserException( self::_("Blue player did not play a card in the second slot? This should not be possible.") );
		}
		if (count($blueDiscardCards) > 2) {
			throw new BgaUserException( self::_("Blue player has more than two cards in their discard pile? This should not be possible.") );
		}

		self::notifyCardFlip('firstPlayed', $redPlayer, 97, $bluePlayer);
		self::notifyCardFlip('secondPlayed', $redPlayer, 97, $bluePlayer);
		self::notifyCardFlip('firstPlayed', $bluePlayer, 98, $redPlayer);
		self::notifyCardFlip('secondPlayed', $bluePlayer, 98, $redPlayer);

		self::resetAndNotify(
			$redPlayer,
			'playCards',
			'Moving picked cards to play area: red -> ' . self::getFirstCard($redFirstCards)['id'] . ' and ' . self::getFirstCard($redSecondCards)['id'] . ' blue -> ' . self::getFirstCard($blueFirstCards)['id'] . ' and ' . self::getFirstCard($blueSecondCards)['id'],
			array( ),
			false
		);

		self::resetAndNotify(
			$bluePlayer,
			'playCards',
			'Moving picked cards to play area',
			array( ),
			false
		);

		//
		// Resolve First Card
		//

		$isRedFirstTop = self::getGameStateValue( 'redFirstPlayedFlipped' ) == 0;
		$isBlueFirstTop = self::getGameStateValue( 'blueFirstPlayedFlipped' ) == 0;

		self::DoCards(
			$this->getFirstCard($redFirstCards)['id'],
			$isRedFirstTop,
			$this->getFirstCard($blueFirstCards)['id'],
			$isBlueFirstTop
		);

		// Notify

		self::resetAndNotify(
			$redPlayer,
			'cardsResolved',
			'First cards played resolved.',
			array( )
		);
		self::resetAndNotify(
			$bluePlayer,
			'cardsResolved',
			'First cards played resolved.',
			array( )
		);


		// Return the first played card to hand iff it is not a special card

		foreach ($redFirstCards as $card) {
			if ($card['id'] <= 10) {
				$this->cards->moveCard( $card['id'], 'hand', $redPlayer );
			}
			else {
				$this->cards->moveCard( $card['id'], 'discard', $redPlayer );
			}
		}

		foreach ($blueFirstCards as $card) {
			if ($card['id'] <= 10) {
				$this->cards->moveCard( $card['id'], 'hand', $bluePlayer );
			}
			else {
				$this->cards->moveCard( $card['id'], 'discard', $bluePlayer );
			}
		}

		// Notify

		self::resetAndNotify(
			$redPlayer,
			'cardsResolved',
			'First cards discarded.',
			array( )
		);
		self::resetAndNotify(
			$bluePlayer,
			'cardsResolved',
			'First cards discarded.',
			array( )
		);

		//
		// Resolve Second Card
		//

		$isRedSecondTop = self::getGameStateValue( 'redSecondPlayedFlipped' ) == 0;
		$isBlueSecondTop = self::getGameStateValue( 'blueSecondPlayedFlipped' ) == 0;

		self::DoCards(
			$this->getFirstCard($redSecondCards)['id'],
			$isRedSecondTop,
			$this->getFirstCard($blueSecondCards)['id'],
			$isBlueSecondTop
		);

		self::resetAndNotify(
			$redPlayer,
			'cardsResolved',
			'Second cards played resolved.',
			array( )
		);
		self::resetAndNotify(
			$bluePlayer,
			'cardsResolved',
			'Second cards played resolved.',
			array( )
		);

		// Return discarded cards to the player's hand and discard the second card

		foreach ($redDiscardCards as $card) {
			if ($card['id'] <= 10)
				$this->cards->moveCard( $card['id'], 'hand', $redPlayer );
		}
		foreach ($redSecondCards as $card)
			$this->cards->moveCard( $card['id'], 'discard', $redPlayer );

		foreach ($blueDiscardCards as $card) {
			if ($card['id'] <= 10)
				$this->cards->moveCard( $card['id'], 'hand', $bluePlayer );
		}
		foreach ($blueSecondCards as $card)
			$this->cards->moveCard( $card['id'], 'discard', $bluePlayer );

		// Notify all players about the card played
		self::resetAndNotify(
			$redPlayer,
			'cardsResolved',
			'Round has ended, resetting played cards',
			array( )
		);
		self::resetAndNotify(
			$bluePlayer,
			'cardsResolved',
			'Round has ended, resetting played cards',
			array( )
		);
		$this->gamestate->nextState( "pickCards" );
	}

	function DoCards($red_card, $redIsTop, $blue_card, $blueIsTop)
	{
		$red_card -= 1;
		$blue_card -= 1;

		$redStance = self::getGameStateValue( 'redSamuraiStance' );
		$blueStance = self::getGameStateValue( 'blueSamuraiStance' );
		$redPosition = self::getGameStateValue( 'redSamuraiPosition' );
		$bluePosition = self::getGameStateValue( 'blueSamuraiPosition' );
	
		//
		// MOVEMENT
		//

		// Charge: Move two spaces forward (-2 for red, +2 for blue)

		$isRedCharge = $red_card == 1 && $redIsTop;
		$isBlueCharge = $blue_card == 6 && $blueIsTop;

		if ($isRedCharge && $isBlueCharge)
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

		else if ($isRedCharge)
		{
			$redPosition = max($redPosition - 2, $bluePosition);
		}

		else if ($isBlueCharge)
		{
			$bluePosition = min($bluePosition + 2, $redPosition);
		}

		// Approach/Retreat: Move one space forward/backward (-1 for red, +1 for blue)

		$redMove = $red_card != 0 ?
			0 : // Not an Approach/Retreat card
			($redIsTop ? -1 : 1); // Approach : Retreat
		$blueMove = $blue_card != 5 ?
			0 : // Not an Approach/Retreat card
			($blueIsTop ? 1 : -1); // Approach : Retreat

		if ($redMove != 0 && $blueMove != 0)
		{
			if ($redStance == $blueStance) // Both move at the same time.
			{
				if ($redIsTop && $blueIsTop) // Both played Approach
				{
					if ($redPosition - $bluePosition <= 1) {} // There is not enough room to move
					else
					{
						$redPosition -= 1;
						$bluePosition += 1;
					}
				}
				else { // Otherwise, both players can move according to card without interference
					$redPosition = max(min($redPosition + $redMove, 5), 0);
					$bluePosition = max(min($bluePosition + $blueMove, 5), 0);
				}
			}

			else if ($redStance == 0) // Red Player moves first
			{
				$redPosition = max(min($redPosition + $redMove, 5), $bluePosition);
				$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 0);
			}

			else // Blue Player moves first
			{
				$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 0);
				$redPosition = max(min($redPosition + $redMove, 5), $bluePosition);
			}
		}

		else // Only one or the other is trying to move...
		{
			$redPosition = max(min($redPosition + $redMove, 5), $bluePosition);
			$bluePosition = max(min($bluePosition + $blueMove, $redPosition), 0);
		}

		// Change stance: Invert the current stance

		if ($red_card == 1 && !$redIsTop)
			$redStance = 1 - $redStance;
		if ($blue_card == 6 && !$blueIsTop)
			$blueStance = 1 - $blueStance;

		//
		// ATTACKS
		//

		$redHit = false;
		$blueHit = false;
		$distance = $redPosition - $bluePosition;

		// High Strike: If the opponent is two spaces away and in heaven stance, deal 1 damage

		if ($red_card == 2 && $redStance == 0 && $distance == 2)
			$redHit = true;
		if ($blue_card == 2 && $blueStance == 0 && $distance == 2)
			$blueHit = true;

		// Low Strike: If the opponent is one space away and in earth stance, deal 1 damage

		if ($red_card == 3 && $redStance == 1 && $distance == 1)
			$redHit = true;
		if ($blue_card == 3 && $blueStance == 1 && $distance == 1)
			$blueHit = true;

		// Balanced Strike: If the opponent is on the same space, deal 1 damage

		if ($red_card == 4 && $distance == 0)
			$redHit = true;
		if ($blue_card == 4 && $distance == 0)
			$blueHit = true;

		// Kesa Strike: If the opponent is zero or one space away and in heaven stance, deal 1 damage. Switch to earth stance.

		if ($red_card == 10)
		{
			if ($redStance == 0 && $distance <= 1)
				$redHit = true;
			$redStance = 1;
		}

		if ($blue_card == 10)
		{
			if ($blueStance == 0 && $distance <= 1)
				$blueHit = true;
			$blueStance = 1;
		}

		// Zan-Tetsu Strike: If the opponent is two or three spaces away and in earth stance, deal 1 damage. Switch to heaven stance.

		if ($red_card == 11)
		{
			if ($redStance == 1 && ($distance == 2 || $distance == 3))
				$redHit = true;
			$redStance = 0;
		}

		if ($blue_card == 11)
		{
			if ($blueStance == 1 && ($distance == 2 || $distance == 3))
				$blueHit = true;
			$blueStance = 0;
		}

		// Counterattack: If the opponent played a card that would hit you, deal 1 damage and negate the opponent's card

		if ($red_card == 12)
		{
			if ($blueHit)
			{
				$redHit = true;
				$blueHit = false;
			}
		}

		if ($blue_card == 12)
		{
			if ($redHit)
			{
				$blueHit = true;
				$redHit = false;
			}
		}

		//
		// Set state values
		//

		self::setGameStateValue( 'redSamuraiStance', $redStance );
		self::setGameStateValue( 'blueSamuraiStance', $blueStance );
		self::setGameStateValue( 'redSamuraiPosition', $redPosition );
		self::setGameStateValue( 'blueSamuraiPosition', $bluePosition );

		if ($redHit) self::incGameStateValue( 'redSamuraiDamage', 1 );
		if ($blueHit) self::incGameStateValue( 'blueSamuraiDamage', 1 );

		// TODO Game end
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

        if ($state['type'] === "multipleactiveplayer") {

			$hand = $this->cards->getCardsInLocation( 'hand', $active_player );

			// Pick two random cards to play
			$first_id = bga_rand(0, count($hand) - 1);
			$second_id = $first_id;

			while ($second_id == $first_id)
				$second_id = bga_rand(0, count($hand) - 1);

			// Randomly decide if the cards are flipped
			if (bga_rand(0, 1) == 1)
				$first_id = -1 * $first_id;
			if (bga_rand(0, 1) == 1)
				$second_id = -1 * $second_id;

			self::doPickedCards( $active_player, $first_id, $second_id );
            return;
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
