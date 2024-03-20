<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * kiriaitheduel.action.php
 *
 * KiriaiTheDuel main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/kiriaitheduel/kiriaitheduel/myAction.html", ...)
 *
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

	public function confirmedStanceAndPosition()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "isHeavenStance", AT_bool, true );
		$arg2 = self::getArg( "position", AT_posint, true );
		$this->game->confirmedStanceAndPosition( $arg1, $arg2 );

		self::ajaxResponse( );
	}

	public function pickedFirst()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "card", AT_posint, true );
		$this->game->pickedFirst( $arg1 );

		self::ajaxResponse( );
	}

	public function pickedSecond()
	{
		self::setAjaxMode();

		$arg1 = self::getArg( "card", AT_posint, true );
		$this->game->pickedSecond( $arg1 );

		self::ajaxResponse( );
	}

	public function undoFirst()
	{
		self::setAjaxMode();

		$this->game->undoFirst( );

		self::ajaxResponse( );
	}

	public function undoSecond()
	{
		self::setAjaxMode();

		$this->game->undoSecond( );

		self::ajaxResponse( );
	}

	public function confirmedCards()
	{
		self::setAjaxMode();

		$this->game->confirmedCards( );

		self::ajaxResponse( );
	}

  }
  

