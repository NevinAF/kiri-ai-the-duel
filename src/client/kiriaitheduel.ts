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

declare function $<E extends Element>(id: string | E): E;

/**
 * The {@link ConfirmationTimeout} is a support class built on top of {@link setTimeout} to provide a visual representation of a timeout and provide an easy way to cancel it. This manages two visual elements:
 * - A cancel area which describes the space which the user can click to escape the timeout.
 * - An animation element which follows the mouse around to show the status of the timeout (e.g., a loading spinner).
 * 
 * There are several ways to use this class:
 * @example
 * // Using 'add' method to link dom elements (using 'click' event).
 * const confirmationTimeout = new ConfirmationTimeout(document);
 * 
 * confirmationTimeout.add('button', () => {
 * 	console.log('Action confirmed!');
 * });
 * @example
 * // Using 'set' method to link mouse events. This is usually more suitable when you need to check actions before visually confirming them.
 * document.getElementById('button')?.addEventListener('click', evt =>
 * {
 * 	if (!this.checkAction('action'))
 * 		return;
 * 	console.log('Confirmation action...');
 * 	confirmationTimeout.set(evt, () => {
 * 		console.log('Action confirmed!');
 * 	});
 * });
 * @example
 * // Same as 'set', but built for the async/await pattern.
 * document.getElementById('button')?.addEventListener('click', async evt =>
 * {
 * 	console.log('Confirmation action...');
 * 	await confirmationTimeout.promise(evt);
 * 	console.log('Action confirmed!');
 * });
 */
class ConfirmationTimeout
{
	/** The default duration in milliseconds. */
	private _duration!: number;
	/** The timeout for this current interaction. When the timeout completes, it call the callback. This is used to determine if the confirmation timeout is active. */
	private _timeout: number | null = null;
	/** The element created to represent the cancel area. Clicking on this area will cancel the timeout. See {@link off}. */
	private _cancelElement!: HTMLElement;
	/** The element which represents the mouse, usually animated to represent the timeout. */
	private _animationElement!: HTMLElement | null;
	/** The HTML 'click' listeners. This mimic Dojo.Handle, without needing dojo. */
	private _listeners?: Map<HTMLElement, (... args: any[]) => any>;
	/** If true, the animation element will follow the mouse around. Otherwise, it will be placed at the cursor when this timeout is set any will not move until the next {@link set}. */
	private _followMouse!: boolean;

	private static _defaultAnimationCSS = `
#confirmation-timeout-default {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	position: absolute;
	pointer-events: none;
	display: none;
}
#confirmation-timeout-default div {
	width: 100%;
	height: 100%;
	position: absolute;
	border-radius: 50%;
}
#confirmation-timeout-default > div {
	clip: rect(0px, 20px, 20px, 10px);
}
#confirmation-timeout-default > div > div {
	clip: rect(0px, 11px, 20px, 0px);
	background: #08C;
}
#confirmation-timeout-default > div:first-child, #confirmation-timeout-default > div > div {
	animation: confirmation-timeout-anim 1s linear forwards;
}
@keyframes confirmation-timeout-anim {
	0% { transform: rotate(3deg); }
	100% { transform: rotate(180deg); }
}`;
	private static _defaultAnimationCSSAdded = false;

	private static AddDefaultAnimationCSS()
	{
		if (ConfirmationTimeout._defaultAnimationCSSAdded)
			return;

		let style = document.createElement('style');
		style.innerHTML = ConfirmationTimeout._defaultAnimationCSS;
		document.head.appendChild(style);
		ConfirmationTimeout._defaultAnimationCSSAdded = true;
	}

	/** Turns off the confirmation timeout, canceling the callback and hiding all visuals. */
	public off()
	{
		if (this._timeout == null)
			return;

		clearTimeout(this._timeout);
		this._timeout = null;

		this._cancelElement.style.display = 'none';

		if (this._animationElement)
			this._animationElement.style.display = 'none';
	}

	/**
	 * Sets a new timeout based on the mouse position. When the timeout completes, the callback will be called. If a timeout is already active, it will be canceled.
	 * @param evt The mouse event that triggered the timeout.
	 * @param callback The function to call when the timeout completes.
	 * @see promise for an async version of this function.
	 * @example
	 * ```typescript
	 * document.getElementById('button')?.addEventListener('click', async evt =>
	 * {
	 * 	console.log('Confirmation action...');
	 * 	confirmationTimeout.set(evt, () => {
	 * 		console.log('Action confirmed!');
	 * 	});
	 * });
	 * ```
	 */
	public set(evt: MouseEvent, callback: () => void)
	{
		if (this._timeout != null)
			this.off();

		if (this._duration <= 0) {
			callback();
			return;
		}

		this._cancelElement.style.display = "block";

		this._timeout = setTimeout(() => {
			this.off();
			callback();
		}, this._duration);

		if (this._animationElement)
		{
			this._animationElement.style.display = "block";
			this.mouseMoved(evt);
		}
	}

