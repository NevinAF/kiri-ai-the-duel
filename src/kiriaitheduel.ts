/// <reference path="kiriaitheduel.d.ts" />
/// <reference path="cookbook/common.ts" />
/// <reference path="cookbook/nevinAF/playeractionqueue.ts" />
/// <reference path="cookbook/nevinAF/titleLocking.ts" />
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster - nevin.foster2@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
class KiriaiTheDuel extends GameguiCookbook
{
	constructor() {
		super();
		console.log('kiriaitheduel:', this);
	}

	isInitialized: boolean = false;

	//
	// #region Gamedata Wrappers
	//

	isRedPlayer(): boolean { return this.gamedatas.players[this.player_id].color == 'e54025'; }
	redPrefix(): string { return this.isRedPlayer() ? 'my' : 'opponent'; }
	bluePrefix(): string { return this.isRedPlayer() ? 'opponent' : 'my'; }
	redPosition(): number { return (this.gamedatas.battlefield >> 0) &0b1111; }
	redStance(): number { return (this.gamedatas.battlefield >> 4) &0b1; }
	bluePosition(): number { return (this.gamedatas.battlefield >> 5) &0b1111; }
	blueStance(): number { return (this.gamedatas.battlefield >> 9) &0b1; }
	redHit(): boolean { return ((this.gamedatas.battlefield >> 14) & 0b1) == 1; }
	blueHit(): boolean { return ((this.gamedatas.battlefield >> 15) & 0b1) == 1; }
	redPlayed0(): number { return (this.gamedatas.cards >> 0) & 0b1111; }
	redPlayed1(): number { return (this.gamedatas.cards >> 4) & 0b1111; }
	bluePlayed0(): number { return (this.gamedatas.cards >> 8) &0b1111; }
	bluePlayed1(): number { return (this.gamedatas.cards >> 12) &0b1111; }
	redDiscarded(): number { return (this.gamedatas.cards >> 16) &0b111; }
	blueDiscarded(): number { return (this.gamedatas.cards >> 19) &0b111; }
	redSpecialCard(): number  { return (this.gamedatas.cards >> 22) &0b11; }
	blueSpecialCard(): number  { return (this.gamedatas.cards >> 24) &0b11; }
	redSpecialPlayed(): boolean { return ((this.gamedatas.cards >> 26) &0b1) == 1; }
	blueSpecialPlayed(): boolean { return ((this.gamedatas.cards >> 27) & 0b1) == 1; }

	//
	// #endregion
	//

	//
	// #region Gamegui Methods
	// Setup and game state methods
	//

	setup(gamedatas: Gamedatas)
	{
		console.log( "Starting game setup", this.gamedatas );

		this.actionTitleLockingStrategy = 'actionbar';

		console.log( this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id], this.gamedatas.players[this.player_id].color, this.gamedatas.players[this.player_id].color == 'e54025');

		this.serverCards = gamedatas.cards;
		this.predictionModifiers = [];

		// Setup game notifications to handle (see "setupNotifications" method below)
		this.setupNotifications();

		const placeCard = (id: string, target: string, offset: number) => {
			if ($(target) == null) {
				console.error('Div "' + target + '" does not exist.');
				return;
			}
			const div = dojo.place(this.format_block('jstpl_card', {
				src: g_gamethemeurl + 'img/placeholderCards.jpg',
				x: offset / 0.13,
				id: id
			}), target);
			return div;
		};

		for (let i = 0; i < 5; i++)
		{
			placeCard("redHand_" + i, this.redPrefix() + 'Hand_' + i, i);
			placeCard("blueHand_" + i, this.bluePrefix() + 'Hand_' + i, i + 5);
		}

		placeCard("redHand_" + 5, this.redPrefix() + 'Hand_' + 5, 13);
		placeCard("blueHand_" + 5, this.bluePrefix() + 'Hand_' + 5, 13);

