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
  	
  	// TODO: defines your action entry points there


	public function pickedCards()
	{
		self::setAjaxMode();

		// Retrieve arguments
		// Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
		$arg1 = self::getArg( "firstCard", AT_int, true );
		$arg2 = self::getArg( "secondCard", AT_int, true );

		// Then, call the appropriate method in your game logic, like "playCard" or "myAction"
		$this->game->pickedCards( $arg1, $arg2 );

		self::ajaxResponse( );
	}

  }
  