	/**
	 * Same as {@link set}, but returns a promise that resolves when the timeout completes.
	 * @param evt The mouse event that triggered the timeout.
	 * @returns A promise that resolves when the timeout completes.
	 * @example
	 * ```typescript
	 * document.getElementById('button')?.addEventListener('click', async evt =>
	 * {
	 * 	console.log('Confirmation action...');
	 * 	await confirmationTimeout.promise(evt);
	 * 	console.log('Action confirmed!');
	 * });
	 * ```
	 */
	public promise(evt: MouseEvent): Promise<void>
	{
		return new Promise((resolve, reject) => {
			this.set(evt, resolve);
		});
	}

	/**
	 * Adds a click listener to the element which will trigger the confirmation timeout.
	 * @param element The element to add the listener to. If a string, it will be used as an id to find the element. If falsy or not found, nothing will happen.
	 * @param callback The function to call when the timeout completes. This is not the same as the callback used when the event is triggered (i.e., it will be 'duration' milliseconds after the event is triggered).
	 * @returns True if the listener was added, false if the element was not found.
	 * @example
	 * ```typescript
	 * confirmationTimeout.add('button', () => {
	 * 	console.log('Action confirmed!');
	 * });
	 */
	public add(element: string | HTMLElement | null, callback: () => void): boolean
	{
		if (!this._listeners)
			this._listeners = new Map();

		const listener = (evt: MouseEvent) => {
			this.set(evt, callback);
		}

		if (typeof element == 'string')
			element = document.getElementById(element);

		if (element)
		{
			this._listeners.set(element, listener);
			element.addEventListener('click', listener);
			return true;
		}

		return false;
	}

	/**
	 * Removes the click listener from the element (all listeners if multiple are set on this element).
	 * @param element The element to remove the listener from. If a string, it will be used as an id to find the element. If falsy or not found, nothing will happen.
	 * @returns True if the listener was removed, false if the element was not found or no listener was set.
	 * @example
	 * ```typescript
	 * confirmationTimeout.remove('button');
	 */
	public remove(element: string | HTMLElement | null): boolean
	{
		if (!this._listeners)
			return false;

		if (typeof element == 'string')
			element = document.getElementById(element);

		if (element)
		{
			let listener = this._listeners.get(element);
			if (listener)
			{
				do
				{
					element.removeEventListener('click', listener);
					this._listeners.delete(element);
				} while (listener = this._listeners.get(element));

				return true;
			}
		}

		return false;
	}

	/** Moves the animation element to the mouse position. */
	private mouseMoved(evt: MouseEvent)
	{
		if (!this._followMouse && evt.target == this._cancelElement)
			return;

		if (this._animationElement)
		{
			let size = this._animationElement.getBoundingClientRect();
			this._animationElement.style.left = evt.clientX - size.width / 2 + 'px';
			this._animationElement.style.top = evt.clientY - size.height / 2 + 'px';
		}
	}

	/**
	 * Creates a new confirmation timeout.
	 * @param cancel_area_classes The classes to add to the created cancel area element. This is already always scaled and positioned to cover the entire cancel area and disables user selection.
	 * @param options The options for this confirmation timeout. See {@link setCancelArea}, {@link setAnimation}, {@link setDuration}, {@link setFollowMouse}, and {@link setCancelAreaClasses} for more information.
	 * @example
	 * ```typescript
	 * const confirmationTimeout = new ConfirmationTimeout('leftright_page_wrapper');
	 * 
	 * confirmationTimeout.add('button', () => {
	 * 	console.log('Action confirmed!');
	 * });
	 * ```
	 */
	constructor(cancel_area: string | Node | null, options: { animation?: string | HTMLElement | null, duration?: number, followMouse?: boolean, cancel_area_classes?: string, durationPref?: number } = {})
	{
		this.setCancelArea(cancel_area);
		this.setAnimation(options.animation);
		if (options.durationPref !== undefined)
			this.setDurationPreference(options.durationPref);
		else this.setDuration(options.duration ?? 1000);

		this.setFollowMouse(options.followMouse ?? true);
		this.setCancelAreaClasses(options.cancel_area_classes ?? '');
	}

