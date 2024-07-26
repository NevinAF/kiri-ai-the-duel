<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

require_once( APP_BASE_PATH."view/common/game.view.php" );

class view_kiriaitheduel_kiriaitheduel extends game_view
{
	protected function getGameName()
	{
		// Used for translations and stuff. Please do not modify.
		return "kiriaitheduel";
	}
	
	function build_page( $viewArgs )
	{
		/** @var kiriaitheduel $game */
		$game = $this->game;

		// Get players & players number
		$players = $game->loadPlayersBasicInfos();
		$players_nbr = count( $players );

		global $g_user;
		$current_player_id = $g_user->get_id();
		if (!array_key_exists($current_player_id, $players))
			$current_player_id = array_keys($players)[0];

		$opponent_player_id = null;
		foreach( $players as $player_id => $player )
			if( $player_id != $current_player_id )
				$opponent_player_id = $player_id;

		if ($players[$current_player_id]['player_color'] == 'c93941')
			$this->tpl['PLAYER_IMAGES'] = 'img/Red/';
		else
			$this->tpl['PLAYER_IMAGES'] = 'img/Blue/';

		/*********** Place your code below:  ************/

		$this->tpl['PLAYER_COLOR'] = $players[$current_player_id]['player_color'];
		$this->tpl['OPPONENT_COLOR'] = $players[$opponent_player_id]['player_color'];

		switch ($game->gamestate->table_globals[100])
		{
			case 1:
				$this->tpl['BATTLEFIELD_TYPE'] = 'standard-battlefield';
				break;
			case 2:
				$this->tpl['BATTLEFIELD_TYPE'] = 'advanced-battlefield';
				break;
			default:
				$this->tpl['BATTLEFIELD_TYPE'] = '';
				break;
		}


		/*
		
		// Examples: set the value of some element defined in your tpl file like this: {MY_VARIABLE_ELEMENT}

		// Display a specific number / string
		$this->tpl['MY_VARIABLE_ELEMENT'] = $number_to_display;

		// Display a string to be translated in all languages: 
		$this->tpl['MY_VARIABLE_ELEMENT'] = self::_("A string to be translated");

		// Display some HTML content of your own:
		$this->tpl['MY_VARIABLE_ELEMENT'] = self::raw( $some_html_code );
		
		*/
		
		/*
		
		// Example: display a specific HTML block for each player in this game.
		// (note: the block is defined in your .tpl file like this:
		//      <!-- BEGIN myblock --> 
		//          ... my HTML code ...
		//      <!-- END myblock --> 
		

		$this->page->begin_block( "kiriaitheduel_kiriaitheduel", "myblock" );
		foreach( $players as $player )
		{
			$this->page->insert_block( "myblock", array( 
													"PLAYER_NAME" => $player['player_name'],
													"SOME_VARIABLE" => $some_value
													...
													 ) );
		}
		
		*/



		/*********** Do not change anything below this line  ************/
	}
}
