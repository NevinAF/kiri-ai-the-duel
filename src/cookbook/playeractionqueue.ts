/// <reference path="../types/index.d.ts" />

interface PlayerActionQueueItem
{
	action: keyof PlayerActions,
	args: PlayerActions[keyof PlayerActions],
	callback?: (error: boolean, errorMessage?: string, errorCode?: number) => any,
	timestamp: number
}

/**
 * The Player Action Queue module is intended to make user side actions more responsive by queueing actions while the player is locked out of making further actions. This should be used when the player is making actions that we want to share with other clients but we aren't planing on removing the player from the active state. This is purely for responsiveness and requires a lot of setup to work properly:
 * - The server must have actions for all actions the player can make, rather than using a client side state to manage the player's actions.
 * - The other clients must be able to update based on any possible player's actions.
 * - If you plan on having the player be able to undo their actions, you must have a way to undo the action on the server side because the server is updated with each partial action.
 * 
 * This is a WIP and is not fully implemented yet.
 */
class PlayerActionQueue
{
	private gamegui: Gamegui;
	private queue: PlayerActionQueueItem[];
	private postingTimeout: number | null;

	public timout: number = 6000;
	public static timeoutErrorCode: number = -513;
	public static removedErrorCode: number = -513;

	private currentItem: PlayerActionQueueItem | null;

	public actionInProgress(): PlayerActionQueueItem | null
	{
		return this.currentItem;
	}

	/**
	 * @param {Gamegui} gamegui The gamegui object.
	 */
	constructor(gamegui: Gamegui)
	{
		this.gamegui = gamegui;
		this.postingTimeout = null;
		this.queue = [];
		this.currentItem = null;
	}

	public enqueue<T extends keyof PlayerActions>(action: T, args: PlayerActions[T], callback?: (error: boolean, errorMessage?: string, errorCode?: number) => any)
	{
		this.queue.push({ action, args, timestamp: Date.now(), callback: callback });
		this.postActions();
	}

	public contains(action: keyof PlayerActions): boolean
	{
		return this.queue.some((a) => a.action === action);
	}

	public filterOut(action: keyof PlayerActions): boolean
	{
		let lastLength = this.queue.length;
		this.queue = this.queue.filter((a) => {
			if (a.action !== action)
				return true;

			a.callback?.(true, 'Action was removed from queue', PlayerActionQueue.removedErrorCode);
			return false;
		});
		return lastLength !== this.queue.length;
	}

	private postActions()
	{
		if (this.postingTimeout !== null)
		{
			clearTimeout(this.postingTimeout);
			this.postingTimeout = null;
		}

		console.log('Posting actions:', this.queue);

		if (this.queue.length == 0)
			return;

		
		let action = this.queue[0];
		console.log('Posting action:', action.action, action.args, this.gamegui.checkLock(true), this.gamegui.checkAction(action.action, true));
		
		if (this.gamegui.checkAction(action.action, true))
		{
			this.queue.shift();

			this.currentItem = action;

			// @ts-ignore
			action.args.lock = true;
			this.gamegui.ajaxcall(
				`/${this.gamegui.game_name}/${this.gamegui.game_name}/${action.action}.html`,
				action.args as any,
				this.gamegui,
				() => { },
				(error: boolean, errorMessage?: string, errorCode?: number) => {
					this.currentItem = null;
					action.callback?.(error, errorMessage, errorCode);
					this.postActions();
				}
			);
			return;
		}

		if (action.timestamp + this.timout < Date.now())
		{
			if (action.callback)
				action.callback(true, 'Action took too long to post', PlayerActionQueue.timeoutErrorCode);
			else
				console.warn('PlayerActionQueue: action took too long to post, discarding action:', action.action, action.args);
			this.queue.shift();
			this.postActions();
			return;
		}

		this.postingTimeout = setTimeout(this.postActions.bind(this), 100);
	}
}