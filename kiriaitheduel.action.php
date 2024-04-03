<?php
/**
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. ANY CHANGES MADE DIRECTLY MAY BE OVERWRITTEN.
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

class action_kiriaitheduel extends APP_GameAction
{
	/** @var kiriaitheduel $game */
	protected $game; // Enforces functions exist on Table class

	// Constructor: please do not modify
	public function __default()
	{
		if (self::isArg('notifwindow')) {
			$this->view = "common_notifwindow";
			$this->viewArgs['table'] = self::getArg("table", AT_posint, true);
		} else {
			$this->view = "kiriaitheduel_kiriaitheduel";
			self::trace("Complete reinitialization of board game");
		}
	}

	public function confirmedStanceAndPosition() {
		self::setAjaxMode();

		/** @var bool $isHeavenStance */
		$isHeavenStance = self::getArg('isHeavenStance', AT_bool, true);
		/** @var int $position */
		$position = self::getArg('position', AT_int, true);

		$this->game->confirmedStanceAndPosition( $isHeavenStance, $position );

		self::ajaxResponse();
	}

	public function pickedFirst() {
		self::setAjaxMode();

		/** @var int $card_id */
		$card_id = self::getArg('card_id', AT_int, true);

		$this->game->pickedFirst( $card_id );

		self::ajaxResponse();
	}

	public function pickedSecond() {
		self::setAjaxMode();

		/** @var int $card_id */
		$card_id = self::getArg('card_id', AT_int, true);

		$this->game->pickedSecond( $card_id );

		self::ajaxResponse();
	}

	public function undoFirst() {
		self::setAjaxMode();

		$this->game->undoFirst(  );

		self::ajaxResponse();
	}

	public function undoSecond() {
		self::setAjaxMode();

		$this->game->undoSecond(  );

		self::ajaxResponse();
	}

	public function confirmedCards() {
		self::setAjaxMode();

		$this->game->confirmedCards(  );

		self::ajaxResponse();
	}
}