/// <reference path="types/index.d.ts" />

abstract class GameExtended extends Game {
	/**
	 * This method will attach mobile to a new_parent without destroying, unlike original attachToNewParent which destroys mobile and
	 * all its connectors (onClick, etc)
	 */
	attachToNewParentNoDestroy(mobile_in: string | HTMLElement, new_parent_in: string | HTMLElement, relation, place_position): dojo.DomGeometryBox
	{
		const mobile = $(mobile_in);
		const new_parent = $(new_parent_in);

		var src = dojo.position(mobile);
		if (place_position)
			mobile.style.position = place_position;
		dojo.place(mobile, new_parent, relation);
		mobile.offsetTop;//force re-flow
		var tgt = dojo.position(mobile);
		var box = dojo.marginBox(mobile);
		var cbox = dojo.contentBox(mobile);

		if (!box.t || !box.l || !box.w || !box.h || !cbox.w || !cbox.h) {
			console.error("attachToNewParentNoDestroy: box or cbox has an undefined value (t-l-w-h). This should not happen.");
			return box;
		}

		var left = box.l + src.x - tgt.x;
		var top = box.t + src.y - tgt.y;

		mobile.style.position = "absolute";
		mobile.style.left = left + "px";
		mobile.style.top = top + "px";
		box.l += box.w - cbox.w;
		box.t += box.h - cbox.h;
		mobile.offsetTop;//force re-flow
		return box;
	}

	ajaxAction<T extends keyof PlayerActions>(action: T, args: PlayerActions[T] & { lock?: boolean }, callback?: (error: boolean, errorMessage?: string, errorCode?: number) => void, ajax_method?: 'post' | 'get'): void
	{
		if (!args) {
			args = {} as any;
		}

		if (args.lock === undefined)
			args.lock = true;
	
		if (this.checkAction(action)) {
			this.ajaxcall<T>(
				"/" + this.game_name + "/" + this.game_name + "/" + action + ".html",
				args as PlayerActions[T] & { lock: boolean }, this,
				() => { }, // No operation on success. Use the callback parameter instead.
				callback,
				ajax_method);
		}
	}

	subscribeNotif<T extends keyof NotifTypes>(event: T, callback: (notif: Notif<NotifTypes[T]>) => void): dojo.Handle
	{
		return dojo.subscribe(event, this, callback);
	}
}