	/**
	 * Updates the cancel area for this object.
	 * @param cancel_area The element to add the cancel area to. If a string, it will be used as an id to find the element. If falsy or not found, the cancel area will be added to the body.
	 */
	public setCancelArea(cancel_area?: string | Node | null)
	{
		if (this._cancelElement)
			this._cancelElement.remove();

		if (typeof cancel_area == 'string')
			cancel_area = document.getElementById(cancel_area);

		if (!cancel_area || cancel_area == document)
			cancel_area = document.body;

		let cancelElement = cancel_area.ownerDocument!.createElement('div');
		cancelElement.style.width = '100%';
		cancelElement.style.height = '100%';
		cancelElement.style.position = 'absolute';
		cancelElement.style.top = '0px';
		cancelElement.style.left = '0px';
		cancelElement.style.display = 'none';
		cancelElement.style.userSelect = 'none';

		cancel_area.appendChild(cancelElement);

		cancelElement.addEventListener('click', () => {
			this.off();
		});

		this._cancelElement = cancelElement;
		this._cancelElement.addEventListener('mousemove', this.mouseMoved.bind(this));
	}

	/**
	 * Updates the animation for this object.
	 * @param animation The element to use as the animation. If a string, it will be used as an id to find the element. If falsy or not found, a default animation will be created.
	 */
	public setAnimation(animation?: string | HTMLElement | null)
	{
		if (animation === undefined)
		{
			animation = document.createElement('div');
			animation.id = 'confirmation-timeout-default';
			animation.style.display = 'none';

			for (let i = 0; i < 2; i++) {
				const div = document.createElement('div');
				const inner = document.createElement('div');
				div.appendChild(inner);
				animation.appendChild(div);
			}

			ConfirmationTimeout.AddDefaultAnimationCSS();
			this._cancelElement.appendChild(animation);
		}
		else if (typeof animation == 'string')
			animation = document.getElementById(animation);

		if (animation)
		{
			this._animationElement = animation;
			this._animationElement.style.position = 'absolute';
			this._animationElement.style.userSelect = 'none';
			this._cancelElement.style.cursor = null!;

			if (this._duration)
				this.setDuration(this._duration);
		}
		else {
			this._animationElement = null;
			this._cancelElement.style.cursor = 'wait';
		}
	}

	/**
	 * Updates the duration for this object.
	 * @param duration The duration of the timeout in milliseconds.
	*/
	public setDuration(duration: number)
	{
		this._duration = duration;

		if (this._animationElement)
		{
			this._animationElement.style.animationDuration = this._duration + 'ms';
			this._animationElement.querySelectorAll<HTMLElement>('*').forEach(element => {
				element.style.animationDuration = this._duration + 'ms';
			});
		}

	}

	/**
	 * Updates the duration for this object. This will pull directly from the gameui preferences data, which can be pasted into any project with the following code:
	 * ```json
	 * "150": {
	 * 	"name": "Confirmation Time",
	 * 	"needReload": true, // This can differ you manually update the preference.
	 * 	"values": {
	 * 		"1": { "name": "No Confirmations" },
	 * 		"2": { "name": "Very Short: 300ms" },
	 * 		"3": { "name": "Short: 600ms" },
	 * 		"4": { "name": "Default: 1 Second" },
	 * 		"5": { "name": "Long: 1.5 Seconds" },
	 * 		"6": { "name": "Very Long: 2 Seconds" }
	 * 	},
	 * 	"default": 4
	 * }
	 * ```
	 * @param durationPref The index of the selected duration preference. This will always map to the following values: [0, 300, 600, 1000, 1500, 2000].
	*/
	setDurationPreference(durationPref: number)
	{
		if (gameui === undefined)
		{
			console.error('Cannot use duration preferences before the games "setup" function!');
			this.setDuration(1000);
			return;
		}

		// @ts-ignore
		let pref = gameui.prefs[durationPref];
		if (pref === undefined)
		{
			console.error('Invalid duration preference id: ' + durationPref);
			durationPref = 4;
		}
		else durationPref = pref.value;

		let duration = [0, 300, 600, 1000, 1500, 2000][durationPref - 1];
		if (duration === undefined || isNaN(duration))
		{
			console.error('Invalid duration preference value: ' + durationPref);
			duration = 1000;
		}

		this.setDuration(duration);
	}

	/**
	 * Updates if the animation element should follow the mouse around.
	 *  If true, the animation element will follow the mouse around. Otherwise, it will be placed at the cursor when this timeout is set any will not move until the next {@link set}.
	 */
	public setFollowMouse(followMouse: boolean)
	{
		this._followMouse = followMouse;
	}

	/** Updates the classes for the cancel area. */
	public setCancelAreaClasses(classes: string)
	{
		this._cancelElement.className = classes;
	}

	/** Destroys this object, removing all listeners and elements. You should not use this object after calling destroy. */
	public destroy()
	{
		this.off();
		this._listeners?.forEach((listener, element) => {
			element.removeEventListener('click', listener);
		});
		this._listeners?.clear();
		this._animationElement?.remove();
		this._cancelElement?.remove();
	}
}

