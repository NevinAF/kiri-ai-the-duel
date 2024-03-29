<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
 * -----
 */
  
  
  class action_kiriaitheduel extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "kiriaitheduel_kiriaitheduel";
            self::trace( "Complete reinitialization of board game" );
      }
  	}

	/** Confirms the Stands and Position of the player when starting a new game on the advanced battlefield. */
	public function confirmedStanceAndPosition()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "isHeavenStance", AT_bool, true );
		$arg2 = self::getArg( "position", AT_posint, true );
		$this->game->confirmedStanceAndPosition( $arg1, $arg2 );

		self::ajaxResponse( );
	}

	/** Player picks their first card. */
	public function pickedFirst()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "card", AT_posint, true );
		$this->game->pickedFirst( $arg1 );

		self::ajaxResponse( );
	}

	/** Player picks their second card. */
	public function pickedSecond()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "card", AT_posint, true );
		$this->game->pickedSecond( $arg1 );

		self::ajaxResponse( );
	}

	/** Player undoes their first card pick. */
	public function undoFirst()
	{
		self::setAjaxMode();

		$this->game->undoFirst( );

		self::ajaxResponse( );
	}

	/** Player undoes their second card pick. */
	public function undoSecond()
	{
		self::setAjaxMode();

		$this->game->undoSecond( );

		self::ajaxResponse( );
	}

	/** Player confirms the cards they have picked. */
	public function confirmedCards()
	{
		self::setAjaxMode();

		$this->game->confirmedCards( );

		self::ajaxResponse( );
	}

  }
  

