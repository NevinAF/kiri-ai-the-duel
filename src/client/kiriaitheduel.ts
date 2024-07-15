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
	actionQueue = new PlayerActionQueue(this);
	confirmationTimeout = new ConfirmationTimeout('leftright_page_wrapper');

	//
	// #region Gamedata Wrappers
	//

	isRedPlayer(): boolean { return this.gamedatas.players[this.player_id]!.color == 'e54025'; }
	redPrefix(): string { return this.isRedPlayer() ? 'my' : 'opponent'; }
	bluePrefix(): string { return this.isRedPlayer() ? 'opponent' : 'my'; }
	redPosition(): number { return (this.gamedatas.battlefield >> 0) &0b1111; }
	redStance(): number { return (this.gamedatas.battlefield >> 4) &0b1; }
	bluePosition(): number { return (this.gamedatas.battlefield >> 5) &0b1111; }
	blueStance(): number { return (this.gamedatas.battlefield >> 9) &0b1; }
	redHit(): boolean { return ((this.gamedatas.battlefield >> 14) & 0b1) == 1; }
	blueHit(): boolean { return ((this.gamedatas.battlefield >> 15) & 0b1) == 1; }
	battlefieldType(): number { return (this.gamedatas.battlefield >> 16) & 0b111; }
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

	redPlayerId(): number { return this.isRedPlayer() ? this.player_id : +Object.keys(this.gamedatas.players).find(i => i != (this.player_id as any))!; }
	bluePlayerId(): number { return this.isRedPlayer() ? +Object.keys(this.gamedatas.players).find(i => i != (this.player_id as any))! : this.player_id; }

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

		console.log( this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id], this.gamedatas.players[this.player_id]!.color, this.gamedatas.players[this.player_id]!.color == 'e54025');

		this.serverCards = gamedatas.cards;

		// Setup game notifications to handle (see "setupNotifications" method below)
		this.setupNotifications();

		const placeCard = (id: string, target: string, offset: number): HTMLElement => {
			if ($(target) == null) {
				console.error('Div "' + target + '" does not exist.');
				// @ts-ignore
				return null;
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
			let red  = placeCard("redHand_" + i, this.redPrefix() + 'Hand_' + i, i);
			let blue = placeCard("blueHand_" + i, this.bluePrefix() + 'Hand_' + i, i + 5);

			this.addTooltipHtml(red.parentElement!.id,  this.createTooltip(i, this.isRedPlayer()));
			this.addTooltipHtml(blue.parentElement!.id, this.createTooltip(i, !this.isRedPlayer()));
		}

		let redSP  = placeCard("redHand_" + 5, this.redPrefix() + 'Hand_' + 5, 13);
		let blueSP = placeCard("blueHand_" + 5, this.bluePrefix() + 'Hand_' + 5, 13);

		this.addTooltipHtml(redSP.parentElement!.id, `<div id="redSpecialTooltip">${_('Waiting to draw starting cards...')}</div>`);
		this.addTooltipHtml(blueSP.parentElement!.id, `<div id="blueSpecialTooltip">${_('Waiting to draw starting cards...')}</div>`);
		

		// Add tooltips to the cards

		for (let i = 0; i < 2; i++)
		{
			let div: HTMLElement;

			div = placeCard("redPlayed_" + i, this.redPrefix() + 'Played_' + i, 13);
			div = placeCard("bluePlayed_" + i, this.bluePrefix() + 'Played_' + i, 13);

			$<HTMLElement>('redPlayed_' + i).style.display = 'none';
			$<HTMLElement>('bluePlayed_' + i).style.display = 'none';
		}

		for (let id of ['red_samurai', 'blue_samurai'])
			dojo.place(this.format_block('jstpl_card', {
				src: g_gamethemeurl + 'img/placeholder_SamuraiCards.jpg',
				x: 0,
				id: id + '_card'
			}), id);

		const battlefieldType = this.battlefieldType();
		const battlefieldSize = battlefieldType == 1 ? 5 : 7;

		for (let i = 1; i <= battlefieldSize; i++)
		{
			dojo.place(this.format_block('jstpl_field_position', {
				id: i,
			}), $('battlefield'));
		}

		if (!this.isRedPlayer())
			$<HTMLElement>('battlefield').style.flexDirection = 'column-reverse';

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
				const startingPositions = this.isRedPlayer() ? [4, 5, 6] : [2, 3, 4];
				for (let index of startingPositions) {
					let element = $('samurai_field_position_' + index);
					element.classList.add('highlight');
					// Add an onclick event to the ::after pseudo element
					this.setupHandles.push(dojo.connect(element, 'onclick', this, e =>
					{
						if (this.isRedPlayer()) {
							this.gamedatas.battlefield = (this.gamedatas.battlefield & ~(0b1111 << 0)) | (index << 0);
						}
						else {
							this.gamedatas.battlefield = (this.gamedatas.battlefield & ~(0b1111 << 5)) | (index << 5);
						}
						this.instantMatch();
					}));
				}

				// Add an onclick event to the samurai to flip the stance:
				if (this.isRedPlayer()) {
					this.setupHandles.push(dojo.connect($('red_samurai'), 'onclick', this, e => {
						this.gamedatas.battlefield = this.gamedatas.battlefield ^ (1 << 4);
						this.instantMatch();
					}));
				}
				else {
					this.setupHandles.push(dojo.connect($('blue_samurai'), 'onclick', this, e => {
						this.gamedatas.battlefield = this.gamedatas.battlefield ^ (1 << 9);
						this.instantMatch();
					}));
				}

				this.addActionButton('confirmBattlefieldButton', _('Confirm'), async (e: any) => {
					console.log('Confirming selection', e);

					if (!this.checkAction('confirmedStanceAndPosition'))
						return;

					await this.confirmationTimeout.promise(e);

					this.ajaxAction('confirmedStanceAndPosition', {
							isHeavenStance: (this.isRedPlayer() ? this.redStance() : this.blueStance()) == 0,
							position: (this.isRedPlayer() ? this.redPosition() : this.bluePosition())
					});
					this.cleanupSetupBattlefield();
				});

				break;

			case "pickCards":

				this.addActionButton('confirmSelectionButton', _('Confirm'), (e: any) => {
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

	card_tooltips: { title: string, type: 'move' | 'attack' | 'special', desc: string }[] =
	[{
		title: 'Approach/Retreat',
		type: 'move',
		desc: 'Move 1 space forward (top) or backward (bottom).'
	}, {
		title: 'Charge/Change Stance',
		type: 'move',
		desc: 'Move 2 spaces forward (top) or change stance (bottom).'
	}, {
		title: 'High Strike',
		type: 'attack',
		desc: 'When in Heaven stance, attack the second space in front.'
	}, {
		title: 'Low Strike',
		type: 'attack',
		desc: 'When in Earth stance, attack the space in front.'
	}, {
		title: 'Balanced Strike',
		type: 'attack',
		desc: 'Attack the space currently occupied.'
	}, {
		title: 'Kesa Strike',
		type: 'special',
		desc: 'When in Heaven stance, attack the space in front and currently occupied. Switch to Earth stance.'
	}, {
		title: 'Zan-Tetsu Strike',
		type: 'special',
		desc: 'When in Earth stance, attack the second and third space in front. Switch to Heaven stance.'
	}, {
		title: 'Counterattack',
		type: 'special',
		desc: 'If the opponent lands an attack, they take damage instead.'
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
			src: g_gamethemeurl + 'img/tooltips.jpg',
			x: x / 0.07,
			flavor: play_flavor ? _('Click when playing cards to add/remove from the play area.') : ''
		});
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

		const updateCard = (target: Element, card: number, isRed: boolean) => {
			if (!(target instanceof HTMLElement))
				return;

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
				if (this.redDiscarded() - 1 == i) $('redHand_' + i).parentElement!.classList.add('discarded');
				else  $('redHand_' + i).parentElement!.classList.remove('discarded');

				if (this.blueDiscarded() - 1 == i) $('blueHand_' + i).parentElement!.classList.add('discarded');
				else  $('blueHand_' + i).parentElement!.classList.remove('discarded');
			}

			if (redPlayed.includes(i)) $('redHand_' + i).parentElement!.classList.add('played');
			else  $('redHand_' + i).parentElement!.classList.remove('played');

			if (bluePlayed.includes(i)) $('blueHand_' + i).parentElement!.classList.add('played');
			else  $('blueHand_' + i).parentElement!.classList.remove('played');
		}

		if (this.redSpecialCard() != 0 || this.blueSpecialCard() != 0) {

			const redTarget = $('redHand_5').parentElement!;
			const blueTarget = $('blueHand_5').parentElement!;

			const notPlayedTooltip = (cardVisible: number) => {
				const pair = cardVisible == 1 ? [6, 7] : cardVisible == 2 ? [5, 7] : [5, 6];
				return '<div class="tooltip-desc">' + _('Opponent has not played their special card yet. It can be one of the following:') + '</div><div class="tooltip-two-column">' + this.createTooltip(pair[0]!, false) + this.createTooltip(pair[1]!, false) + '</div>';
			};

			if (this.redSpecialCard() == 0) {
				// Add both tooltips to the red special card
				this.addTooltipHtml(redTarget.id, notPlayedTooltip(this.blueSpecialCard()));
			}
			else {
				this.addTooltipHtml(redTarget.id, this.createTooltip(4 + this.redSpecialCard(), this.isRedPlayer()));
			}

			if (this.blueSpecialCard() == 0) {
				// Add both tooltips to the blue special card
				this.addTooltipHtml(blueTarget.id, notPlayedTooltip(this.redSpecialCard()));
			}
			else {
				this.addTooltipHtml(blueTarget.id, this.createTooltip(4 + this.blueSpecialCard(), !this.isRedPlayer()));
			}
		}

		$<HTMLElement>('redHand_5').style.objectPosition = ((
			this.redSpecialCard() == 0 ? 13 : this.redSpecialCard() + 9
		) / 0.13) + '% 0px';
		if (this.redSpecialPlayed()) $('redHand_5').parentElement!.classList.add('discarded');
		else $('redHand_5').parentElement!.classList.remove('discarded');

		$<HTMLElement>('blueHand_5').style.objectPosition = ((
			this.blueSpecialCard() == 0 ? 13 : this.blueSpecialCard() + 9
		) / 0.13) + '% 0px';
		if (this.blueSpecialPlayed()) $('blueHand_5').parentElement!.classList.add('discarded');
		else $('blueHand_5').parentElement!.classList.remove('discarded');

		// Set the positions and stance
		const placeSamurai = (stance: number, position: number, isRed: boolean) => {
			let rot = stance == 0 ? -45 : 135;
			let posElement = $<HTMLElement>('samurai_field_position_' + position);
			let transform: string;

			if (posElement) {
				this.placeOnObject((isRed ? 'red' : 'blue') + '_samurai_offset', posElement);
				if (!this.isRedPlayer())
					transform = isRed ? 'translate(-95%, -11.5%) ' : 'translate(95%, 11.5%) ';
				else transform = isRed ? 'translate(95%, 11.5%) scale(-1, -1) ' : 'translate(-95%, -11.5%) scale(-1, -1) ';
			}
			else {
				rot += 45;
				transform = 'translate(45%, ' + ((this.isRedPlayer() ? isRed : !isRed) ? "" : "-") + '75%) ';
			}

			$<HTMLElement>((isRed ? 'red' : 'blue') + '_samurai').style.transform = transform + 'rotate(' + rot + 'deg)';
		}

		placeSamurai(this.redStance(), this.redPosition(), true);
		placeSamurai(this.blueStance(), this.bluePosition(), false);

		let redSprite = !this.redHit() ? 0 : 2;
		let blueSprite = !this.blueHit() ? 1 : 3;
		$<HTMLElement>('red_samurai_card').style.objectPosition = (redSprite / 0.03) + '% 0px';
		$<HTMLElement>('blue_samurai_card').style.objectPosition = (blueSprite / 0.03) + '% 0px';

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

	serverCards: number = 0;
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

		// This should be good enough to check all actions.
		if (!this.checkAction('pickedFirst', true)) {
			console.log('Not your turn!');
			return;
		}

		if (this.actionQueue.queue?.some(a => a.action === 'confirmedCards' && a.state === 'inProgress')) {
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

		let action: "pickedFirst" | "pickedSecond" | null = null;
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

	notif_instantMatch = (notif: NotifFrom<GameStateData & { redScore?: number, blueScore?: number }>) =>
	{
		console.log('notif_placeAllCards', notif);
		if (this.gamedatas.gamestate.name !== 'setupBattlefield' || notif.type !== 'battlefield setup')
			this.gamedatas.battlefield = notif.args.battlefield;
		this.serverCards = notif.args.cards;
		this.updateCardsWithPredictions();
		this.instantMatch();

		if (notif.args.redScore !== undefined)
			this.scoreCtrl[this.redPlayerId()]?.toValue(notif.args.redScore);
		if (notif.args.blueScore !== undefined)
			this.scoreCtrl[this.bluePlayerId()]?.toValue(notif.args.blueScore);
	}

	//
	// #endregion
	//
}

dojo.setObject( "bgagame.kiriaitheduel", KiriaiTheDuel );
(window.bgagame ??= {}).kiriaitheduel = KiriaiTheDuel;