/** The root for all of your game code. */
class KiriaiTheDuel extends TitleLockingMixin(CommonMixin(Gamegui))
{
	/** @gameSpecific See {@link Gamegui.setup} for more information. */
	isInitialized: boolean = false;
	color_path: string = 'Red';
	actionQueue = new PlayerActionQueue(this);
	confirmationTimeout = new ConfirmationTimeout('leftright_page_wrapper');

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
		for (let i = 0; i < 5; i++)
		{
			this.addTooltipHtml('player-hand_' + i,  this.createTooltip(i, true));
			this.addTooltipHtml('opponent-hand_' + i, this.createTooltip(i, false));
		}
		this.addTooltipHtml('player-hand_5', `<div id="redSpecialTooltip">${_('Waiting to draw starting cards...')}</div>`);
		this.addTooltipHtml('opponent-hand_5', `<div id="blueSpecialTooltip">${_('Waiting to draw starting cards...')}</div>`);

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
			const element = $('samurai_field_position_' + index);
			if (element) element.classList.remove('highlight');
			else break;
			index++;
		}
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
				}

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

				this.addActionButton('confirmSelectionButton', _('Confirm'), (e: any) => {
					console.log('Confirming selection', e);
					
					if (this.playerPlayed0() == 0 && this.playerPlayed1() == 0) {
						return;
					}

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

	card_tooltips: { title: string, type: 'move' | 'attack' | 'special', desc: string, src: string }[] =
	[{
		title: 'Approach/Retreat',
		type: 'move',
		desc: 'Move 1 space forward (top) or backward (bottom).',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Charge/Change Stance',
		type: 'move',
		desc: 'Move 2 spaces forward (top) or change stance (bottom).',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'High Strike',
		type: 'attack',
		desc: 'When in Heaven stance, attack the second space in front.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Low Strike',
		type: 'attack',
		desc: 'When in Earth stance, attack the space in front.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Balanced Strike',
		type: 'attack',
		desc: 'Attack the space currently occupied.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Kesa Strike',
		type: 'special',
		desc: 'When in Heaven stance, attack the space in front and currently occupied. Switch to Earth stance.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Zan-Tetsu Strike',
		type: 'special',
		desc: 'When in Earth stance, attack the second and third space in front. Switch to Heaven stance.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}, {
		title: 'Counterattack',
		type: 'special',
		desc: 'If the opponent lands an attack, they take damage instead.',
		src: g_gamethemeurl + 'img/dynamic/player-card-approach.jpg'
	}]

	createTooltip(x: number, play_flavor: boolean)
	{
		const tooltip = this.card_tooltips[x];
		if (!tooltip) return '';

		return this.format_block('jstpl_tooltip', {
			title: _(tooltip.title),
			type: tooltip.type,
			typeName: _(tooltip.type == 'move' ? 'Movement' : tooltip.type == 'attack' ? 'Attack' : 'Special'),
			desc: _(tooltip.desc),
			src: tooltip.src,
			flavor: play_flavor ? _('Click when playing cards to add/remove from the play area.') : ''
		});
	}

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

		const player_area = $('play-area');

		const card_names: string[] = [
			'approach',
			'charge',
			'high-strike',
			'low-strike',
			'balanced-strike',
			'retreat',
			'change-stance',
			'special'
		];
		
		player_area.className = '';

		const updatePlayed = (target: Element, card: number, player: boolean) => {
			if (!(target instanceof HTMLElement))
				return;

			let src: string | null = null;

			if (player && card != 0)
				player_area.classList.add(card_names[card - 1] + "-played");

			target.classList.remove('bottomPicked');

			let prefix = player ? 'player-card-' : 'opponent-card-'
			switch (card) {
				case 0: break;
				case 1: src = this.formatSVGURL(prefix + 'approach'); break;
				case 2: src = this.formatSVGURL(prefix + 'charge'); break;
				case 3: src = this.formatSVGURL(prefix + 'high-strike'); break;
				case 4: src = this.formatSVGURL(prefix + 'low-strike'); break;
				case 5: src = this.formatSVGURL(prefix + 'balanced-strike'); break;
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

		updatePlayed($('player_played_0'), this.playerPlayed0(), true);
		updatePlayed($('player_played_1'), this.playerPlayed1(), true);
		updatePlayed($('opponent_played_0'), this.opponentPlayed0(), false);
		updatePlayed($('opponent_played_1'), this.opponentPlayed1(), false);

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
		this.placeOnObject('player_samurai', 'battlefield_position_' + this.playerPosition());
		this.placeOnObject('opponent_samurai', 'battlefield_position_' + (battlefieldSize - this.opponentPosition() + 1));

		this.setCardSlot('player_samurai', this.stanceURL(true));
		this.setCardSlot('opponent_samurai', this.stanceURL(false));

		player_area.classList.add('player-' + (this.playerStance() == 0 ? 'heaven' : 'earth'));
		player_area.classList.add('opponent-' + (this.opponentStance() == 0 ? 'heaven' : 'earth'));
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