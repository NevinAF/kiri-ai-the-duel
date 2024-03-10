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
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

		// TODO: Boolean for if the game uses the standard or advanced battle field

        // Init global values with their initial values
        self::setGameStateInitialValue( 'redSamuraiDamage', 0 );
		self::setGameStateInitialValue( 'blueSamuraiDamage', 0 );
		self::setGameStateInitialValue( 'redSamuraiPosition', 0 ); // Standard, at the end
		self::setGameStateInitialValue( 'blueSamuraiPosition', 5 ); // Standard, at the end
		self::setGameStateInitialValue( 'redSamuraiStance', 0 ); // 0 = Heaven Stance, 1 = Earth Stance
		self::setGameStateInitialValue( 'blueSamuraiStance', 0 ); // 0 = Heaven Stance, 1 = Earth Stance

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

		// Initialize players hands (0-4 and 5-9)
		for ($i = 0; $i < 5; $i++) {
			$redCards[] = array('type' => $i, 'type_arg' => 0, 'nbr' => 1 );
			$blueCards[] = array('type' => $i + 5, 'type_arg' => 1, 'nbr' => 1 );
		}

		// Initialize Special cards (10-12)
		for ($i = 10; $i < 13; $i++) {
			$deckCards[] = array('type' => $i, 'type_arg' => 3, 'nbr' => 1);
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

        $result['redSamuraiDamage'] = self::getGameStateValue( 'redSamuraiDamage' );
		$result['blueSamuraiDamage'] = self::getGameStateValue( 'blueSamuraiDamage' );
		$result['redSamuraiPosition'] = self::getGameStateValue( 'redSamuraiPosition' );
		$result['blueSamuraiPosition'] = self::getGameStateValue( 'blueSamuraiPosition' );
		$result['redSamuraiStance'] = self::getGameStateValue( 'redSamuraiStance' );
		$result['blueSamuraiStance'] = self::getGameStateValue( 'blueSamuraiStance' );

		$result['cards'] = self::getCurrentCards(self::getCurrentPlayerId());

  
        return $result;
    }

	protected function getCurrentCards($current_player_id)
	{
        $result = array();

		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );


		$result['redHand'] = self::getCardIdsInLocation('hand', $redPlayer, $current_player_id == $redPlayer ? -1 : 97);
		$result['blueHand'] = self::getCardIdsInLocation('hand', $bluePlayer, $current_player_id == $bluePlayer ? -1 : 98);

		$result['redPlayed']= array(
			'0' => self::getCardIdInLocation('firstPlayed', $redPlayer),
			'1' => self::getCardIdInLocation('secondPlayed', $redPlayer)
		);
		$result['bluePlayed']= array(
			'0' => self::getCardIdInLocation('firstPlayed', $bluePlayer),
			'1' => self::getCardIdInLocation('secondPlayed', $bluePlayer)
		);

		$result['redDiscard'] = self::getCardIdsInLocation('discard', $redPlayer);
		$result['blueDiscard'] = self::getCardIdsInLocation('discard', $bluePlayer);

		$result['deck'] = self::getCardIdsInLocation( 'deck', -1, 99 );

		return $result;
	}

	protected function getCardIdsInLocation($location, $player_id, $hideSpecialAs = -1)
	{
		$cards = $this->cards->getCardsInLocation( $location, $player_id );
		$result = array();
		foreach ($cards as $card)
		{
			if ($card['type'] > 4 && $hideSpecialAs != -1)
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

		$player_id = $this->getCurrentPlayerId();

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
			// Flip over any cards that are special in the play area
			$redPlayer = self::getGameStateValue( 'redPlayer' );
			$bluePlayer = self::getGameStateValue( 'bluePlayer' );

			self::notifyCardFlip('firstPlayed', $redPlayer, 97, $bluePlayer);
			self::notifyCardFlip('secondPlayed', $redPlayer, 97, $bluePlayer);
			self::notifyCardFlip('firstPlayed', $bluePlayer, 98, $redPlayer);
			self::notifyCardFlip('secondPlayed', $bluePlayer, 98, $redPlayer);

			self::resetAndNotify(
				$redPlayer,
				'',
				array( )
			);

			self::resetAndNotify(
				$bluePlayer,
				'',
				array( )
			);
		}
    }

	protected function notifyCardFlip($location, $player_id, $pseudoId, $otherPlayerId)
	{
		$cards = $this->cards->getCardsInLocation( $location, $player_id );

		foreach ($cards as $card) {
			if ($card['type'] > 4) {
				$players = self::loadPlayersBasicInfos();
				self::notifyPlayer( $otherPlayerId, "cardFlipped", clienttranslate( 'The ${card_name} special card was played by ${player_name' ), array(
					'player_id' => $player_id,
					'player_name' => $players[$player_id]['player_name'],
					'back_card_id' => $pseudoId,
					'card_id' => $card['id'],
					'card_name' => $this->cardNames[$card['type']]
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
			'You started the game with the ${card_name} special card',
			array( 
				'card' => $card,
				'card_name' => $this->cardNames[$card['type']]
			)
		);
	}

	function resetAndNotify($player_id, $message, $message_args)
	{
		$message_args['cards'] = self::getCurrentCards($player_id);
		self::notifyPlayer($player_id, "placeAllCards", clienttranslate( $message ), $message_args );
	}

	function stPickCardsInit() {
		$this->gamestate->setAllPlayersMultiactive();
	}

	function stResolveCards()
	{
		$redPlayer = self::getGameStateValue( 'redPlayer' );
		$bluePlayer = self::getGameStateValue( 'bluePlayer' );

		// TODO: GAME LOGIC??

		// -

		// Move any non special cards in their discard pile to their hand (should always be one or zero)
		// Move the first card back to the player's hand and the second card to the discard pile
		// If the first card is a special card, move it to the discard pile
		self::resetPlayerCards($redPlayer);
		self::resetPlayerCards($bluePlayer);

		// Notify all players about the card played
		self::resetAndNotify(
			$redPlayer,
			'Round has ended, resetting played cards',
			array( )
		);
		self::resetAndNotify(
			$bluePlayer,
			'Round has ended, resetting played cards',
			array( )
		);
		$this->gamestate->nextState( "pickCards" );
	}

	function resetPlayerCards($player_id)
	{
		$discardCards = $this->cards->getCardsInLocation( 'discard', $player_id );
		$firstCards = $this->cards->getCardsInLocation( 'firstPlayed', $player_id );
		$secondCards = $this->cards->getCardsInLocation( 'secondPlayed', $player_id );

		// VALIDATE
		if (count($firstCards) != 1) {
			throw new BgaUserException( self::_("Player did not play a card in the first slot? This should not be possible.") );
		}
		if (count($secondCards) != 1) {
			throw new BgaUserException( self::_("Player did not play a card in the second slot? This should not be possible.") );
		}
		if (count($discardCards) > 2) {
			throw new BgaUserException( self::_("Player has more than two cards in their discard pile? This should not be possible.") );
		}

		foreach ($discardCards as $card) {
			if ($card['type'] <= 4)
				$this->cards->moveCard( $card['id'], 'hand', $player_id );
		}

		foreach ($firstCards as $card) {
			if ($card['type'] <= 4) {
				$this->cards->moveCard( $card['id'], 'hand', $player_id );
			}
			else {
				$this->cards->moveCard( $card['id'], 'discard', $player_id );
			}
		}

		foreach ($secondCards as $card)
			$this->cards->moveCard( $card['id'], 'discard', $player_id );
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
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
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
