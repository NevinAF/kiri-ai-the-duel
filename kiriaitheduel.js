var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/// <amd-module name="cookbook/common"/>
define("cookbook/common", ["require", "exports", "dojo", "ebg/core/common"], function (require, exports, dojo) {
    "use strict";
    /**
     * A typescript mixin function that add all `Common` methods to the given `Gamegui` class. The `common` module is a collection of wrappers and Gamegui-like methods that are directly defined on the cookbook page, and are recommended to be used in almost all games (sometimes depending on depth/complexity of the game).
     * @see README.md for more information on using cookbook mixins.
     */
    var CommonMixin = function (Base) { return /** @class */ (function (_super) {
        __extends(Common, _super);
        function Common() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * This method will attach mobile to a new_parent without destroying, unlike original attachToNewParent which destroys mobile and all its connectors (onClick, etc).
         */
        Common.prototype.attachToNewParentNoDestroy = function (mobile_in, new_parent_in, relation, place_position) {
            var mobile = $(mobile_in);
            var new_parent = $(new_parent_in);
            if (!mobile || !new_parent) {
                console.error("attachToNewParentNoDestroy: mobile or new_parent was not found on dom.", mobile_in, new_parent_in);
                return { l: NaN, t: NaN, w: NaN, h: NaN };
            }
            var src = dojo.position(mobile);
            if (place_position)
                mobile.style.position = place_position;
            dojo.place(mobile, new_parent, relation);
            mobile.offsetTop; //force re-flow
            var tgt = dojo.position(mobile);
            var box = dojo.marginBox(mobile);
            var cbox = dojo.contentBox(mobile);
            if (!box.t || !box.l || !box.w || !box.h || !cbox.w || !cbox.h) {
                console.error("attachToNewParentNoDestroy: box or cbox has an undefined value (t-l-w-h). This should not happen.", box, cbox);
                return box;
            }
            var left = box.l + src.x - tgt.x;
            var top = box.t + src.y - tgt.y;
            mobile.style.position = "absolute";
            mobile.style.left = left + "px";
            mobile.style.top = top + "px";
            box.l += box.w - cbox.w;
            box.t += box.h - cbox.h;
            mobile.offsetTop; //force re-flow
            return box;
        };
        /**
         * Typed `ajaxcallWrapper` method recommended by the BGA wiki. This method removes obsolete parameters, simplifies action url, and auto adds the lock parameter to the args if needed. This significantly reduces the amount of code needed to make an ajax call and makes the parameters much more readable.
         * @param action The action to be called.
         * @param args The arguments to be passed to the server for the action. This does not need to include the `lock` parameter, as it will be added automatically if needed.
         * @param callback The callback to be called once a response is received from the server.
         * @param ajax_method The method to use for the ajax call. See {@link CoreCore.ajaxcall} for more information.
         * @returns True if the action was called, false if the action was not called because it was not a valid player action (see {@link Gamegui.checkAction}).
         * @example
         * // Arguments must match the arguments of the PlayerAction 'myAction'.
         * this.ajaxAction( 'myAction', { myArgument1: arg1, myArgument2: arg2 }, (is_error) => {} );
         */
        Common.prototype.ajaxAction = function (action, args, callback, ajax_method) {
            if (!this.checkAction(action))
                return false;
            if (!args)
                args = {};
            // @ts-ignore - Prevents error when no PlayerActions are defined.
            if (!args.lock)
                args.lock = true;
            this.ajaxcall("/".concat(this.game_name, "/").concat(this.game_name, "/").concat(action, ".html"), 
            // @ts-ignore - Prevents error when no PlayerActions are defined and stating that 'lock' might not be defined.
            args, this, function () { }, callback, ajax_method);
            return true;
        };
        /**
         * Slightly simplified version of the dojo.subscribe method that is typed for notifications.
         * @param event The event that you want to subscribe to.
         * @param callback The callback to be called when the event is published. Note that the callback can be the same callback for multiple events as long as the expected parameters for the notifications are the same.
         * @returns A handle that can be used to unsubscribe from the event. Not necessary to hold onto this handle if the subscription lasts for the lifetime of the game (or browser lifetime).
         * @example
         * setupNotifications() {
         * 	this.subscribeNotif('cardPlayed', this.notif_cardPlayed);
         * }
         * // With any of the possible argument types for notifications
         * notif_cardPlayed(notif: AnyNotif) { ... }
         * // With manual argument type (must match a subset of the arguments for the 'cardPlayed' notification type)
         * notif_cardPlayed(notif: Notif<{ player_id: number, card_id: number }>) { ... }
         * // With defined argument type
         * notif_cardPlayed(notif: Notif<NotifTypes['cardPlayed']>) { ... }
         */
        Common.prototype.subscribeNotif = function (event, callback) {
            return dojo.subscribe(event, this, callback);
        };
        /**
         * This method can be used instead of addActionButton, to add a button which is an image (i.e. resource). Can be useful when player
         * need to make a choice of resources or tokens.
         * @param id The id of the button to be added.
         * @param label The label to be displayed on the button.
         * @param method The method to be called when the button is clicked.
         * @param destination The destination to be used for the button. See {@link Gamegui.addActionButton} for more information.
         * @param blinking If the button should blink when added. See {@link Gamegui.addActionButton} for more information.
         * @param color The color of the button. See {@link Gamegui.addActionButton} for more information.
         * @param tooltip The tooltip to be displayed when hovering over the button.
         * @returns The HTMLElement of the button that was added. Null if the button was not found on the dom.
         */
        Common.prototype.addImageActionButton = function (id, label, method, destination, blinking, color, tooltip) {
            if (!color)
                color = "gray";
            this.addActionButton(id, label, method, destination, blinking, color);
            var div = $(id);
            if (div === null) {
                console.error("addImageActionButton: id was not found on dom", id);
                return null;
            }
            if (!(div instanceof HTMLElement)) {
                console.error("addImageActionButton: id was not an HTMLElement", id, div);
                return null;
            }
            dojo.style(div, "border", "none");
            dojo.addClass(div, "shadow bgaimagebutton");
            if (tooltip) {
                dojo.attr(div, "title", tooltip);
            }
            return div;
        };
        /** If the current game should never be interactive, i.e., the game is not in a playable/editable state. Returns true for spectators, instant replay (during game), archive mode (after game end). */
        Common.prototype.isReadOnly = function () {
            return this.isSpectator || typeof g_replayFrom !== 'undefined' || g_archive_mode;
        };
        /** Scrolls a target element into view after a delay. If the game is in instant replay mode, the scroll will be instant. */
        Common.prototype.scrollIntoViewAfter = function (target, delay) {
            if (this.instantaneousMode)
                return;
            var target_div = $(target);
            if (target_div === null) {
                console.error("scrollIntoViewAfter: target was not found on dom", target);
                return;
            }
            if (typeof g_replayFrom != "undefined" || !delay || delay <= 0) {
                target_div.scrollIntoView();
                return;
            }
            setTimeout(function () {
                target_div.scrollIntoView({ behavior: "smooth", block: "center" });
            }, delay);
        };
        /** Gets an html span with the text 'You' formatted and highlighted to match the default styling for `descriptionmyturn` messages with the word `You`. This does preform language translations. */
        Common.prototype.divYou = function () {
            return this.divColoredPlayer(this.player_id, __("lang_mainsite", "You"));
        };
        /**
         * Gets an html span with the text `text` highlighted to match the default styling for the given player, like with the `description` messages that show on the title card.
         * @param player_id The player id to get the color for.
         * @param text The text to be highlighted. If undefined, the {@link Player.name} will be used instead.
         */
        Common.prototype.divColoredPlayer = function (player_id, text) {
            var player = this.gamedatas.players[player_id];
            if (player === undefined)
                return "--unknown player--";
            return "<span style=\"color:".concat(player.color, ";background-color:#").concat(player.color_back, ";\">").concat(text !== null && text !== void 0 ? text : player.name, "</span>");
        };
        /**
         * Sets the description of the main title card to the given html. This change is only visual and will be replaced on page reload or when the game state changes.
         * @param html The html to set the main title to.
         */
        Common.prototype.setMainTitle = function (html) {
            $('pagemaintitletext').innerHTML = html;
        };
        /**
         * Sets the description of the main title card to the given string, formatted using the current {@link CurrentStateArgs.args}. This should only be changed when it is this players turn and you want to display a client only change while the client is making a decision.
         * @param description The string to set the main title to.
         */
        Common.prototype.setDescriptionOnMyTurn = function (description) {
            this.gamedatas.gamestate.descriptionmyturn = description;
            var tpl = dojo.clone(this.gamedatas.gamestate.args);
            if (tpl === null)
                tpl = {};
            if (this.isCurrentPlayerActive() && description !== null)
                tpl.you = this.divYou();
            var title = this.format_string_recursive(description, tpl);
            this.setMainTitle(title !== null && title !== void 0 ? title : '');
        };
        return Common;
    }(Base)); };
    return CommonMixin;
});
define("cookbook/nevinAF/titlelocking", ["require", "exports", "dojo"], function (require, exports, dojo) {
    "use strict";
    var TitleLockingMixin = function (Base) { return /** @class */ (function (_super) {
        __extends(TitleLocking, _super);
        function TitleLocking() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Returns a deep clone of the given element with all ids removed (maintaining any styling if needed).
         * @param element The element to clone.
         * @param maintainEvents The events to maintain when cloning the element. A 'maintained' event is one that is automatically called when the copied element is clicked (so both elements receive the event).
         * @returns The cloned element.
         */
        TitleLocking.prototype.cloneHTMLWithoutIds = function (element) {
            var maintainEvents = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                maintainEvents[_i - 1] = arguments[_i];
            }
            var cleanNode = function (el) {
                var id = el.getAttribute('id');
                el.removeAttribute('id');
                if (el instanceof HTMLElement && id) {
                    var source = $(id);
                    if (source) {
                        var computedStyle = getComputedStyle(source);
                        for (var _i = 0, _a = ['height', 'top', 'display']; _i < _a.length; _i++) {
                            var property = _a[_i];
                            // @ts-ignore: The property must be a valid property of the element
                            el.style[property] = computedStyle.getPropertyValue(property);
                        }
                        var _loop_1 = function (event_1) {
                            el.addEventListener('click', function (e) {
                                var _a, _b;
                                // @ts-ignore: The event must be the same type as the function call, so it's safe to assume it's the same
                                (_b = (_a = $(id))[event_1]) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                            });
                        };
                        for (var _b = 0, maintainEvents_1 = maintainEvents; _b < maintainEvents_1.length; _b++) {
                            var event_1 = maintainEvents_1[_b];
                            _loop_1(event_1);
                        }
                    }
                }
                for (var _c = 0, _d = Array.from(el.children); _c < _d.length; _c++) {
                    var child = _d[_c];
                    cleanNode(child);
                }
            };
            var clone = element.cloneNode(true);
            cleanNode(clone);
            return clone;
        };
        /** Creates the title lock element if it doesn't exist and returns it. This also creates the 'display_none' class which is used to force override the display property of an element (and prevents it from being updated / interfering with updates). */
        TitleLocking.prototype.createTitleLock = function () {
            var _a;
            if (this.titlelock_element)
                return this.titlelock_element;
            var tags = document.getElementsByTagName('head');
            if (tags.length == 0 || !tags[0])
                throw new Error('There are no head tags on this page, which should never happen.');
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.display_none { display: none !important; }';
            tags[0].appendChild(style);
            var titlelockElement = document.createElement('div');
            titlelockElement.id = 'titlelock_wrap';
            titlelockElement.className = 'roundedboxinner';
            titlelockElement.style.display = 'none';
            (_a = document.getElementById('page-title')) === null || _a === void 0 ? void 0 : _a.appendChild(titlelockElement);
            return this.titlelock_element = titlelockElement;
        };
        /** Returns whether the title is currently locked. */
        TitleLocking.prototype.isTitleLocked = function () {
            return (this.titlelock_element != undefined) && this.titlelock_element.childElementCount > 0;
        };
        /**
         * Locks the title banner using whatever the current banner title is (by creating a pseudo clone). This does nothing when the banner is already locked.
         * @param target The target element to lock. If undefined, the first visible element of `pagemaintitle_wrap` or `gameaction_status_wrap` is used.
         */
        TitleLocking.prototype.lockTitle = function (target) {
            if (this.isTitleLocked())
                return;
            console.log('Locking title');
            this.pushTitleLock(target);
        };
        /** Locks the title banner with the given status. This will remove all locks before updating the status. Optimized such that updating the status does not recreate the element. */
        TitleLocking.prototype.lockTitleWithStatus = function (status) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            var statusElement = document.getElementById('titlelock_status_text');
            if (this.titlelock_element.childElementCount === 1 && statusElement) {
                statusElement.innerHTML = status;
                return;
            }
            this.titlelock_element.innerHTML =
                '<div style="display:inline-block; padding-left: 22px; position:relative;">\
				<img src="https://studio.boardgamearena.com:8084/data/themereleases/240320-1000/img/logo/waiting.gif" style="width:22px; height: 22px; position:absolute; left:-22px;" class="imgtext">\
				<span id="titlelock_status_text">' + status + '</span>\
			</div>';
        };
        /** Locks the title banner with the given HTML. This will remove all locks before updating the HTML. */
        TitleLocking.prototype.lockTitleWithHTML = function (html) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            if (html instanceof HTMLElement) {
                this.titlelock_element.innerHTML = '';
                this.titlelock_element.appendChild(html);
            }
            else {
                this.titlelock_element.innerHTML = html;
            }
            $('pagemaintitle_wrap').classList.add('display_none');
            $('gameaction_status_wrap').classList.add('display_none');
            this.titlelock_element.style.display = 'block';
        };
        /**
         * Pushes a new title lock based on the current title onto the title stack.
         * @param target The target element to lock. If undefined, the first visible element of `pagemaintitle_wrap` or `gameaction_status_wrap` is used.
         */
        TitleLocking.prototype.pushTitleLock = function (target) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            var elementCount = this.titlelock_element.childElementCount;
            if (elementCount != 0) {
                // Get the last child element and add a 'copycount' attribute to it
                var lastChild = this.titlelock_element.lastElementChild;
                lastChild.setAttribute('copycount', (parseInt(lastChild.getAttribute('copycount') || '0') + 1).toString());
                return;
            }
            var element;
            if (target) {
                element = document.getElementById(target);
            }
            else {
                element = document.getElementById('pagemaintitle_wrap');
                if (!element || element.style.display === 'none')
                    element = document.getElementById('gameaction_status_wrap');
            }
            if (element && element.style.display !== 'none') {
                var containter = document.createElement('div');
                for (var _i = 0, _b = Array.from(element.children); _i < _b.length; _i++) {
                    var child = _b[_i];
                    containter.appendChild(this.cloneHTMLWithoutIds.apply(this, __spreadArray([child], this.titleLock_maintainEvents || ['click'], false)));
                }
                this.pushTitleLockFromHTML(containter);
                return;
            }
        };
        /** Pushes a new title lock based on the given status onto the title stack. */
        TitleLocking.prototype.pushTitleLockFromStatus = function (status) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            this.pushTitleLockFromHTML('<div><div style="display:inline-block; padding-left: 22px; position:relative;">\
				<img src="https://studio.boardgamearena.com:8084/data/themereleases/240320-1000/img/logo/waiting.gif" style="width:22px; height: 22px; position:absolute; left:-22px;" class="imgtext">\
				<span>' + status + '</span>\
			</div></div>');
        };
        /** Pushes a new title lock based on the given HTML onto the title stack. */
        TitleLocking.prototype.pushTitleLockFromHTML = function (html) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            if (this.titlelock_element.childElementCount == 0) {
                $('pagemaintitle_wrap').classList.add('display_none');
                $('gameaction_status_wrap').classList.add('display_none');
                this.titlelock_element.style.display = 'block';
            }
            else {
                var lastChild = this.titlelock_element.lastElementChild;
                lastChild.style.display = 'none';
            }
            dojo.place(html, this.titlelock_element);
        };
        /** Removes the latest title lock from the stack. If there is only one lock on the stack, this is the same as {@link removeTitleLocks}. */
        TitleLocking.prototype.popTitleLock = function () {
            if (!this.titlelock_element)
                return false;
            if (this.popTitleLockWithoutUpdate() == false)
                return false;
            if (this.titlelock_element.childElementCount == 0) {
                $('pagemaintitle_wrap').classList.remove('display_none');
                $('gameaction_status_wrap').classList.remove('display_none');
                this.titlelock_element.style.display = 'none';
            }
            else {
                var lastChild = this.titlelock_element.lastElementChild;
                lastChild.style.display = 'block';
            }
            return true;
        };
        /** Removes all title locks and restores the title (to whatever content it should have, not necessarily the original). */
        TitleLocking.prototype.removeTitleLocks = function () {
            if (!this.titlelock_element)
                return;
            this.titlelock_element.innerHTML = '';
            $('pagemaintitle_wrap').classList.remove('display_none');
            $('gameaction_status_wrap').classList.remove('display_none');
            this.titlelock_element.style.display = 'none';
        };
        /** Internal function for optimization. This pops the latest title lock but does not check if the current title needs to be disabled nor if the latest lock needs to be displayed. */
        TitleLocking.prototype.popTitleLockWithoutUpdate = function () {
            if (!this.titlelock_element)
                return false;
            var lastChild = this.titlelock_element.lastElementChild;
            if (!lastChild)
                return false;
            var copyCount = parseInt(lastChild.getAttribute('copycount') || '0');
            if (copyCount > 0) {
                lastChild.setAttribute('copycount', (copyCount - 1).toString());
                return true;
            }
            lastChild.remove();
            return true;
        };
        return TitleLocking;
    }(Base)); };
    return TitleLockingMixin;
});
define("cookbook/nevinAF/playeractionqueue", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * @playeractionqueue BETA. The Player Action Queue module is intended to make user side actions more responsive by queueing actions while the player is locked out of making further actions. This should be used when the player is making actions that we want to share with other clients but we aren't planing on removing the player from the active state. This is purely for responsiveness and requires a lot of setup to work properly:
     * - The server must have actions for all actions the player can make, rather than using a client side state to manage the player's actions.
     * - The other clients must be able to update based on any possible player's actions.
     * - If you plan on having the player be able to undo their actions, you must have a way to undo the action on the server side because the server is updated with each partial action.
     *
     * @example
     * // Only the enqueueAjaxAction method is needed to implement this module; however, there are some additional properties and methods that can be used to help manage the behaviour and contents of the queue.
     * this.enqueueAjaxAction({ action: 'playCard', args: { card: 1 } });
     */
    var PlayerActionQueue = /** @class */ (function () {
        function PlayerActionQueue(game) {
            /**
             * The error codes used when an action fails to post (i.e. cannot be sent to the server).
             */
            this.actionErrorCodes = {
                /** The action was filtered out of the queue. */
                FILTERED_OUT: -512,
                /** The action took too long to post. */
                TIMEOUT: -513,
                /** The player is no longer active, and the action would've failed to post. */
                PLAYER_NOT_ACTIVE: -514,
                /** One of the action dependencies failed to post or returned with an error. */
                DEPENDENCY_FAILED: -515,
                /** The action was not possible from the current game state after all dependencies were evaluated. */
                ACTION_NOT_POSSIBLE: -516,
            };
            this.game = game;
        }
        /**
         * Enqueues an ajax call for a player action. This will queue the action to the {@link queue} and post the action asynchronously when there are no actions currently in progress. This is used to provide a responsive UI when the player is making multiple server action in a row.
         * @param refItem The action to enqueue.
         * @param dependencies The actions that need to be completed before this action can be posted. If any of these actions fail, this action will also fail. If any of these actions are not completed, this action will be queued until they are complete. If undefined, all previous actions in the queue act as a dependency. If defined, ALL possible non-dependency actions must not have race conditions when posted at the same time as this action (usually WAW). That is, any concurrent actions must not write to the same data else the server may rollback an action without warning. IN ADDITION, if this is a multiplayeractive state, the server must be able to handle all possible actions of any player at any time, usually resolved by having each players choices saved under separate data.
         * @returns The item that was added to the queue. This can be used to filter out the action from the queue if needed.
         * @example
         * // Enqueues an action to play a card. The action will be posted when there are no actions in progress and all previous actions are complete, meaning that the user can queue up multiple actions without waiting for the server to respond.
         * this.enqueueAjaxAction({ action: 'playCard', args: { card: 1 } });
         * @example
         * // Example of setting dependencies so multiple actions can run in parallel:
         * playCard = (slot: number, cardId: number) {
         * 	const filter = (item: PlayerActionQueueItem) => item.action === 'playCard' && item.args.slot === slot;
         *
         * 	// If playing a card in the same slot replaces the card, you can also prevent all unsent actions to prevent a queue buildup:
         * 	// this.filterActionQueue(filter);
         *
         * 	// All previous actions are a dependency, UNLESS it is also playing a card and the slot is the same.
         * 	const dependencies = this.actionQueue.filter(filter);
         * 	this.enqueueAjaxAction({ action: 'playCard', args: { slot, cardId } }, dependencies);
         * }
         *
         * playCard( 1, 37 ); // Posts immediately.
         * playCard( 2, 42 ); // Posts immediately.
         * playCard( 1, 05 ); // This will wait for the first playCard(1, 37) to complete before posting.
         */
        PlayerActionQueue.prototype.enqueueAjaxAction = function (refItem, dependencies) {
            var _this = this;
            var _a, _b, _c;
            if (this.queue === undefined)
                this.queue = [];
            // @ts-ignore - this prevents copying the item, while not adding ignores to all the statements.
            var item = refItem;
            item.dependencies = dependencies ?
                // Map the action names to the existing objects, and keep the objects as is.
                dependencies.flatMap(function (dep) { return (typeof dep === 'string') ?
                    _this.queue.filter(function (a) { return a.action === dep; }) : dep; }) :
                // Default, all actions previously added in the queue must be completed before this action can be sent.
                null;
            item.timestamp = Date.now();
            item.state = 'queued';
            this.queue.push(item);
            // @ts-ignore - Only works if the titlelocking module is added.
            if (this.isTitleLocked && !this.isTitleLocked()) {
                if (this.actionTitleLockingStrategy === 'sending')
                    // @ts-ignore - Only works if the titlelocking module is added.
                    (_a = this.lockTitleWithStatus) === null || _a === void 0 ? void 0 : _a.call(this, 'Sending move to server...');
                else if (this.actionTitleLockingStrategy === 'actionbar')
                    // @ts-ignore - Only works if the titlelocking module is added.
                    (_b = this.lockTitle) === null || _b === void 0 ? void 0 : _b.call(this, 'pagemaintitle_wrap');
                else if (this.actionTitleLockingStrategy === 'current')
                    // @ts-ignore - Only works if the titlelocking module is added.
                    (_c = this.lockTitle) === null || _c === void 0 ? void 0 : _c.call(this);
            }
            this.asyncPostActions();
            return item;
        };
        /**
         * Filters out any action with the matching action name from the queue. All actions that are removed will have their callback called with an error code matching {@link actionErrorCodes.FILTERED_OUT}.
         * @param action The action to filter out of the queue.
         * @returns True if any action was filtered out, false otherwise.
         */
        PlayerActionQueue.prototype.filterActionQueue = function (filter) {
            var _a;
            if (!this.queue)
                return false;
            var count = this.queue.length;
            for (var i = count - 1; i >= 0; i--) {
                var item = this.queue[i];
                if (item) {
                    if (item.state === 'inProgress')
                        continue;
                    if (typeof filter === 'string' ? item.action !== filter : !filter(item))
                        continue;
                    (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, true, 'Action was filtered out', this.actionErrorCodes.FILTERED_OUT);
                }
                this.queue.splice(i, 1);
            }
            return count !== this.queue.length;
        };
        /**
         * Tries to post the next action in the queue and creates an async function to if the next action is blocked in any way. Posting an action will remove that action from the queue and set it as the {@link actionInProgress}.
         *
         * All actions use a callback to recursively call this function to post the next action in the queue. That is, calling this function once will force the queue to empty over time. Whenever you enqueue an action, this function is automatically called.
         */
        PlayerActionQueue.prototype.asyncPostActions = function () {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (this.queue === undefined)
                return;
            if (this.actionPostTimeout) {
                clearTimeout(this.actionPostTimeout);
                this.actionPostTimeout = undefined;
            }
            if (!this.game.isCurrentPlayerActive()) {
                for (var _i = 0, _k = this.queue; _i < _k.length; _i++) {
                    var item = _k[_i];
                    item.state = 'failed';
                    (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, true, 'Player is no longer active', this.actionErrorCodes.PLAYER_NOT_ACTIVE);
                }
                this.queue = [];
            }
            var now = Date.now();
            var _loop_2 = function (i) {
                var item = this_1.queue[i];
                if (!item) {
                    console.warn("Found a null item in the action queue. This should not happen and is likely an internal error.");
                    this_1.queue.splice(i, 1);
                    i--;
                    return out_i_1 = i, "continue";
                }
                if (item.state === 'inProgress') {
                }
                // else state is 'queued'. Items are removed when they are complete or failed.
                else if ((item.dependencies === null && i == 0) ||
                    ((_b = item.dependencies) === null || _b === void 0 ? void 0 : _b.every(function (dep) { return dep.state === 'complete'; }))) {
                    item.state = 'inProgress';
                    this_1.game.ajaxcall("/".concat(this_1.game.game_name, "/").concat(this_1.game.game_name, "/").concat(item.action, ".html"), 
                    // @ts-ignore - Prevents error when no PlayerActions are defined and stating that 'lock' might not be defined.
                    item.args, this_1, function () { }, function (error, errorMessage, errorCode) {
                        var _a, _b;
                        item.state = error ? 'failed' : 'complete';
                        (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, error, errorMessage, errorCode);
                        // Filter this item AND all 'null' dependencies if this item failed.
                        _this.queue = (_b = _this.queue) === null || _b === void 0 ? void 0 : _b.filter(function (x) {
                            var _a;
                            // Make all queued actions with all dependencies (i.e. null) fail and remove them.
                            if (x.state === 'queued' && x.dependencies === null && error) {
                                x.state = 'failed';
                                (_a = x.callback) === null || _a === void 0 ? void 0 : _a.call(x, true, 'Dependency failed', _this.actionErrorCodes.DEPENDENCY_FAILED);
                                return false;
                            }
                            // Also remove this
                            return x !== item;
                        });
                        _this.asyncPostActions();
                    });
                    (_c = item.onSent) === null || _c === void 0 ? void 0 : _c.call(item);
                }
                else if ((_d = item.dependencies) === null || _d === void 0 ? void 0 : _d.some(function (dep) { return dep.state === 'failed'; })) {
                    item.state = 'failed';
                    (_e = item.callback) === null || _e === void 0 ? void 0 : _e.call(item, true, 'Dependency failed', this_1.actionErrorCodes.DEPENDENCY_FAILED);
                    this_1.queue.splice(i, 1);
                    i = 0; // Restarts the loop in case this was a dependency for a previous item.
                }
                else if (item.timestamp + ((_f = this_1.actionPostTimeout) !== null && _f !== void 0 ? _f : 10000) < now) {
                    item.state = 'failed';
                    (_g = item.callback) === null || _g === void 0 ? void 0 : _g.call(item, true, 'Action took too long to post', this_1.actionErrorCodes.TIMEOUT);
                    this_1.queue.splice(i, 1);
                    i = 0; // Restarts the loop in case this was a dependency for a previous item.
                }
                out_i_1 = i;
            };
            var this_1 = this, out_i_1;
            // Try to push all actions that do not have awaiting dependencies.
            for (var i = 0; i < this.queue.length; i++) {
                _loop_2(i);
                i = out_i_1;
            }
            if (this.queue.length === 0) {
                if (this.actionTitleLockingStrategy && this.actionTitleLockingStrategy !== 'none')
                    // @ts-ignore - Only works if the titlelocking module is added.
                    (_h = this.removeTitleLocks) === null || _h === void 0 ? void 0 : _h.call(this);
                return;
            }
            else if (this.queue.every(function (i) { return i.state != 'inProgress'; })) {
                // There are no actions in progress, but somehow there are still actions that cannot be sent!
                console.error("There is likely a circular dependency in the action queue. None of the actions can be sent: ", this.queue);
                for (var _l = 0, _m = this.queue; _l < _m.length; _l++) {
                    var item = _m[_l];
                    item.state = 'failed';
                    (_j = item.callback) === null || _j === void 0 ? void 0 : _j.call(item, true, 'Circular dependency', this.actionErrorCodes.DEPENDENCY_FAILED);
                }
                this.queue = [];
            }
        };
        return PlayerActionQueue;
    }());
    return PlayerActionQueue;
});
define("bgagame/kiriaitheduel", ["require", "exports", "dojo", "ebg/core/gamegui", "cookbook/common", "cookbook/nevinAF/titlelocking", "cookbook/nevinAF/playeractionqueue", "ebg/counter"], function (require, exports, dojo, Gamegui, CommonMixin, TitleLockingMixin, PlayerActionQueue) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
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
    var ConfirmationTimeout = /** @class */ (function () {
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
        function ConfirmationTimeout(cancel_area, options) {
            if (options === void 0) { options = {}; }
            var _a, _b, _c;
            /** The timeout for this current interaction. When the timeout completes, it call the callback. This is used to determine if the confirmation timeout is active. */
            this._timeout = null;
            this.setCancelArea(cancel_area);
            this.setAnimation(options.animation);
            if (options.durationPref !== undefined)
                this.setDurationPreference(options.durationPref);
            else
                this.setDuration((_a = options.duration) !== null && _a !== void 0 ? _a : 1000);
            this.setFollowMouse((_b = options.followMouse) !== null && _b !== void 0 ? _b : true);
            this.setCancelAreaClasses((_c = options.cancel_area_classes) !== null && _c !== void 0 ? _c : '');
        }
        ConfirmationTimeout.AddDefaultAnimationCSS = function () {
            if (ConfirmationTimeout._defaultAnimationCSSAdded)
                return;
            var style = document.createElement('style');
            style.innerHTML = ConfirmationTimeout._defaultAnimationCSS;
            document.head.appendChild(style);
            ConfirmationTimeout._defaultAnimationCSSAdded = true;
        };
        /** Turns off the confirmation timeout, canceling the callback and hiding all visuals. */
        ConfirmationTimeout.prototype.off = function () {
            if (this._timeout == null)
                return;
            clearTimeout(this._timeout);
            this._timeout = null;
            this._cancelElement.style.display = 'none';
            if (this._animationElement)
                this._animationElement.style.display = 'none';
        };
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
        ConfirmationTimeout.prototype.set = function (evt, callback) {
            var _this = this;
            if (this._timeout != null)
                this.off();
            if (this._duration <= 0) {
                callback();
                return;
            }
            this._cancelElement.style.display = "block";
            this._timeout = setTimeout(function () {
                _this.off();
                callback();
            }, this._duration);
            if (this._animationElement) {
                this._animationElement.style.display = "block";
                this.mouseMoved(evt);
            }
        };
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
        ConfirmationTimeout.prototype.promise = function (evt) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.set(evt, resolve);
            });
        };
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
        ConfirmationTimeout.prototype.add = function (element, callback) {
            var _this = this;
            if (!this._listeners)
                this._listeners = new Map();
            var listener = function (evt) {
                _this.set(evt, callback);
            };
            if (typeof element == 'string')
                element = document.getElementById(element);
            if (element) {
                this._listeners.set(element, listener);
                element.addEventListener('click', listener);
                return true;
            }
            return false;
        };
        /**
         * Removes the click listener from the element (all listeners if multiple are set on this element).
         * @param element The element to remove the listener from. If a string, it will be used as an id to find the element. If falsy or not found, nothing will happen.
         * @returns True if the listener was removed, false if the element was not found or no listener was set.
         * @example
         * ```typescript
         * confirmationTimeout.remove('button');
         */
        ConfirmationTimeout.prototype.remove = function (element) {
            if (!this._listeners)
                return false;
            if (typeof element == 'string')
                element = document.getElementById(element);
            if (element) {
                var listener = this._listeners.get(element);
                if (listener) {
                    do {
                        element.removeEventListener('click', listener);
                        this._listeners.delete(element);
                    } while (listener = this._listeners.get(element));
                    return true;
                }
            }
            return false;
        };
        /** Moves the animation element to the mouse position. */
        ConfirmationTimeout.prototype.mouseMoved = function (evt) {
            if (!this._followMouse && evt.target == this._cancelElement)
                return;
            if (this._animationElement) {
                var size = this._animationElement.getBoundingClientRect();
                this._animationElement.style.left = evt.clientX - size.width / 2 + 'px';
                this._animationElement.style.top = evt.clientY - size.height / 2 + 'px';
            }
        };
        /**
         * Updates the cancel area for this object.
         * @param cancel_area The element to add the cancel area to. If a string, it will be used as an id to find the element. If falsy or not found, the cancel area will be added to the body.
         */
        ConfirmationTimeout.prototype.setCancelArea = function (cancel_area) {
            var _this = this;
            if (this._cancelElement)
                this._cancelElement.remove();
            if (typeof cancel_area == 'string')
                cancel_area = document.getElementById(cancel_area);
            if (!cancel_area || cancel_area == document)
                cancel_area = document.body;
            var cancelElement = cancel_area.ownerDocument.createElement('div');
            cancelElement.style.width = '100%';
            cancelElement.style.height = '100%';
            cancelElement.style.position = 'absolute';
            cancelElement.style.top = '0px';
            cancelElement.style.left = '0px';
            cancelElement.style.display = 'none';
            cancelElement.style.userSelect = 'none';
            cancel_area.appendChild(cancelElement);
            cancelElement.addEventListener('click', function () {
                _this.off();
            });
            this._cancelElement = cancelElement;
            this._cancelElement.addEventListener('mousemove', this.mouseMoved.bind(this));
        };
        /**
         * Updates the animation for this object.
         * @param animation The element to use as the animation. If a string, it will be used as an id to find the element. If falsy or not found, a default animation will be created.
         */
        ConfirmationTimeout.prototype.setAnimation = function (animation) {
            if (animation === undefined) {
                animation = document.createElement('div');
                animation.id = 'confirmation-timeout-default';
                animation.style.display = 'none';
                for (var i = 0; i < 2; i++) {
                    var div = document.createElement('div');
                    var inner = document.createElement('div');
                    div.appendChild(inner);
                    animation.appendChild(div);
                }
                ConfirmationTimeout.AddDefaultAnimationCSS();
                this._cancelElement.appendChild(animation);
            }
            else if (typeof animation == 'string')
                animation = document.getElementById(animation);
            if (animation) {
                this._animationElement = animation;
                this._animationElement.style.position = 'absolute';
                this._animationElement.style.userSelect = 'none';
                this._cancelElement.style.cursor = null;
                if (this._duration)
                    this.setDuration(this._duration);
            }
            else {
                this._animationElement = null;
                this._cancelElement.style.cursor = 'wait';
            }
        };
        /**
         * Updates the duration for this object.
         * @param duration The duration of the timeout in milliseconds.
        */
        ConfirmationTimeout.prototype.setDuration = function (duration) {
            var _this = this;
            this._duration = duration;
            if (this._animationElement) {
                this._animationElement.style.animationDuration = this._duration + 'ms';
                this._animationElement.querySelectorAll('*').forEach(function (element) {
                    element.style.animationDuration = _this._duration + 'ms';
                });
            }
        };
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
        ConfirmationTimeout.prototype.setDurationPreference = function (durationPref) {
            if (gameui === undefined) {
                console.error('Cannot use duration preferences before the games "setup" function!');
                this.setDuration(1000);
                return;
            }
            // @ts-ignore
            var pref = gameui.prefs[durationPref];
            if (pref === undefined) {
                console.error('Invalid duration preference id: ' + durationPref);
                durationPref = 4;
            }
            else
                durationPref = pref.value;
            var duration = [0, 300, 600, 1000, 1500, 2000][durationPref - 1];
            if (duration === undefined || isNaN(duration)) {
                console.error('Invalid duration preference value: ' + durationPref);
                duration = 1000;
            }
            this.setDuration(duration);
        };
        /**
         * Updates if the animation element should follow the mouse around.
         *  If true, the animation element will follow the mouse around. Otherwise, it will be placed at the cursor when this timeout is set any will not move until the next {@link set}.
         */
        ConfirmationTimeout.prototype.setFollowMouse = function (followMouse) {
            this._followMouse = followMouse;
        };
        /** Updates the classes for the cancel area. */
        ConfirmationTimeout.prototype.setCancelAreaClasses = function (classes) {
            this._cancelElement.className = classes;
        };
        /** Destroys this object, removing all listeners and elements. You should not use this object after calling destroy. */
        ConfirmationTimeout.prototype.destroy = function () {
            var _a, _b, _c, _d;
            this.off();
            (_a = this._listeners) === null || _a === void 0 ? void 0 : _a.forEach(function (listener, element) {
                element.removeEventListener('click', listener);
            });
            (_b = this._listeners) === null || _b === void 0 ? void 0 : _b.clear();
            (_c = this._animationElement) === null || _c === void 0 ? void 0 : _c.remove();
            (_d = this._cancelElement) === null || _d === void 0 ? void 0 : _d.remove();
        };
        ConfirmationTimeout._defaultAnimationCSS = "\n#confirmation-timeout-default {\n\twidth: 20px;\n\theight: 20px;\n\tborder-radius: 50%;\n\tposition: absolute;\n\tpointer-events: none;\n\tdisplay: none;\n}\n#confirmation-timeout-default div {\n\twidth: 100%;\n\theight: 100%;\n\tposition: absolute;\n\tborder-radius: 50%;\n}\n#confirmation-timeout-default > div {\n\tclip: rect(0px, 20px, 20px, 10px);\n}\n#confirmation-timeout-default > div > div {\n\tclip: rect(0px, 11px, 20px, 0px);\n\tbackground: #08C;\n}\n#confirmation-timeout-default > div:first-child, #confirmation-timeout-default > div > div {\n\tanimation: confirmation-timeout-anim 1s linear forwards;\n}\n@keyframes confirmation-timeout-anim {\n\t0% { transform: rotate(3deg); }\n\t100% { transform: rotate(180deg); }\n}";
        ConfirmationTimeout._defaultAnimationCSSAdded = false;
        return ConfirmationTimeout;
    }());
    /** The root for all of your game code. */
    var KiriaiTheDuel = /** @class */ (function (_super) {
        __extends(KiriaiTheDuel, _super);
        function KiriaiTheDuel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** @gameSpecific See {@link Gamegui.setup} for more information. */
            _this.isInitialized = false;
            _this.color_path = 'Red';
            _this.actionQueue = new PlayerActionQueue(_this);
            _this.confirmationTimeout = new ConfirmationTimeout('leftright_page_wrapper');
            _this.special_translations = [
                _('There are three Special Attack Cards, one dealt to each player at the start of the game. Special Attack Cards are used once per game and discarded after use.'),
                _('<b>Kesa Strike</b> - An attack empowered by inner peace that hits two spaces. Hits the space the attacker is in and also one space in front. Successful only while in the Heaven Stance. After attacking, the samurai automatically switches stances into the Earth Stance.'),
                _('<b>Zan-Tetsu Strike</b> - An iron-splitting attack that hits two spaces. Hits the spaces two and three spaces in front of the attacker. Successful only while in the Earth Stance. After attacking, the samurai automatically switches stances into the Heaven Stance.'),
                _('<b>Counterattack</b> - This card cancels a successful attack or special attack from the opponent and then deals damage. If the opponent does not hit with an attack or special attack during the same action when Counterattack is played, then Counterattack does nothing and is discarded as normal.')
            ];
            _this.card_translations = [
                [_('<b>Approach</b> (top) - Player moves their samurai one battlefield space toward their opponent. <b>Retreat</b> (bottom) - Player moves their samurai one battlefield space away from their opponent.'), _('Click the top or bottom play/return this card.')],
                [_('<b>Charge</b> (top) - Player moves their samurai two battlefield spaces toward their opponent. <b>Change Stance</b> (bottom) - There are two stances: Heaven and Earth. Player changes the stance of the samurai by rotating the Samurai Card on the same space. The samurai\'s current stance must match the stance on an Attack Card for it to be successful'), _('Click the top or bottom play/return this card.')],
                [_('<b>High Strike</b> - A long-distance slash from above to slice through the opponent like bamboo. Successful only while in the Heaven Stance. Hits the space located two spaces in front of the attacker.'), _('Click to play/return this card.')],
                [_('<b>Low Strike</b> - A rising slash delivered from a low sword position. Successful only while in the Earth Stance. Hits the space immediately in front of the attacker.'), _('Click to play/return this card.')],
                [_('<b>Balanced Strike</b> - A sideways slash that is successful from both stances. Hits if both the attacker and opponent are in the same space'), _('Click to play/return this card.')],
                [_('Waiting to draw starting cards...'), _('Click to play/return this card.')]
            ];
            //
            // #endregion
            //
            //
            // #region Action Queue + Predictions
            // Predictions are used to simulate the state of the game before the action is acknowledged by the server.
            //
            _this.server_player_state = 0;
            _this.predictionKey = 0;
            _this.predictionModifiers = [];
            //
            // #endregion
            //
            //
            // #region Player's action
            //
            _this.onHandCardClick = function (evt, index) {
                var _a;
                evt.preventDefault();
                // This should be good enough to check all actions.
                if (!_this.checkAction('pickedFirst', true)) {
                    console.log('Not your turn!');
                    return;
                }
                if ((_a = _this.actionQueue.queue) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.action === 'confirmedCards' && a.state === 'inProgress'; })) {
                    console.log('Already confirmed cards! There is no backing out now!');
                    return;
                }
                if (index == _this.playerDiscarded()) {
                    console.log('This card has already been discarded!');
                    return;
                }
                if (index == 6 && _this.playerSpecialPlayed()) {
                    console.log('Thee special card has already been played!');
                    return;
                }
                var first = _this.playerPlayed0();
                var second = _this.playerPlayed1();
                var fixedIndex = index == 6 ? 8 : index;
                if ((index == 1 && first == 6) ||
                    (index == 2 && first == 7) ||
                    fixedIndex == first) {
                    _this.returnCardToHand(null, true);
                    return;
                }
                if ((index == 1 && second == 6) ||
                    (index == 2 && second == 7) ||
                    fixedIndex == second) {
                    _this.returnCardToHand(null, false);
                    return;
                }
                if (first != 0 && second != 0) {
                    console.log('Both cards have already been played!');
                    return;
                }
                var target = evt.target;
                // we need to know if the top half or bottom half was clicked
                var rect = target.getBoundingClientRect();
                var y = evt.clientY - rect.top;
                var clickedTopHalf = y < rect.height / 2;
                if (!clickedTopHalf && (index == 1 || index == 2))
                    index += 5;
                else if (index == 6)
                    index = 8;
                var action = null;
                var indexOffset;
                if (_this.playerPlayed0() == 0) {
                    action = 'pickedFirst';
                    indexOffset = 6;
                }
                else if (_this.playerPlayed1() == 0) {
                    action = 'pickedSecond';
                    indexOffset = 10;
                }
                if (!action) {
                    console.error('Both cards have already been picked! but not caught!');
                    return;
                }
                var callback = _this.addPredictionModifier(function (cards) {
                    cards &= ~(15 << indexOffset);
                    return cards | (index & 15) << indexOffset;
                });
                _this.actionQueue.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
                _this.actionQueue.enqueueAjaxAction({
                    action: action,
                    args: { card_id: index },
                    callback: callback
                });
            };
            _this.returnCardToHand = function (evt, first) {
                var _a;
                evt === null || evt === void 0 ? void 0 : evt.preventDefault();
                if ((_a = _this.actionQueue.queue) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.action === 'confirmedCards' && a.state === 'inProgress'; })) {
                    console.log('Already confirmed cards! There is no backing out now!');
                    return;
                }
                if (first) {
                    // Still waiting on the first card that was picked to be sent to server...
                    if (_this.actionQueue.filterActionQueue('pickedFirst')) {
                        return; // Removing the play action is the same as undoing it.
                    }
                }
                else {
                    // Still waiting on the second card that was picked to be sent to server...
                    if (_this.actionQueue.filterActionQueue('pickedSecond')) {
                        return; // Removing the play action is the same as undoing it.
                    }
                }
                var indexOffset = first ? 6 : 10;
                var callback = _this.addPredictionModifier(function (cards) {
                    return cards & ~(15 << indexOffset);
                });
                _this.actionQueue.filterActionQueue('confirmedCards'); // If this is waiting to be sent, we don't want it to be sent.
                _this.actionQueue.enqueueAjaxAction({
                    action: first ? "undoFirst" : "undoSecond",
                    args: {},
                    callback: callback
                });
            };
            _this.notif_instantMatch = function (notif) {
                var _a, _b;
                console.log('notif_placeAllCards', notif);
                // if (this.gamedatas.gamestate.name !== 'setupBattlefield' || notif.type !== 'battlefield setup')
                // 	this.gamedatas.battlefield = notif.args.battlefield;
                _this.server_player_state = notif.args.player_state;
                _this.gamedatas.opponent_state = notif.args.opponent_state;
                _this.updateCardsWithPredictions();
                _this.instantMatch();
                for (var player in _this.gamedatas.players) {
                    var winner = notif.args.winner == player;
                    if (player == _this.player_id.toString()) {
                        (_a = _this.scoreCtrl[player]) === null || _a === void 0 ? void 0 : _a.toValue(_this.opponentHit() ? (winner ? 2 : 1) : 0);
                    }
                    else {
                        (_b = _this.scoreCtrl[player]) === null || _b === void 0 ? void 0 : _b.toValue(_this.playerHit() ? (winner ? 2 : 1) : 0);
                    }
                }
            };
            return _this;
            //
            // #endregion
            //
        }
        //
        // #region Gamedata Wrappers
        //
        KiriaiTheDuel.prototype.playerPosition = function () { return (this.gamedatas.player_state >> 0) & 15; };
        KiriaiTheDuel.prototype.playerStance = function () { return (this.gamedatas.player_state >> 4) & 1; };
        KiriaiTheDuel.prototype.playerHit = function () { return ((this.gamedatas.player_state >> 5) & 1) == 1; };
        KiriaiTheDuel.prototype.playerPlayed0 = function () { return (this.gamedatas.player_state >> 6) & 15; };
        KiriaiTheDuel.prototype.playerPlayed1 = function () { return (this.gamedatas.player_state >> 10) & 15; };
        KiriaiTheDuel.prototype.playerDiscarded = function () { return (this.gamedatas.player_state >> 14) & 7; };
        KiriaiTheDuel.prototype.playerSpecialCard = function () { return (this.gamedatas.player_state >> 17) & 3; };
        KiriaiTheDuel.prototype.playerSpecialPlayed = function () { return ((this.gamedatas.player_state >> 19) & 1) == 1; };
        KiriaiTheDuel.prototype.opponentPosition = function () { return (this.gamedatas.opponent_state >> 0) & 15; };
        KiriaiTheDuel.prototype.opponentStance = function () { return (this.gamedatas.opponent_state >> 4) & 1; };
        KiriaiTheDuel.prototype.opponentHit = function () { return ((this.gamedatas.opponent_state >> 5) & 1) == 1; };
        KiriaiTheDuel.prototype.opponentPlayed0 = function () { return (this.gamedatas.opponent_state >> 6) & 15; };
        KiriaiTheDuel.prototype.opponentPlayed1 = function () { return (this.gamedatas.opponent_state >> 10) & 15; };
        KiriaiTheDuel.prototype.opponentDiscarded = function () { return (this.gamedatas.opponent_state >> 14) & 7; };
        KiriaiTheDuel.prototype.opponentSpecialCard = function () { return (this.gamedatas.opponent_state >> 17) & 3; };
        KiriaiTheDuel.prototype.opponentSpecialPlayed = function () { return ((this.gamedatas.opponent_state >> 19) & 1) == 1; };
        //
        // #endregion
        //
        //
        // #region Document/URL Utilities
        //
        KiriaiTheDuel.prototype.formatSVGURL = function (name) { return "".concat(g_gamethemeurl, "img/").concat(this.color_path, "/").concat(name, ".svg"); };
        KiriaiTheDuel.prototype.stanceURL = function (player) {
            return this.formatSVGURL("".concat(player ? 'player' : 'opponent', "-stance-").concat((player ? this.playerHit() : this.opponentHit()) ? 'damaged' : 'healthy'));
        };
        KiriaiTheDuel.prototype.specialCardURL = function (player) {
            switch (player ? this.playerSpecialCard() : this.opponentSpecialCard()) {
                case 1: return this.formatSVGURL('special-kesa');
                case 2: return this.formatSVGURL('special-zantetsu');
                case 3: return this.formatSVGURL('special-counter');
                default: return this.formatSVGURL('card-back');
            }
        };
        KiriaiTheDuel.prototype.setCardSlot = function (slot, src) {
            if (typeof slot == 'string')
                slot = $(slot);
            if (slot instanceof HTMLElement && slot.children.length > 0 && slot.children[0] instanceof HTMLImageElement) {
                slot.children[0].style.display = src ? 'block' : 'none';
                if (src != null)
                    slot.children[0].src = src;
                return;
            }
            console.error('Invalid slot: ', slot);
        };
        //
        // #endregion
        //
        //
        // #region Gamegui Methods
        // Setup and game state methods
        //
        KiriaiTheDuel.prototype.setup = function (gamedatas) {
            var _this = this;
            console.log("Starting game setup", this.gamedatas);
            this.actionQueue.actionTitleLockingStrategy = 'actionbar';
            console.log(this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id]);
            if (this.gamedatas.players[this.player_id].color == '4e93a6')
                this.color_path = 'Blue';
            this.server_player_state = gamedatas.player_state;
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();
            // Add tooltips to the cards
            this.addTooltip('battlefield', _('Each white square on the battlefield card represents a space for the Samurai Cards. Each Samurai Card will always be located on one of the spaces and can share a space. Samurai Cards cannot pass each other.'), '');
            this.addTooltip('player_samurai', _("This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged."), '');
            this.addTooltip('opponent_samurai', _("This Samurai Card shows your opponents samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged."), '');
            this.addTooltip('player_played_0', _("This spot show's your first action for the turn."), _('Click to return the card to your hand.'));
            this.addTooltip('player_played_1', _("This spot show's your second action for the turn. You will not be able to play the card in this slot next round."), _('Click to return the card to your hand.'));
            this.addTooltip('opponent_played_0', _("This spot show's your opponent's first action for the turn."), '');
            this.addTooltip('opponent_played_1', _("This spot show's your opponent's second action for the turn. They will not be able to play the card in this slot next round."), '');
            this.addTooltip('discard_icon', _('This icon shows the last card that was discarded by the opponent.'), _('Hover to show opponent\'s hand.'));
            this.addTooltip('special_icon', _('This icon shows if your opponent still has a hidden special card.'), _('Hover to show opponent\'s hand.'));
            this.instantMatch();
            var _loop_3 = function (i) {
                var index = i + 1;
                dojo.connect($('player-hand_' + i), 'onclick', this_2, function (e) { return _this.onHandCardClick(e, index); });
            };
            var this_2 = this;
            for (var i = 0; i < 6; i++) {
                _loop_3(i);
            }
            var _loop_4 = function (i) {
                var first = i == 0;
                dojo.connect($('player_played_' + i), 'onclick', this_3, function (e) { return _this.returnCardToHand(e, first); });
            };
            var this_3 = this;
            for (var i = 0; i < 2; i++) {
                _loop_4(i);
            }
            // Add on hover events for adding show-opponent-area class to the play-area.
            [$('discard_icon'), $('special_icon')].forEach(function (target) {
                target === null || target === void 0 ? void 0 : target.addEventListener('mouseenter', function () {
                    $('hands').classList.add('show-opponent-area');
                });
                target === null || target === void 0 ? void 0 : target.addEventListener('mouseleave', function () {
                    $('hands').classList.remove('show-opponent-area');
                });
            });
            this.isInitialized = true;
            console.log("Ending game setup");
        };
        KiriaiTheDuel.prototype.onEnteringState = function (stateName, args) {
            console.log('Entering state: ' + stateName, args);
            switch (stateName) {
                /* Example:
                
                case 'myGameState':
                
                    // Show some HTML block at this game state
                    dojo.style( 'my_html_block_id', 'display', 'block' );
                    
                    break;
                */
                default:
                    break;
            }
        };
        KiriaiTheDuel.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
            switch (stateName) {
                case "setupBattlefield":
                    this.cleanupSetupBattlefield();
                    break;
                default:
                    break;
            }
        };
        KiriaiTheDuel.prototype.cleanupSetupBattlefield = function () {
            var _a;
            (_a = this.setupHandles) === null || _a === void 0 ? void 0 : _a.forEach(function (h) { return dojo.disconnect(h); });
            delete this.setupHandles;
            var index = 1;
            while (true) {
                var element = $('battlefield_position_' + index);
                if (element)
                    element.classList.remove('highlight');
                else
                    break;
                index++;
            }
            this.addTooltip('player_samurai', _("This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged."), '');
        };
        KiriaiTheDuel.prototype.onUpdateActionButtons = function (stateName, args) {
            var _this = this;
            var _a;
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (this.isCurrentPlayerActive()) {
                switch (stateName) {
                    case "setupBattlefield":
                        (_a = this.setupHandles) === null || _a === void 0 ? void 0 : _a.forEach(function (h) { return dojo.disconnect(h); });
                        this.setupHandles = [];
                        var _loop_5 = function (index) {
                            var element = $('battlefield_position_' + index);
                            element.classList.add('highlight');
                            // Add an onclick event to the ::after pseudo element
                            this_4.setupHandles.push(dojo.connect(element, 'onclick', this_4, function (e) {
                                _this.gamedatas.player_state = (_this.gamedatas.player_state & ~(15 << 0)) | (index << 0);
                                _this.instantMatch();
                            }));
                            this_4.addTooltip(element.id, _('Select a starting position'), _('Click to set this as your starting position.'));
                        };
                        var this_4 = this;
                        for (var _i = 0, _b = [2, 3, 4]; _i < _b.length; _i++) {
                            var index = _b[_i];
                            _loop_5(index);
                        }
                        this.addTooltip('player_samurai', _("This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged."), _('Click to switch your stance'));
                        // Add an onclick event to the samurai to flip the stance:
                        this.setupHandles.push(dojo.connect($('player_samurai'), 'onclick', this, function (e) {
                            _this.gamedatas.player_state = _this.gamedatas.player_state ^ (1 << 4);
                            _this.instantMatch();
                        }));
                        this.addActionButton('confirmBattlefieldButton', _('Confirm'), function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log('Confirming selection', e);
                                        if (!this.checkAction('confirmedStanceAndPosition'))
                                            return [2 /*return*/];
                                        return [4 /*yield*/, this.confirmationTimeout.promise(e)];
                                    case 1:
                                        _a.sent();
                                        this.ajaxAction('confirmedStanceAndPosition', {
                                            isHeavenStance: this.playerStance() == 0,
                                            position: this.playerPosition()
                                        });
                                        this.cleanupSetupBattlefield();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        break;
                    case "pickCards":
                        this.addActionButton('confirmSelectionButton', _('Confirm'), function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log('Confirming selection', e);
                                        if (this.playerPlayed0() == 0 && this.playerPlayed1() == 0) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, this.confirmationTimeout.promise(e)];
                                    case 1:
                                        _a.sent();
                                        // This makes sure that this action button is removed.
                                        this.lockTitleWithStatus(_('Sending moves to server...'));
                                        this.actionQueue.enqueueAjaxAction({
                                            action: 'confirmedCards',
                                            args: {}
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        break;
                }
            }
        };
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
        KiriaiTheDuel.prototype.instantMatch = function () {
            var _this = this;
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
            var player_area = $('game-area');
            var card_names = [
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
            var updatePlayed = function (target, first, player) {
                if (!(target instanceof HTMLElement))
                    return;
                var card = player ?
                    (first ? _this.playerPlayed0() : _this.playerPlayed1()) :
                    (first ? _this.opponentPlayed0() : _this.opponentPlayed1());
                var src = null;
                if (card != 0 && card != 9)
                    player_area.classList.add(card_names[card - 1] + (player ? '-player' : '-opponent') + "-played" + (first ? '-first' : '-second'));
                target.classList.remove('bottomPicked');
                var prefix = player ? 'player-card-' : 'opponent-card-';
                switch (card) {
                    case 0: break;
                    case 1:
                        src = _this.formatSVGURL(prefix + 'approach');
                        break;
                    case 2:
                        src = _this.formatSVGURL(prefix + 'charge');
                        break;
                    case 3:
                        src = _this.formatSVGURL(prefix + 'high-strike');
                        break;
                    case 4:
                        src = _this.formatSVGURL(prefix + 'low-strike');
                        break;
                    case 5:
                        src = _this.formatSVGURL(prefix + 'balance-strike');
                        break;
                    case 6:
                        src = _this.formatSVGURL(prefix + 'approach');
                        target.classList.add('bottomPicked');
                        break;
                    case 7:
                        src = _this.formatSVGURL(prefix + 'charge');
                        target.classList.add('bottomPicked');
                        break;
                    case 8:
                        switch (player ? _this.playerSpecialCard() : _this.opponentSpecialCard()) {
                            case 1:
                                src = _this.formatSVGURL('special-kesa');
                                break;
                            case 2:
                                src = _this.formatSVGURL('special-zantetsu');
                                break;
                            case 3:
                                src = _this.formatSVGURL('special-counter');
                                break;
                                throw new Error('Invalid special card!');
                        }
                        break;
                    case 9:
                        src = _this.formatSVGURL('card-back');
                        break;
                    default:
                        throw new Error('Invalid card: ' + card);
                }
                _this.setCardSlot(target, src);
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
            var battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;
            var player_samurai = $('player_samurai');
            var opponent_samurai = $('opponent_samurai');
            var play_area_bounds = $('play-area').getBoundingClientRect();
            var target_bounds_player = $('battlefield_position_' + this.playerPosition()).getBoundingClientRect();
            var target_bounds_opponent = $('battlefield_position_' + (battlefieldSize - this.opponentPosition() + 1)).getBoundingClientRect();
            player_samurai.style.left = (target_bounds_player.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%';
            player_samurai.style.top = (target_bounds_player.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%';
            opponent_samurai.style.left = (target_bounds_opponent.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%';
            opponent_samurai.style.top = (target_bounds_opponent.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%';
            this.setCardSlot('player_samurai', this.stanceURL(true));
            this.setCardSlot('opponent_samurai', this.stanceURL(false));
            player_area.classList.add('player-' + (this.playerStance() == 0 ? 'heaven' : 'earth'));
            player_area.classList.add('opponent-' + (this.opponentStance() == 0 ? 'heaven' : 'earth'));
            var specialCardName = function (index) {
                switch (index) {
                    case 1: return _('Kesa Strike');
                    case 2: return _('Zan-Tetsu Strike');
                    case 3: return _('Counterattack');
                    default: return _('Hidden');
                }
            };
            var special_tip = this.special_translations[0] + '<br/><b>' +
                _('Your special card') + "</b>: " + specialCardName(this.playerSpecialCard()) + '<br/><b>' +
                _('Opponent\'s special card') + "</b>: " + specialCardName(this.opponentSpecialCard()) + '<br/>' +
                this.special_translations[1] + '<br/>' +
                this.special_translations[2] + '<br/>' +
                this.special_translations[3];
            this.card_translations[5][0] = special_tip;
            for (var i = 0; i < 6; i++) {
                var card = this.card_translations[i];
                var text = card[0];
                var action = card[1];
                if (i + 1 == this.playerDiscarded() || (i == 5 && this.playerSpecialPlayed())) {
                    text += '<br/><i>' + _('Discarded') + '</i>';
                    action = '';
                }
                this.addTooltip('player-hand_' + i, text, action);
            }
        };
        KiriaiTheDuel.prototype.addPredictionModifier = function (func) {
            var _this = this;
            var key = this.predictionKey++;
            this.predictionModifiers.push({ key: key, func: func });
            this.updateCardsWithPredictions();
            // This is called when the action fails or is accepted.
            return function () {
                _this.predictionModifiers = _this.predictionModifiers.filter(function (mod) { return mod.key != key; });
                _this.updateCardsWithPredictions();
            };
        };
        KiriaiTheDuel.prototype.updateCardsWithPredictions = function () {
            var cards = this.server_player_state;
            for (var _i = 0, _a = this.predictionModifiers; _i < _a.length; _i++) {
                var mod = _a[_i];
                // Print cards as binary
                console.log('cards:', cards.toString(2));
                cards = mod.func(cards);
            }
            console.log('cards:', cards.toString(2));
            this.gamedatas.player_state = cards;
            this.instantMatch();
        };
        //
        // #endregion
        //
        //
        // #region Notifications
        // Server acknowledgements and game state updates
        //
        KiriaiTheDuel.prototype.setupNotifications = function () {
            console.log('notifications subscriptions setup');
            this.subscribeNotif('battlefield setup', this.notif_instantMatch);
            this.subscribeNotif('played card', this.notif_instantMatch);
            this.subscribeNotif('undo card', this.notif_instantMatch);
            this.subscribeNotif('before first resolve', this.notif_instantMatch);
            this.subscribeNotif('before second resolve', this.notif_instantMatch);
            this.subscribeNotif('after resolve', this.notif_instantMatch);
            this.subscribeNotif('player(s) charged', this.notif_instantMatch);
            this.subscribeNotif('player(s) moved', this.notif_instantMatch);
            this.subscribeNotif('player(s) changed stance', this.notif_instantMatch);
            this.subscribeNotif('player(s) attacked', this.notif_instantMatch);
            this.subscribeNotif('player(s) hit', this.notif_instantMatch);
            this.subscribeNotif('log', function (a) { return console.log('log:', a); });
            this.notifqueue.setSynchronous('battlefield setup', 1000);
            // this.notifqueue.setSynchronous( 'played card', 1000 );
            // this.notifqueue.setSynchronous( 'undo card', 1000 );
            this.notifqueue.setSynchronous('before first resolve', 1000);
            this.notifqueue.setSynchronous('before second resolve', 1000);
            this.notifqueue.setSynchronous('after resolve', 1000);
            this.notifqueue.setSynchronous('player(s) charged', 1000);
            this.notifqueue.setSynchronous('player(s) moved', 1000);
            this.notifqueue.setSynchronous('player(s) changed stance', 1000);
            this.notifqueue.setSynchronous('player(s) attacked', 1000);
            this.notifqueue.setSynchronous('player(s) hit', 1000);
        };
        return KiriaiTheDuel;
    }(TitleLockingMixin(CommonMixin(Gamegui))));
    dojo.setObject("bgagame.kiriaitheduel", KiriaiTheDuel);
    ((_a = window.bgagame) !== null && _a !== void 0 ? _a : (window.bgagame = {})).kiriaitheduel = KiriaiTheDuel;
});
