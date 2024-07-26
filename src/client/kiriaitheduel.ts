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

	card_names: string[] = [
		'approach',
		'charge',
		'high-strike',
		'low-strike',
		'balance-strike',
		'retreat',
		'change-stance',
		'special'
	];

	hide_second_for_animations: boolean = false;

	//
	// #region Gamedata Wrappers
	//

	playerPosition(): number { return (this.gamedatas.player_state >> 0) & 0b1111; }
	playerStance(): number { return (this.gamedatas.player_state >> 4) & 0b1; }
	playerHit(): boolean { return ((this.gamedatas.player_state >> 5) & 0b1) == 1; }
	playerPlayed0(): number { return (this.gamedatas.player_state >> 6) & 0b1111; }
	playerPlayed1(): number {
		let card = (this.gamedatas.player_state >> 10) & 0b1111;
		// <-- THIS IS ONLY FOR DRAMATIC EFFECT. THIS IS NOT HIDDEN INFORMATION AFTER ANIMATIONS PLAY. --> //
		if (this.hide_second_for_animations && card != 0 && this.isSpectator)
			return 9;
		return card;
	}
	playerDiscarded(): number { return (this.gamedatas.player_state >> 14) & 0b111; }
	playerSpecialCard(): number { return (this.gamedatas.player_state >> 17) & 0b11; }
	playerSpecialPlayed(): boolean { return ((this.gamedatas.player_state >> 19) & 0b1) == 1; }

	opponentPosition(): number { return (this.gamedatas.opponent_state >> 0) & 0b1111; }
	opponentStance(): number { return (this.gamedatas.opponent_state >> 4) & 0b1; }
	opponentHit(): boolean { return ((this.gamedatas.opponent_state >> 5) & 0b1) == 1; }
	opponentPlayed0(): number { return (this.gamedatas.opponent_state >> 6) & 0b1111; }
	opponentPlayed1(): number {
		let card = (this.gamedatas.opponent_state >> 10) & 0b1111;
		// <-- THIS IS ONLY FOR DRAMATIC EFFECT. THIS IS NOT HIDDEN INFORMATION AFTER ANIMATIONS PLAY. --> //
		if (this.hide_second_for_animations && card != 0)
			return 9;
		return card;
	}
	opponentDiscarded(): number { return (this.gamedatas.opponent_state >> 14) & 0b111; }
	opponentSpecialCard(): number { return (this.gamedatas.opponent_state >> 17) & 0b11; }
	opponentSpecialPlayed(): boolean { return ((this.gamedatas.opponent_state >> 19) & 0b1) == 1; }

	//
	// #endregion
	//

	//
	// #region Document/URL Utilities
	//

	formatSVGURL(name: string) { return `${g_gamethemeurl}${PLAYER_IMAGES}/${name}.svg` }

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

		for (let i = 0; i < slot.children.length; i++) {
			let child = slot.children[i];
			if (child instanceof HTMLImageElement) {
				child.style.display = src ? 'block' : 'none';
				if (src != null)
					child.src = src;
				return;
			}
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
		// console.log( "Starting game setup", this.gamedatas );

		this.actionQueue.actionTitleLockingStrategy = 'actionbar';

		// console.log( this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id] );

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

		// this.addTooltip('opponent_hand_icon', '', _('Hover to show opponent\'s hand.'));
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
		[$('discard_icon'), $('special_icon'), $('opponent_hand_icon')].forEach(target =>
		{
			target?.addEventListener('mouseenter', () => {
				$('hands').classList.add('show-opponent-area');
			});
			target?.addEventListener('mouseleave', () => {
				$('hands').classList.remove('show-opponent-area');
			});
		});
		

		this.isInitialized = true;

		// console.log( "Ending game setup" );
	}

	onEnteringState(stateName: GameStateName, args: CurrentStateArgs): void
	{
		// console.log( 'Entering state: '+ stateName, args );
		
		switch( stateName )
		{
		case "gameEnd":
			for (let player in this.gamedatas.players)
			{
				if (player == this.player_id.toString())
				{
					if (this.scoreCtrl[player]?.getValue() == 2)
						$('opponent_samurai')?.classList.add('loser');
				}
				else
				{
					if (this.scoreCtrl[player]?.getValue() == 2)
						$('player_samurai')?.classList.add('loser');
				}
			}
			this.hide_second_for_animations = false;
			break;
		}
	}

	onLeavingState(stateName: GameStateName): void
	{
		// console.log( 'Leaving state: '+ stateName );
		
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
		// console.log( 'onUpdateActionButtons: '+stateName, args );

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
					// console.log('Confirming selection', e);

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
					// console.log('Confirming selection', e);
					
					if (this.playerPlayed0() == 0 || this.playerPlayed1() == 0) {
						this.showMessage(_('You must play both cards before confirming!'), 'error');
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

	getSamuraiOffsets() {
		let battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;
		let play_area_bounds = $('play-area').getBoundingClientRect();
		let target_bounds_player = $('battlefield_position_' + this.playerPosition()).getBoundingClientRect();
		let target_bounds_opponent = $('battlefield_position_' + (battlefieldSize - this.opponentPosition() + 1)).getBoundingClientRect();

		return {
			player_x: (target_bounds_player.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%',
			player_y: (target_bounds_player.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%',
			opponent_x: (target_bounds_opponent.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%',
			opponent_y: (target_bounds_opponent.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%'
		}
	}

	instantMatch() {
		// print all fields
		// console.log('instantMatch: ', {
		// 	playerPosition: this.playerPosition(),
		// 	playerStance: this.playerStance(),
		// 	playerHit: this.playerHit(),
		// 	playerPlayed0: this.playerPlayed0(),
		// 	playerPlayed1: this.playerPlayed1(),
		// 	playerDiscarded: this.playerDiscarded(),
		// 	playerSpecialCard: this.playerSpecialCard(),
		// 	playerSpecialPlayed: this.playerSpecialPlayed(),
		// 	opponentPosition: this.opponentPosition(),
		// 	opponentStance: this.opponentStance(),
		// 	opponentHit: this.opponentHit(),
		// 	opponentPlayed0: this.opponentPlayed0(),
		// 	opponentPlayed1: this.opponentPlayed1(),
		// 	opponentDiscarded: this.opponentDiscarded(),
		// 	opponentSpecialCard: this.opponentSpecialCard(),
		// });

		const player_area = $('game-area');
		
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
					this.card_names[card - 1] + (player ? '-player' : '-opponent') + "-played" + (first ? '-first' : '-second'));

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
			player_area.classList.add(this.card_names[this.playerDiscarded() - 1] + "-player-discarded");
		if (this.opponentDiscarded() != 0)
			player_area.classList.add(this.card_names[this.opponentDiscarded() - 1] + "-opponent-discarded");

		if (this.opponentSpecialPlayed())
			player_area.classList.add("opponent-played-special");
		($('special_icon') as HTMLImageElement).src =
			this.formatSVGURL(this.opponentSpecialPlayed() ? 'opponent-icon-discard': 'opponent-icon-hand');

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
		let player_samurai = $('player_samurai') as HTMLElement;
		let opponent_samurai = $('opponent_samurai') as HTMLElement;
		const { player_x, player_y, opponent_x, opponent_y } = this.getSamuraiOffsets();
		player_samurai.style.left = player_x;
		player_samurai.style.top = player_y;
		opponent_samurai.style.left = opponent_x;
		opponent_samurai.style.top = opponent_y;


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

	updateCardsWithPredictions(match: boolean = true)
	{
		let cards = this.server_player_state;
		for (let mod of this.predictionModifiers) {
			// Print cards as binary
			// console.log('cards:', cards.toString(2));
			cards = mod.func(cards);
		}
			// console.log('cards:', cards.toString(2));
			this.gamedatas.player_state = cards;
		if (match)
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
			// console.log('Not your turn!');
			return;
		}

		if (this.actionQueue.queue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
			// console.log('Already confirmed cards! There is no backing out now!');
			return;
		}

		if (index == this.playerDiscarded())
		{
			// console.log('This card has already been discarded!');
			return;
		}
		
		if (index == 6 && this.playerSpecialPlayed())
		{
			// console.log('Thee special card has already been played!');
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
			// console.log('Both cards have already been played!');
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
			// console.log('Already confirmed cards! There is no backing out now!');
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
		// console.log( 'notifications subscriptions setup' );

		if (this.isSpectator)
		{
			this.subscribeNotif('_spectator_ battlefield setup', this.notif_instantMatch);
			this.subscribeNotif('_spectator_ played card',  this.notif_instantMatch);
			this.subscribeNotif('_spectator_ undo card',  this.notif_instantMatch);
			this.subscribeNotif('_spectator_ before first resolve',  this.notif_beforeFirstResolve);
			this.subscribeNotif('_spectator_ before second resolve',  this.notif_beforeSecondResolve);
			this.subscribeNotif('_spectator_ after resolve',  this.notif_afterResolve);
			this.subscribeNotif('_spectator_ player(s) charged',  this.notif_playerMoved);
			this.subscribeNotif('_spectator_ player(s) moved',  this.notif_playerMoved);
			this.subscribeNotif('_spectator_ player(s) changed stance',  this.notif_playerStance);
			this.subscribeNotif('_spectator_ player(s) attacked',  this.notif_playerAttacked);
			this.subscribeNotif('_spectator_ player(s) hit',  this.notif_instantMatch);
			this.notifqueue.setSynchronous( '_spectator_ battlefield setup', 1000 );
			this.notifqueue.setSynchronous( '_spectator_ before first resolve', 2000 );
			this.notifqueue.setSynchronous( '_spectator_ before second resolve', 1800 );
			this.notifqueue.setSynchronous( '_spectator_ after resolve', 1000 );
			this.notifqueue.setSynchronous( '_spectator_ player(s) charged', 2000 );
			this.notifqueue.setSynchronous( '_spectator_ player(s) moved', 2000 );
			this.notifqueue.setSynchronous( '_spectator_ player(s) changed stance', 2000 );
			this.notifqueue.setSynchronous( '_spectator_ player(s) attacked', 3000 );
			this.notifqueue.setSynchronous( '_spectator_ player(s) hit', 2000 );
		}
		else {
			this.subscribeNotif('battlefield setup', this.notif_instantMatch);
			this.subscribeNotif('played card',  this.notif_instantMatch);
			this.subscribeNotif('undo card',  this.notif_instantMatch);
			this.subscribeNotif('before first resolve',  this.notif_beforeFirstResolve);
			this.subscribeNotif('before second resolve',  this.notif_beforeSecondResolve);
			this.subscribeNotif('after resolve',  this.notif_afterResolve);
			this.subscribeNotif('player(s) charged',  this.notif_playerMoved);
			this.subscribeNotif('player(s) moved',  this.notif_playerMoved);
			this.subscribeNotif('player(s) changed stance',  this.notif_playerStance);
			this.subscribeNotif('player(s) attacked',  this.notif_playerAttacked);
			this.subscribeNotif('player(s) hit',  this.notif_instantMatch);
			this.notifqueue.setSynchronous( 'battlefield setup', 1000 );
			this.notifqueue.setSynchronous( 'before first resolve', 2000 );
			this.notifqueue.setSynchronous( 'before second resolve', 1800 );
			this.notifqueue.setSynchronous( 'after resolve', 1000 );
			this.notifqueue.setSynchronous( 'player(s) charged', 2000 );
			this.notifqueue.setSynchronous( 'player(s) moved', 2000 );
			this.notifqueue.setSynchronous( 'player(s) changed stance', 2000 );
			this.notifqueue.setSynchronous( 'player(s) attacked', 3000 );
			this.notifqueue.setSynchronous( 'player(s) hit', 2000 );

			this.notifqueue.setIgnoreNotificationCheck('_spectator_ battlefield setup', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ played card', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ undo card', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ before first resolve', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ before second resolve', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ after resolve', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) charged', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) moved', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) changed stance', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) attacked', () => true);
			this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) hit', () => true);
		}

		// this.subscribeNotif('log', a => console.log('log:', a));
	}

	notif_instantMatch = (notif: NotifFrom<GameStateData & { winner?: number }>) =>
	{
		// console.log('notif_placeAllCards', notif);

		// if (this.gamedatas.gamestate.name !== 'setupBattlefield' || notif.type !== 'battlefield setup')
		// 	this.gamedatas.battlefield = notif.args.battlefield;
		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(true);

		for (let player in this.gamedatas.players)
		{
			let winner = notif.args.winner?.toString() == player;
			if (player == this.player_id.toString())
			{
				this.scoreCtrl[player]?.toValue(
					this.opponentHit() ? (winner ? 2 : 1) : 0
				);
				if (winner)
				{
					$('opponent_samurai')?.classList.add('loser');
				}
			}
			else
			{
				this.scoreCtrl[player]?.toValue(
					this.playerHit() ? (winner ? 2 : 1) : 0
				);
				if (winner)
				{
					$('player_samurai')?.classList.add('loser');
				}
			}
		}
	}

	async notif_beforeFirstResolve(notif: NotifFrom<GameStateData>)
	{
		this.hide_second_for_animations = true;

		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(true);
	}

	async notif_beforeSecondResolve(notif: NotifFrom<GameStateData>)
	{
		await new Promise(res => setTimeout(res, 750));

		this.hide_second_for_animations = false;

		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(true);
	}

	async notif_afterResolve(notif: NotifFrom<GameStateData>)
	{
		await new Promise(res => setTimeout(res, 750));

		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(true);
	}

	async notif_playerStance(notif: NotifAs<'player(s) changed stance'> | NotifAs<'_spectator_ player(s) changed stance'>)
	{
		// console.log('notif_playerStance', notif);
		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(false);

		const first = this.playerPlayed0() != 0 && this.opponentPlayed0() != 0;
		const player_card = first ? this.playerPlayed0() : this.playerPlayed1();
		const opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
		const player_card_div = $('player_played_' + (first ? 0 : 1)) as HTMLElement;
		const opponent_card_div = $('opponent_played_' + (first ? 0 : 1)) as HTMLElement;

		// Slide the samurai to the new positions:
		let player_samurai = $('player_samurai') as HTMLElement;
		let opponent_samurai = $('opponent_samurai') as HTMLElement;

		if ((player_card == 8 && this.playerSpecialCard() != 3 && notif.args.isSpecial) || (player_card == 7 && !notif.args.isSpecial))
			player_card_div.classList.add('evaluating');
		if ((opponent_card == 8 && this.opponentSpecialCard() != 3 && notif.args.isSpecial) || ((opponent_card == 7 && !notif.args.isSpecial)))
			opponent_card_div.classList.add('evaluating');

		await new Promise(res => setTimeout(res, 500));

		const player_area = $('game-area');

		if (this.playerStance() == 0 && !player_area.classList.contains("player-heaven")) {
			player_samurai.classList.add('rotating');
			player_area.classList.remove("player-earth");
			player_area.classList.add("player-heaven");
		}
		else if (this.playerStance() == 1 && !player_area.classList.contains("player-earth")) {
			player_samurai.classList.add('rotating');
			player_area.classList.remove("player-heaven");
			player_area.classList.add("player-earth");
		}

		if (this.opponentStance() == 0 && !player_area.classList.contains("opponent-heaven")) {
			opponent_samurai.classList.add('rotating');
			player_area.classList.remove("opponent-earth");
			player_area.classList.add("opponent-heaven");
		}
		else if (this.opponentStance() == 1 && !player_area.classList.contains("opponent-earth")) {
			opponent_samurai.classList.add('rotating');
			player_area.classList.remove("opponent-heaven");
			player_area.classList.add("opponent-earth");
		}

		await new Promise(res => setTimeout(res, 1000));

		player_samurai.classList.remove('rotating');
		opponent_samurai.classList.remove('rotating');
		player_card_div.classList.remove('evaluating');
		opponent_card_div.classList.remove('evaluating');
		this.instantMatch();
	}

	async notif_playerMoved(notif: NotifAs<'player(s) moved'> | NotifAs<'player(s) charged'> | NotifAs<'_spectator_ player(s) moved'> | NotifAs<'_spectator_ player(s) charged'>)
	{
		// console.log('notif_playerMoved', notif);

		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(false);

		const first = this.playerPlayed0() != 0 && this.opponentPlayed0() != 0;
		const player_card = first ? this.playerPlayed0() : this.playerPlayed1();
		const opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
		const player_card_div = $('player_played_' + (first ? 0 : 1)) as HTMLElement;
		const opponent_card_div = $('opponent_played_' + (first ? 0 : 1)) as HTMLElement;

		if ((player_card == 1 || player_card == 2 || player_card == 6) && notif.args.isHeaven == (this.playerStance() == 0))
			player_card_div.classList.add('evaluating');
		if ((opponent_card == 1 || opponent_card == 2 || opponent_card == 6) && notif.args.isHeaven == (this.opponentStance() == 0))
			opponent_card_div.classList.add('evaluating');

		await new Promise(res => setTimeout(res, 500));

		// Slide the samurai to the new positions:
		let player_samurai = $('player_samurai') as HTMLElement;
		let opponent_samurai = $('opponent_samurai') as HTMLElement;
		player_samurai.style.transition = '750ms left, 750ms top';
		opponent_samurai.style.transition = '750ms left, 750ms top';
		this.instantMatch();

		await new Promise(res => setTimeout(res, 1000));

		player_samurai.style.transition = '';
		opponent_samurai.style.transition = '';
		player_card_div.classList.remove('evaluating');
		opponent_card_div.classList.remove('evaluating');
	}

	async notif_playerAttacked(notif: NotifAs<'player(s) attacked'> | NotifAs<'_spectator_ player(s) attacked'>)
	{
		this.server_player_state = notif.args.player_state;
		this.gamedatas.opponent_state = notif.args.opponent_state;
		this.updateCardsWithPredictions(true);

		let first = notif.args.first;
		const player_card = first ? this.playerPlayed0() : this.playerPlayed1();
		const opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
		const player_position = this.playerPosition() ;
		const opponent_position = this.opponentPosition();
		const battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;


		const player_card_div = $('player_played_' + (first ? 0 : 1)) as HTMLElement;
		const opponent_card_div = $('opponent_played_' + (first ? 0 : 1)) as HTMLElement;

		const effectAndPosition = (card: number, position: number, stance: number, special: number): [number[], boolean] => {
			switch (card)
			{
				case 3: return [[position + 2], stance == 0];
				case 4: return [[position + 1], stance == 1];
				case 5: return [[position], true];
				case 8: 
					switch (special)
					{
						case 1: return [[position, position + 1], stance == 0];
						case 2: return [[position + 2, position + 3], stance == 1];
						case 3: return [[], true];
						default: throw new Error('Invalid special card: ' + special);
					}
				default: return [[], false];
			}
		}

		let [player_hit_positions, player_stance_good] = effectAndPosition(player_card, player_position, this.playerStance(), this.playerSpecialCard());
		let player_card_valid = player_hit_positions.length > 0 || player_stance_good;
		let [opponent_hit_positions, opponent_stance_good] = effectAndPosition(opponent_card, opponent_position, this.opponentStance(), this.opponentSpecialCard());
		let opponent_card_valid = opponent_hit_positions.length > 0 || opponent_stance_good;

		// filter out invalid positions
		player_hit_positions = player_hit_positions.filter(p => p >= 1 && p <= battlefieldSize);
		opponent_hit_positions = opponent_hit_positions.filter(p => p >= 1 && p <= battlefieldSize);

		opponent_hit_positions = opponent_hit_positions.map(p => battlefieldSize - p + 1);

		let player_hit = player_hit_positions.includes(battlefieldSize - opponent_position + 1) && player_stance_good;
		let opponent_hit = opponent_hit_positions.includes(player_position) && opponent_stance_good;

		if (player_stance_good && player_hit_positions.length == 0 && opponent_hit)
		{
			player_hit = true;
			opponent_hit = false;
		}
		else if (opponent_stance_good && opponent_hit_positions.length == 0 && player_hit)
		{
			player_hit = false;
			opponent_hit = true;
		}

		// console.log('player_hit_positions:', player_hit_positions, 'opponent_hit_positions:', opponent_hit_positions, 'player_hit:', player_hit, 'opponent_hit:', opponent_hit, 'player_stance_good:', player_stance_good, 'opponent_stance_good:', opponent_stance_good, 'player_card_valid:', player_card_valid, 'opponent_card_valid:', opponent_card_valid, 'player_card:', player_card, 'opponent_card:', opponent_card);

		let source_player_0_className = $('player' + '-slash-effect_0').className;
		let source_player_1_className = $('player' + '-slash-effect_1').className;
		let source_opponent_0_className = $('opponent' + '-slash-effect_0').className;
		let source_opponent_1_className = $('opponent' + '-slash-effect_1').className;

		// Check if this player played cards 3,4,5, or 8
		
		if (player_card_valid)
			player_card_div.classList.add('evaluating');

		if (opponent_card_valid)
			opponent_card_div.classList.add('evaluating');

		await new Promise(res => setTimeout(res, 500));

		if (player_card_valid)
		{
			if (player_stance_good)
			{
				for (let pos of player_hit_positions) {
					$('battlefield_position_' + pos)?.classList.add('player_highlight');
				}
			}
			if (!player_stance_good) {
				$('player_samurai')?.classList.add('attack-stance-bad');
			}
		}

		if (opponent_card_valid)
		{
			if (opponent_stance_good)
			{
				for (let pos of opponent_hit_positions) {
					$('battlefield_position_' + pos)?.classList.add('opponent_highlight');
				}
			}
			if (!opponent_stance_good) {
				$('opponent_samurai')?.classList.add('attack-stance-bad');
			}
		}

		await new Promise(res => setTimeout(res, 1000));

		const animateCard = (card: number, special: number, prefix: string, positions: number[], hit: boolean) =>
		{
			if (card != 8) {
				if (positions.length == 1) {
					$(prefix + '-slash-effect_0').classList.add('slash-effect-anim-'+prefix+'-' + this.card_names[card - 1]);
					this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
				}
			}
			else if (special == 1) {
				if (positions.length >= 1) {
					$(prefix + '-slash-effect_0').classList.add('slash-effect-anim-'+prefix+'-kesa-0');
					this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
				}
				if (positions.length >= 2) {
					$(prefix + '-slash-effect_1').classList.add('slash-effect-anim-'+prefix+'-kesa-1');
					this.placeOnObject(prefix + '-slash-effect_1', 'battlefield_position_' + positions[1]);
				}
			}
			else if (special == 2) {
				if (positions.length >= 1) {
					$(prefix + '-slash-effect_0').classList.add('slash-effect-anim-'+prefix+'-zantetsu-0');
					this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
				}
				if (positions.length >= 2) {
					$(prefix + '-slash-effect_1').classList.add('slash-effect-anim-'+prefix+'-zantetsu-1');
					this.placeOnObject(prefix + '-slash-effect_1', 'battlefield_position_' + positions[1]);
				}
			}
			else if (special == 3) {
				$(prefix + '-slash-effect_0').classList.add('slash-effect-anim-'+prefix+'-counter');
				this.placeOnObject(prefix + '-slash-effect_0', 'battlefield');
			}

			if (!hit) {
				$(prefix + '-slash-effect_0').classList.add('miss');
				$(prefix + '-slash-effect_1').classList.add('miss');
			}
		}

		if (player_card_valid)
		{
			animateCard(player_card, this.playerSpecialCard(), 'player', player_hit_positions, player_hit);
		}

		if (opponent_card_valid)
		{
			animateCard(opponent_card, this.opponentSpecialCard(), 'opponent', opponent_hit_positions, opponent_hit);
		}

		await new Promise(res => setTimeout(res, 1000));

		for (let pos of player_hit_positions) {
			$('battlefield_position_' + pos)?.classList.remove('player_highlight');
		}

		for (let pos of opponent_hit_positions) {
			$('battlefield_position_' + pos)?.classList.remove('opponent_highlight');
		}

		$('player-slash-effect_0').className = source_player_0_className;
		$('player-slash-effect_1').className = source_player_1_className;
		$('opponent-slash-effect_0').className = source_opponent_0_className;
		$('opponent-slash-effect_1').className = source_opponent_1_className;

		$('player_samurai')?.classList.remove('attack-stance-bad');
		$('opponent_samurai')?.classList.remove('attack-stance-bad');
		player_card_div.classList.remove('evaluating');
		opponent_card_div.classList.remove('evaluating');
	}

	//
	// #endregion
	//
}

dojo.setObject( "bgagame.kiriaitheduel", KiriaiTheDuel );
(window.bgagame ??= {}).kiriaitheduel = KiriaiTheDuel;

// #background-area should scroll with X% the speed of the page (if is a fixed element, so just change the top value)
window.addEventListener('scroll', () => {
	($('background-area') as HTMLElement).style.top = -(window.scrollY * 0.35) + 'px';
});