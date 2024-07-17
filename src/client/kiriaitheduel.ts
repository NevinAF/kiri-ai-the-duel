/// <amd-module name="bgagame/kiriaitheduel"/>
/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
import dojo = require('dojo');
import Gamegui = require('ebg/core/gamegui');
import "ebg/counter";

import CommonMixin = require('cookbook/common');
import TitleLockingMixin = require('cookbook/nevinaf/titlelocking');
import PlayerActionQueue = require('cookbook/nevinaf/playeractionqueue');
import ConfirmationTimeout = require('cookbook/nevinaf/confirmationtimeout');

declare function $<E extends Element>(id: string | E): E;

/** The root for all of your game code. */
class KiriaiTheDuel extends TitleLockingMixin(CommonMixin(Gamegui))
{
	/** @gameSpecific See {@link Gamegui.setup} for more information. */
	isInitialized: boolean = false;
	color_path: string = 'Red';
	actionQueue = new PlayerActionQueue(this);
	confirmationTimeout = new ConfirmationTimeout('leftright_page_wrapper');

	special_translations: string[] = [
		_('There are three Special Attack Cards, one dealt to each player at the start of the game. Special Attack Cards are used once per game and discarded after use.'),
		_('<b>Kesa Strike</b> - An attack empowered by inner peace that hits two spaces. Hits the space the attacker is in and also one space in front. Successful only while in the Heaven Stance. After attacking, the samurai automatically switches stances into the Earth Stance.'),
		_('<b>Zan-Tetsu Strike</b> - An iron-splitting attack that hits two spaces. Hits the spaces two and three spaces in front of the attacker. Successful only while in the Earth Stance. After attacking, the samurai automatically switches stances into the Heaven Stance.'),
		_('<b>Counterattack</b> - This card cancels a successful attack or special attack from the opponent and then deals damage. If the opponent does not hit with an attack or special attack during the same action when Counterattack is played, then Counterattack does nothing and is discarded as normal.')
	];

	card_translations: [string,string][] = [
		[_('<b>Approach</b> (top) - Player moves their samurai one battlefield space toward their opponent. <b>Retreat</b> (bottom) - Player moves their samurai one battlefield space away from their opponent.'), _('Click the top or bottom play/return this card.')],
		[_('<b>Charge</b> (top) - Player moves their samurai two battlefield spaces toward their opponent. <b>Change Stance</b> (bottom) - There are two stances: Heaven and Earth. Player changes the stance of the samurai by rotating the Samurai Card on the same space. The samurai\'s current stance must match the stance on an Attack Card for it to be successful'), _('Click the top or bottom play/return this card.')],
		[_('<b>High Strike</b> - A long-distance slash from above to slice through the opponent like bamboo. Successful only while in the Heaven Stance. Hits the space located two spaces in front of the attacker.'), _('Click to play/return this card.')],
		[_('<b>Low Strike</b> - A rising slash delivered from a low sword position. Successful only while in the Earth Stance. Hits the space immediately in front of the attacker.'), _('Click to play/return this card.')],
		[_('<b>Balanced Strike</b> - A sideways slash that is successful from both stances. Hits if both the attacker and opponent are in the same space'), _('Click to play/return this card.')],
		[_('Waiting to draw starting cards...'), _('Click to play/return this card.')]
	];

	//
	// #region Gamedata Wrappers
	//

	playerPosition(): number { return (this.gamedatas.player_state >> 0) & 0b1111; }
	playerStance(): number { return (this.gamedatas.player_state >> 4) & 0b1; }
	playerHit(): boolean { return ((this.gamedatas.player_state >> 5) & 0b1) == 1; }
	playerPlayed0(): number { return (this.gamedatas.player_state >> 6) & 0b1111; }
	playerPlayed1(): number { return (this.gamedatas.player_state >> 10) & 0b1111; }
	playerDiscarded(): number { return (this.gamedatas.player_state >> 14) & 0b111; }
	playerSpecialCard(): number { return (this.gamedatas.player_state >> 17) & 0b11; }
	playerSpecialPlayed(): boolean { return ((this.gamedatas.player_state >> 19) & 0b1) == 1; }