		for (let i = 0; i < 2; i++)
		{
			let div: HTMLElement;

			div = placeCard("redPlayed_" + i, this.redPrefix() + 'Played_' + i, 13);
			div = placeCard("bluePlayed_" + i, this.bluePrefix() + 'Played_' + i, 13);

			$('redPlayed_' + i).style.display = 'none';
			$('bluePlayed_' + i).style.display = 'none';
		}

		for (let id of ['red_samurai', 'blue_samurai'])
			dojo.place(this.format_block('jstpl_card', {
				src: g_gamethemeurl + 'img/placeholder_SamuraiCards.jpg',
				x: 0,
				id: id + '_card'
			}), id);

		//TODO FIX for advanced field
		const battlefieldSize = 6;
		for (let i = 1; i <= battlefieldSize; i++)
		{
			dojo.place(this.format_block('jstpl_field_position', {
				id: i,
			}), $('battlefield'));
		}

		if (!this.isRedPlayer())
			$('battlefield').style.flexDirection = 'column-reverse';

		this.instantMatch();

		for (let i = 0; i < 6; i++)
		{
			let index = i + 1;
			dojo.connect($('myHand_' + i), 'onclick', this, e => this.onHandCardClick(e, index));
		}

		for (let i = 0; i < 2; i++) {
			let first = i == 0;
			dojo.connect($('myPlayed_' + i), 'onclick', this, e => this.returnCardToHand(e, first));
		}

		this.isInitialized = true;