	opponentPosition(): number { return (this.gamedatas.opponent_state >> 0) & 0b1111; }
	opponentStance(): number { return (this.gamedatas.opponent_state >> 4) & 0b1; }
	opponentHit(): boolean { return ((this.gamedatas.opponent_state >> 5) & 0b1) == 1; }
	opponentPlayed0(): number { return (this.gamedatas.opponent_state >> 6) & 0b1111; }
	opponentPlayed1(): number { return (this.gamedatas.opponent_state >> 10) & 0b1111; }
	opponentDiscarded(): number { return (this.gamedatas.opponent_state >> 14) & 0b111; }
	opponentSpecialCard(): number { return (this.gamedatas.opponent_state >> 17) & 0b11; }
	opponentSpecialPlayed(): boolean { return ((this.gamedatas.opponent_state >> 19) & 0b1) == 1; }

	//
	// #endregion
	//

	//
	// #region Document/URL Utilities
	//

	formatSVGURL(name: string) { return `${g_gamethemeurl}img/${this.color_path}/${name}.svg` }

	stanceURL(player: boolean) {
		return this.formatSVGURL(`${player ? 'player' : 'opponent'}-stance-${(player ? this.playerHit() : this.opponentHit()) ? 'damaged' : 'healthy'}`);
	}

	specialCardURL(player: boolean) {
		switch (player ? this.playerSpecialCard() : this.opponentSpecialCard()) {
			case 1: return this.formatSVGURL('special-kesa');
			case 2: return this.formatSVGURL('special-zantetsu');
			case 3: return this.formatSVGURL('special-counter');
			default: return this.formatSVGURL('card-back');
		}
	}

	setCardSlot(slot: string | Element, src: string | null) {
		if (typeof slot == 'string')
			slot = $(slot) as Element;

		if (slot instanceof HTMLElement && slot.children.length > 0 && slot.children[0] instanceof HTMLImageElement)
		{
			(slot.children[0] as HTMLImageElement).style.display = src ? 'block' : 'none';
			if (src != null)
				(slot.children[0] as HTMLImageElement).src = src;
			return;
		}

		console.error('Invalid slot: ', slot);
	}

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

		this.actionQueue.actionTitleLockingStrategy = 'actionbar';

		console.log( this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id] );

		if (this.gamedatas.players[this.player_id]!.color == '4e93a6')
			this.color_path = 'Blue';

		this.server_player_state = gamedatas.player_state;


		// Setup game notifications to handle (see "setupNotifications" method below)
		this.setupNotifications();

		// Add tooltips to the cards
		this.addTooltip('battlefield', _('Each white square on the battlefield card represents a space for the Samurai Cards. Each Samurai Card will always be located on one of the spaces and can share a space. Samurai Cards cannot pass each other.'), '');
		this.addTooltip('player_samurai', _(`This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged.`), '');
		this.addTooltip('opponent_samurai', _(`This Samurai Card shows your opponents samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged.`), '');
		this.addTooltip('player_played_0', _(`This spot show's your first action for the turn.`), _('Click to return the card to your hand.'));
		this.addTooltip('player_played_1', _(`This spot show's your second action for the turn. You will not be able to play the card in this slot next round.`), _('Click to return the card to your hand.'));
		this.addTooltip('opponent_played_0', _(`This spot show's your opponent's first action for the turn.`), '');
		this.addTooltip('opponent_played_1', _(`This spot show's your opponent's second action for the turn. They will not be able to play the card in this slot next round.`), '');

		this.addTooltip('discard_icon', _('This icon shows the last card that was discarded by the opponent.'), _('Hover to show opponent\'s hand.'));
		this.addTooltip('special_icon', _('This icon shows if your opponent still has a hidden special card.'), _('Hover to show opponent\'s hand.'));
		

		this.instantMatch();

		for (let i = 0; i < 6; i++)
		{
			let index = i + 1;
			dojo.connect($('player-hand_' + i), 'onclick', this, e => this.onHandCardClick(e, index));
		}

		for (let i = 0; i < 2; i++) {
			let first = i == 0;
			dojo.connect($('player_played_' + i), 'onclick', this, e => this.returnCardToHand(e, first));
		}

		// Add on hover events for adding show-opponent-area class to the play-area.
		[$('discard_icon'), $('special_icon')].forEach(target =>
		{
			target?.addEventListener('mouseenter', () => {
				$('hands').classList.add('show-opponent-area');
			});
			target?.addEventListener('mouseleave', () => {
				$('hands').classList.remove('show-opponent-area');
			});
		});
		

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
			case "setupBattlefield":
				this.cleanupSetupBattlefield();
				break;
		default:
			break;
		}
	}

	setupHandles?: dojo.Handle[];

	cleanupSetupBattlefield() {
		this.setupHandles?.forEach(h => dojo.disconnect(h));
		delete this.setupHandles;

		let index = 1;
		while (true) {
			const element = $('battlefield_position_' + index);
			if (element) element.classList.remove('highlight');
			else break;
			index++;
		}

		this.addTooltip('player_samurai', _(`This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged.`), '');
	}

	onUpdateActionButtons(stateName: GameStateName, args: AnyGameStateArgs | null): void
	{
		console.log( 'onUpdateActionButtons: '+stateName, args );

		if( this.isCurrentPlayerActive() )
		{
			switch( stateName )
			{
			case "setupBattlefield":
				this.setupHandles?.forEach(h => dojo.disconnect(h));
				this.setupHandles = [];
				for (let index of [2, 3, 4]) {
					let element = $('battlefield_position_' + index);
					element.classList.add('highlight');
					// Add an onclick event to the ::after pseudo element
					this.setupHandles.push(dojo.connect(element, 'onclick', this, e =>
					{
						this.gamedatas.player_state = (this.gamedatas.player_state & ~(0b1111 << 0)) | (index << 0);
						this.instantMatch();
					}));
					this.addTooltip(element.id, _('Select a starting position'), _('Click to set this as your starting position.'));
				}

				this.addTooltip('player_samurai', _(`This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged.`), _('Click to switch your stance'));

				// Add an onclick event to the samurai to flip the stance:
				this.setupHandles.push(dojo.connect($('player_samurai'), 'onclick', this, e => {
					this.gamedatas.player_state = this.gamedatas.player_state ^ (1 << 4);
					this.instantMatch();
				}));

				this.addActionButton('confirmBattlefieldButton', _('Confirm'), async (e: any) => {
					console.log('Confirming selection', e);

					if (!this.checkAction('confirmedStanceAndPosition'))
						return;

					await this.confirmationTimeout.promise(e);

					this.ajaxAction('confirmedStanceAndPosition', {
						isHeavenStance: this.playerStance() == 0,
						position: this.playerPosition()
					});
					this.cleanupSetupBattlefield();
				});

				break;

			case "pickCards":

				this.addActionButton('confirmSelectionButton', _('Confirm'), async (e: any) => {
					console.log('Confirming selection', e);
					
					if (this.playerPlayed0() == 0 && this.playerPlayed1() == 0) {
						return;
					}

					await this.confirmationTimeout.promise(e);

					// This makes sure that this action button is removed.
					this.lockTitleWithStatus(_('Sending moves to server...')); 
					this.actionQueue.enqueueAjaxAction({
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

	// resizeTimeout: number | null = null;
	// onScreenWidthChange = () => {
	// 	if (this.isInitialized) {
	// 		if (this.resizeTimeout !== null) {
	// 			clearTimeout(this.resizeTimeout);
	// 		}

	// 		this.resizeTimeout = setTimeout(() => {
	// 			this.instantMatch();
	// 			this.resizeTimeout = null;
	// 		}, 10); // delay in milliseconds

	// 		this.instantMatch();
	// 	}
	// }

	instantMatch() {
		// print all fields
		console.log('instantMatch: ', {
			playerPosition: this.playerPosition(),
			playerStance: this.playerStance(),
			playerHit: this.playerHit(),
			playerPlayed0: this.playerPlayed0(),
			playerPlayed1: this.playerPlayed1(),
			playerDiscarded: this.playerDiscarded(),
			playerSpecialCard: this.playerSpecialCard(),
			playerSpecialPlayed: this.playerSpecialPlayed(),
			opponentPosition: this.opponentPosition(),
			opponentStance: this.opponentStance(),
			opponentHit: this.opponentHit(),
			opponentPlayed0: this.opponentPlayed0(),
			opponentPlayed1: this.opponentPlayed1(),
			opponentDiscarded: this.opponentDiscarded(),
			opponentSpecialCard: this.opponentSpecialCard(),
		});

		const player_area = $('game-area');

		const card_names: string[] = [
			'approach',
			'charge',
			'high-strike',
			'low-strike',
			'balance-strike',
			'retreat',
			'change-stance',
			'special'
		];
		
		player_area.className = '';

		const updatePlayed = (target: Element, first: boolean, player: boolean) => {
			if (!(target instanceof HTMLElement))
				return;

			let card: number = player ?
				(first ? this.playerPlayed0() : this.playerPlayed1()) :
				(first ? this.opponentPlayed0() : this.opponentPlayed1());

			let src: string | null = null;

			if (card != 0 && card != 9)
				player_area.classList.add(
					card_names[card - 1] + (player ? '-player' : '-opponent') + "-played" + (first ? '-first' : '-second'));

			target.classList.remove('bottomPicked');

			let prefix = player ? 'player-card-' : 'opponent-card-'
			switch (card) {
				case 0: break;
				case 1: src = this.formatSVGURL(prefix + 'approach'); break;
				case 2: src = this.formatSVGURL(prefix + 'charge'); break;
				case 3: src = this.formatSVGURL(prefix + 'high-strike'); break;
				case 4: src = this.formatSVGURL(prefix + 'low-strike'); break;
				case 5: src = this.formatSVGURL(prefix + 'balance-strike'); break;
				case 6:
					src = this.formatSVGURL(prefix + 'approach');
					target.classList.add('bottomPicked');
					break;
				case 7:
					src = this.formatSVGURL(prefix + 'charge');
					target.classList.add('bottomPicked');
					break;
				case 8:
					switch (player ? this.playerSpecialCard() : this.opponentSpecialCard()) {
						case 1: src = this.formatSVGURL('special-kesa'); break;
						case 2: src = this.formatSVGURL('special-zantetsu'); break;
						case 3: src = this.formatSVGURL('special-counter'); break;
						throw new Error('Invalid special card!');
					}
					break;
				case 9: src = this.formatSVGURL('card-back');
					break;
				default:
					throw new Error('Invalid card: ' + card);
			}

			this.setCardSlot(target, src);
		};

		updatePlayed($('player_played_0'), true, true);
		updatePlayed($('player_played_1'), false, true);
		updatePlayed($('opponent_played_0'), true, false);
		updatePlayed($('opponent_played_1'), false, false);

		// Add class to the discarded card:

		// Discards
		if (this.playerDiscarded() != 0)
			player_area.classList.add(card_names[this.playerDiscarded() - 1] + "-player-discarded");
		if (this.opponentDiscarded() != 0)
			player_area.classList.add(card_names[this.opponentDiscarded() - 1] + "-opponent-discarded");

		if (this.opponentSpecialPlayed())
			player_area.classList.add("opponent-played-special");
		if (this.playerSpecialPlayed())
			player_area.classList.add("player-played-special");

		this.setCardSlot('player-hand_5', this.specialCardURL(true));
		this.setCardSlot('opponent-hand_5', this.specialCardURL(false));


		// if (this.redSpecialCard() != 0 || this.blueSpecialCard() != 0) {

		// 	const redTarget = $('redHand_5').parentElement!;
		// 	const blueTarget = $('blueHand_5').parentElement!;

		// 	const notPlayedTooltip = (cardVisible: number) => {
		// 		const pair = cardVisible == 1 ? [6, 7] : cardVisible == 2 ? [5, 7] : [5, 6];
		// 		return '<div class="tooltip-desc">' + _('Opponent has not played their special card yet. It can be one of the following:') + '</div><div class="tooltip-two-column">' + this.createTooltip(pair[0]!, false) + this.createTooltip(pair[1]!, false) + '</div>';
		// 	};

		// 	if (this.redSpecialCard() == 0) {
		// 		// Add both tooltips to the red special card
		// 		this.addTooltipHtml(redTarget.id, notPlayedTooltip(this.blueSpecialCard()));
		// 	}
		// 	else {
		// 		this.addTooltipHtml(redTarget.id, this.createTooltip(4 + this.redSpecialCard(), this.isRedPlayer()));
		// 	}

		// 	if (this.blueSpecialCard() == 0) {
		// 		// Add both tooltips to the blue special card
		// 		this.addTooltipHtml(blueTarget.id, notPlayedTooltip(this.redSpecialCard()));
		// 	}
		// 	else {
		// 		this.addTooltipHtml(blueTarget.id, this.createTooltip(4 + this.blueSpecialCard(), !this.isRedPlayer()));
		// 	}
		// }

		// Set the positions and stance
		let battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;

		let player_samurai = $('player_samurai') as HTMLElement;
		let opponent_samurai = $('opponent_samurai') as HTMLElement;
		let play_area_bounds = $('play-area').getBoundingClientRect();
		let target_bounds_player = $('battlefield_position_' + this.playerPosition()).getBoundingClientRect();
		let target_bounds_opponent = $('battlefield_position_' + (battlefieldSize - this.opponentPosition() + 1)).getBoundingClientRect();

		player_samurai.style.left = (target_bounds_player.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%';
		player_samurai.style.top = (target_bounds_player.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%';
		opponent_samurai.style.left = (target_bounds_opponent.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%';
		opponent_samurai.style.top = (target_bounds_opponent.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%';


		this.setCardSlot('player_samurai', this.stanceURL(true));
		this.setCardSlot('opponent_samurai', this.stanceURL(false));

		player_area.classList.add('player-' + (this.playerStance() == 0 ? 'heaven' : 'earth'));
		player_area.classList.add('opponent-' + (this.opponentStance() == 0 ? 'heaven' : 'earth'));

		const specialCardName = (index: number) => {
			switch (index) {
				case 1: return _('Kesa Strike');
				case 2: return _('Zan-Tetsu Strike');
				case 3: return _('Counterattack');
				default: return _('Hidden');
			}
		}

		let special_tip: string = this.special_translations[0] + '<br/><b>' +
			_('Your special card') + "</b>: " + specialCardName(this.playerSpecialCard()) + '<br/><b>' +
			_('Opponent\'s special card') + "</b>: " + specialCardName(this.opponentSpecialCard()) + '<br/>' +
			this.special_translations[1] + '<br/>' +
			this.special_translations[2] + '<br/>' +
			this.special_translations[3];

		this.card_translations[5]![0] = special_tip;

		for (let i = 0; i < 6; i++)
		{
			let card = this.card_translations[i]!;
			let text = card[0];
			let action = card[1];
			if (i + 1 == this.playerDiscarded() || (i == 5 && this.playerSpecialPlayed())) {
				text += '<br/><i>' + _('Discarded') + '</i>';
				action = '';
			}
			this.addTooltip('player-hand_' + i, text, action);
		}
	}

	//
	// #endregion
	//

	//
	// #region Action Queue + Predictions
	// Predictions are used to simulate the state of the game before the action is acknowledged by the server.
	//

	server_player_state: number = 0;
	predictionKey: number = 0;
	predictionModifiers: { key: number, func: ((cards: number) => number) }[] = [];

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
		let cards = this.server_player_state;
		for (let mod of this.predictionModifiers) {
			// Print cards as binary
			console.log('cards:', cards.toString(2));
			cards = mod.func(cards);
		}
			console.log('cards:', cards.toString(2));
			this.gamedatas.player_state = cards;
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

		// This should be good enough to check all actions.
		if (!this.checkAction('pickedFirst', true)) {
			console.log('Not your turn!');
			return;
		}

		if (this.actionQueue.queue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
			console.log('Already confirmed cards! There is no backing out now!');
			return;
		}

		if (index == this.playerDiscarded())
		{
			console.log('This card has already been discarded!');
			return;
		}
		
		if (index == 6 && this.playerSpecialPlayed())
		{
			console.log('Thee special card has already been played!');
			return;
		}

		let first = this.playerPlayed0();
		let second = this.playerPlayed1();
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

		let action: "pickedFirst" | "pickedSecond" | null = null;
		let indexOffset: number;
		if (this.playerPlayed0() == 0) {
			action = 'pickedFirst';
			indexOffset = 6;
		}
		else if (this.playerPlayed1() == 0) {
			action = 'pickedSecond';
			indexOffset = 10;
		}

		if (!action) {
			console.error('Both cards have already been picked! but not caught!');
			return;
		}

		const callback = this.addPredictionModifier((cards) => {
			cards &= ~(0b1111 << indexOffset);
			return cards | (index & 0b1111) << indexOffset;
		});

		this.actionQueue.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
		this.actionQueue.enqueueAjaxAction({
			action,
			args: { card_id: index },
			callback
		});
	}

	returnCardToHand = (evt: MouseEvent | null, first: boolean) =>
	{
		evt?.preventDefault();

		if (this.actionQueue.queue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
			console.log('Already confirmed cards! There is no backing out now!');
			return;
		}

		if (first)
		{
			// Still waiting on the first card that was picked to be sent to server...
			if (this.actionQueue.filterActionQueue('pickedFirst')) {
				return; // Removing the play action is the same as undoing it.
			}
		}
		else {
			// Still waiting on the second card that was picked to be sent to server...
			if (this.actionQueue.filterActionQueue('pickedSecond')) {
				return; // Removing the play action is the same as undoing it.
			}
		}

		let indexOffset: number = first ? 6 : 10;
		const callback = this.addPredictionModifier((cards) => {
			return cards & ~(0b1111 << indexOffset);
		});

		this.actionQueue.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
		this.actionQueue.enqueueAjaxAction({
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

	notif_instantMatch = (notif: NotifFrom<GameStateData & { winner?: string }>) =>
	{
		console.log('notif_placeAllCards', notif);
		// if (this.gamedatas.gamestate.name !== 'setupBattlefield' || notif.type !== 'battlefield setup')
		// 	this.gamedatas.battlefield = notif.args.battlefield;
		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions();
		this.instantMatch();

		for (let player in this.gamedatas.players)
		{
			let winner = notif.args.winner == player;
			if (player == this.player_id.toString())
			{
				this.scoreCtrl[player]?.toValue(
					this.opponentHit() ? (winner ? 2 : 1) : 0
				);
			}
			else
			{
				this.scoreCtrl[player]?.toValue(
					this.playerHit() ? (winner ? 2 : 1) : 0
				);
			}
		}
	}

	//
	// #endregion
	//
}

dojo.setObject( "bgagame.kiriaitheduel", KiriaiTheDuel );
(window.bgagame ??= {}).kiriaitheduel = KiriaiTheDuel;