		console.log( "Ending game setup" );
	}

	onEnteringState(stateName: GameStateName, args: CurrentStateArgs): void
	{
		console.log( 'Entering state: '+ stateName, args );
		
		switch( stateName )
		{
		
		/* Example:
		
		case 'myGameState':
		
			// Show some HTML block at this game state
			dojo.style( 'my_html_block_id', 'display', 'block' );
			
			break;
		*/
		
		
		default:
			break;
		}
	}

	onLeavingState(stateName: GameStateName): void
	{
		console.log( 'Leaving state: '+ stateName );
		
		switch( stateName )
		{
		default:
			break;
		}
	}

	onUpdateActionButtons(stateName: GameStateName, args: AnyGameStateArgs | null): void
	{
		console.log( 'onUpdateActionButtons: '+stateName, args );

		if( this.isCurrentPlayerActive() )
		{
			switch( stateName )
			{
			case "pickCards":

				this.addActionButton('confirmSelectionButton', _('Confirm'), e => {
					console.log('Confirming selection', e);
					
					if (this.isRedPlayer()) {
						if (this.redPlayed0() == 0 && this.redPlayed1() == 0) {
							return;
						}
					}
					else {
						if (this.bluePlayed0() == 0 && this.bluePlayed1() == 0) {
							return;
						}
					}
					// This makes sure that this action button is removed from the queue.
					this.lockTitleWithStatus(_('Sending moves to server...')); 
					this.enqueueAjaxAction({
						action: 'confirmedCards',
						args: {}
					});
				});
				break;
			}
		}
	}

	//
	// #endregion
	//

	//
	// #region Utility methods
	//

	resizeTimeout: number | null = null;
	onScreenWidthChange = () => {
		if (this.isInitialized) {
			if (this.resizeTimeout !== null) {
				clearTimeout(this.resizeTimeout);
			}

			this.resizeTimeout = setTimeout(() => {
				this.instantMatch();
				this.resizeTimeout = null;
			}, 10); // delay in milliseconds

			this.instantMatch();
		}
	}

	instantMatch() {
		// print all fields
		console.log('instantMatch: ', {
			isRedPlayer: this.isRedPlayer(),
			redPrefix: this.redPrefix(),
			bluePrefix: this.bluePrefix(),
			redPosition: this.redPosition(),
			redStance: this.redStance(),
			bluePosition: this.bluePosition(),
			blueStance: this.blueStance(),
			redPlayed0: this.redPlayed0(),
			redPlayed1: this.redPlayed1(),
			bluePlayed0: this.bluePlayed0(),
			bluePlayed1: this.bluePlayed1(),
			redDiscarded: this.redDiscarded(),
			blueDiscarded: this.blueDiscarded(),
			redSpecialCard: this.redSpecialCard(),
			blueSpecialCard: this.blueSpecialCard(),
			redSpecialPlayed: this.redSpecialPlayed(),
			blueSpecialPlayed: this.blueSpecialPlayed()
		});

		const updateCard = (target: HTMLElement, card: number, isRed: boolean) => {
			if (card == 0) {
				target.style.display = 'none';
				return;
			}

			target.style.display = 'block';
			target.classList.remove('bottomPicked');

			let offset;
			if (card <= 5) offset = (isRed ? card : card + 5) - 1;
			else if (card <= 7)
			{
				offset = (isRed ? card - 5 : card) - 1;
				target.classList.add('bottomPicked');
			}
			else if (card == 8) offset = isRed ? this.redSpecialCard() + 9 : this.blueSpecialCard() + 9;
			else offset = 13;

			target.style.objectPosition = (offset / 0.13) + '% 0px';
		};

		updateCard($('redPlayed_0'), this.redPlayed0(), true);
		updateCard($('redPlayed_1'), this.redPlayed1(), true);
		updateCard($('bluePlayed_0'), this.bluePlayed0(), false);
		updateCard($('bluePlayed_1'), this.bluePlayed1(), false);

		// Add class to the discarded card:

		const playedToHand = (index: number) => {
			if (index == 0) return -1;
			if (index <= 5) return index - 1;
			if (index <= 7) return index - 6;
			if (index == 8) return 5;
			return -1;
		}

		let redPlayed: number[] = [];
		let bluePlayed: number[] = [];
		redPlayed.push(playedToHand(this.redPlayed0()));
		redPlayed.push(playedToHand(this.redPlayed1()));
		bluePlayed.push(playedToHand(this.bluePlayed0()));
		bluePlayed.push(playedToHand(this.bluePlayed1()));

		for (let i = 0; i < 6; i++) {
			if (i < 5)
			{
				if (this.redDiscarded() - 1 == i) $('redHand_' + i).parentElement.classList.add('discarded');
				else  $('redHand_' + i).parentElement.classList.remove('discarded');

				if (this.blueDiscarded() - 1 == i) $('blueHand_' + i).parentElement.classList.add('discarded');
				else  $('blueHand_' + i).parentElement.classList.remove('discarded');
			}

			if (redPlayed.includes(i)) $('redHand_' + i).parentElement.classList.add('played');
			else  $('redHand_' + i).parentElement.classList.remove('played');

			if (bluePlayed.includes(i)) $('blueHand_' + i).parentElement.classList.add('played');
			else  $('blueHand_' + i).parentElement.classList.remove('played');
		}

		// Check if the special card in the hand needs to be shown and or disabled
		$('redHand_5').style.objectPosition = ((
			this.redSpecialCard() == 0 ? 13 : this.redSpecialCard() + 9
		) / 0.13) + '% 0px';
		if (this.redSpecialPlayed()) $('redHand_5').parentElement.classList.add('discarded');
		else $('redHand_5').parentElement.classList.remove('discarded');

		$('blueHand_5').style.objectPosition = ((
			this.blueSpecialCard() == 0 ? 13 : this.blueSpecialCard() + 9
		) / 0.13) + '% 0px';
		if (this.blueSpecialPlayed()) $('blueHand_5').parentElement.classList.add('discarded');
		else $('blueHand_5').parentElement.classList.remove('discarded');

		// Set the positions and stance

		let redRot = this.redStance() == 0 ? 'rotate(-45deg)' : 'rotate(135deg)';
		let blueRot = this.blueStance() == 0 ? 'rotate(-45deg)' : 'rotate(135deg)';

		if (!this.isRedPlayer()) {
			$('red_samurai').style.transform = 'translate(-95%, -11.5%) ' + redRot;
			$('blue_samurai').style.transform = 'translate(95%, 11.5%) ' + blueRot;
		} else {
			$('red_samurai').style.transform = 'translate(95%, 11.5%) scale(-1, -1) ' + redRot;
			$('blue_samurai').style.transform = 'translate(-95%, -11.5%) scale(-1, -1) ' + blueRot;
		}

		if ($('red_samurai_field_position_' + this.redPosition()))
			this.placeOnObject('red_samurai_offset', 'red_samurai_field_position_' + this.redPosition());
		if ($('blue_samurai_field_position_' + this.bluePosition()))
			this.placeOnObject('blue_samurai_offset', 'blue_samurai_field_position_' + this.bluePosition());


		let redSprite = !this.redHit() ? 0 : 2;
		let blueSprite = !this.blueHit() ? 1 : 3;
		$('red_samurai_card').style.objectPosition = (redSprite / 0.03) + '% 0px';
		$('blue_samurai_card').style.objectPosition = (blueSprite / 0.03) + '% 0px';

		// Set the width of the samuira to 30% the width of the battlefield
		let battlefield = $('battlefield');
		let battlefieldWidth = battlefield.getBoundingClientRect().width;
		let samuraiWidth = battlefieldWidth * 0.24;

		dojo.style($('red_samurai'), 'width', samuraiWidth + 'px');
		dojo.style($('blue_samurai'), 'width', samuraiWidth + 'px');
	}

	//
	// #endregion
	//

	//
	// #region Action Queue + Predictions
	// Predictions are used to simulate the state of the game before the action is acknowledged by the server.
	//

	serverCards: number;
	predictionKey: number = 0;
	predictionModifiers: { key: number, func: ((cards: number) => number) }[];

	addPredictionModifier(func: ((cards: number) => number)):
		() => void
	{
		let key = this.predictionKey++;
		this.predictionModifiers.push({ key, func });
		this.updateCardsWithPredictions();

		// This is called when the action fails or is accepted.
		return () => {
			this.predictionModifiers = this.predictionModifiers.filter((mod) => mod.key != key);
			this.updateCardsWithPredictions();
		};
	}

	updateCardsWithPredictions()
	{
		let cards = this.serverCards;
		for (let mod of this.predictionModifiers) {
			// Print cards as binary
			console.log('cards:', cards.toString(2));
			cards = mod.func(cards);
		}
			console.log('cards:', cards.toString(2));
			this.gamedatas.cards = cards;
		this.instantMatch();
	}

	//
	// #endregion
	//

	//
	// #region Player's action
	//

	onHandCardClick = ( evt: MouseEvent, index: number ) =>
	{
		evt.preventDefault();

		if (this.actionQueue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
			console.log('Already confirmed cards! There is no backing out now!');
			return;
		}

		if (index == (this.isRedPlayer() ? this.redDiscarded() : this.blueDiscarded()))
		{
			console.log('This card has already been discarded!');
			return;
		}
		
		if (index == 6 && (this.isRedPlayer() ? this.redSpecialPlayed() : this.blueSpecialPlayed()))
		{
			console.log('Thee special card has already been played!');
			return;
		}

		let first = this.isRedPlayer() ? this.redPlayed0() : this.bluePlayed0();
		let second = this.isRedPlayer() ? this.redPlayed1() : this.bluePlayed1();
		let fixedIndex = index == 6 ? 8 : index;

		if ((index == 1 && first == 6) ||
			(index == 2 && first == 7) ||
			fixedIndex == first
		) {
			this.returnCardToHand(null, true);
			return;
		}

		if ((index == 1 && second == 6) ||
			(index == 2 && second == 7) ||
			fixedIndex == second
		) {
			this.returnCardToHand(null, false);
			return;
		}

		if (first != 0 && second != 0) {
			console.log('Both cards have already been played!');
			return;
		}

		let target = evt.target as Element;

		// we need to know if the top half or bottom half was clicked
		let rect = target.getBoundingClientRect();
		let y = evt.clientY - rect.top;
		let clickedTopHalf = y < rect.height / 2;

		if (!clickedTopHalf && (index == 1 || index == 2))
			index += 5;
		else if (index == 6)
			index = 8;

		let action: keyof PlayerActions;
		let indexOffset: number;
		if (this.isRedPlayer()) {
			if (this.redPlayed0() == 0) {
				action = 'pickedFirst';
				indexOffset = 0;
			}
			else if (this.redPlayed1() == 0) {
				action = 'pickedSecond';
				indexOffset = 4;
			}
		}
		else {
			if (this.bluePlayed0() == 0){
				action = 'pickedFirst';
				indexOffset = 8;
			}
			else if (this.bluePlayed1() == 0) {
				action = 'pickedSecond';
				indexOffset = 12;
			}
		}

		const callback = this.addPredictionModifier((cards) => {
			cards &= ~(0b1111 << indexOffset);
			return cards | (index & 0b1111) << indexOffset;
		});

		this.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
		this.enqueueAjaxAction({
			action,
			args: { card: index },
			callback
		});
	}

	returnCardToHand = (evt: MouseEvent | null, first: boolean) =>
	{
		evt?.preventDefault();

		if (this.actionQueue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
			console.log('Already confirmed cards! There is no backing out now!');
			return;
		}

		if (first)
		{
			// Still waiting on the first card that was picked to be sent to server...
			if (this.filterActionQueue('pickedFirst')) {
				return; // Removing the play action is the same as undoing it.
			}
		}
		else {
			// Still waiting on the second card that was picked to be sent to server...
			if (this.filterActionQueue('pickedSecond')) {
				return; // Removing the play action is the same as undoing it.
			}
		}

		let indexOffset: number;
		if (this.isRedPlayer()) {
			indexOffset = first ? 0 : 4;
		}
		else {
			indexOffset = first ? 8 : 12;
		}

		const callback = this.addPredictionModifier((cards) => {
			return cards & ~(0b1111 << indexOffset);
		});

		this.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
		this.enqueueAjaxAction({
			action: first ? "undoFirst" : "undoSecond",
			args: {},
			callback
		});
	}

	//
	// #endregion
	//

	//
	// #region Notifications
	// Server acknowledgements and game state updates
	//

	setupNotifications()
	{
		console.log( 'notifications subscriptions setup' );

		this.subscribeNotif('battlefield setup', this.notif_instantMatch);
		this.subscribeNotif('played card',  this.notif_instantMatch);
		this.subscribeNotif('undo card',  this.notif_instantMatch);
		this.subscribeNotif('before first resolve',  this.notif_instantMatch);
		this.subscribeNotif('before second resolve',  this.notif_instantMatch);
		this.subscribeNotif('after resolve',  this.notif_instantMatch);
		this.subscribeNotif('player(s) charged',  this.notif_instantMatch);
		this.subscribeNotif('player(s) moved',  this.notif_instantMatch);
		this.subscribeNotif('player(s) changed stance',  this.notif_instantMatch);
		this.subscribeNotif('player(s) attacked',  this.notif_instantMatch);
		this.subscribeNotif('player(s) hit',  this.notif_instantMatch);
		this.subscribeNotif('log', a => console.log('log:', a));

		this.notifqueue.setSynchronous( 'battlefield setup', 1000 );
		// this.notifqueue.setSynchronous( 'played card', 1000 );
		// this.notifqueue.setSynchronous( 'undo card', 1000 );
		this.notifqueue.setSynchronous( 'before first resolve', 1000 );
		this.notifqueue.setSynchronous( 'before second resolve', 1000 );
		this.notifqueue.setSynchronous( 'after resolve', 1000 );
		this.notifqueue.setSynchronous( 'player(s) charged', 1000 );
		this.notifqueue.setSynchronous( 'player(s) moved', 1000 );
		this.notifqueue.setSynchronous( 'player(s) changed stance', 1000 );
		this.notifqueue.setSynchronous( 'player(s) attacked', 1000 );
		this.notifqueue.setSynchronous( 'player(s) hit', 1000 );
	}

	notif_instantMatch = (notif: Notif<GameStateData>) =>
	{
		console.log('notif_placeAllCards', notif);
		this.gamedatas.battlefield = notif.args.battlefield;
		this.serverCards = notif.args.cards;
		this.updateCardsWithPredictions();
		this.instantMatch();
	}

	//
	// #endregion
	//
}
