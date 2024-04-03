var GameguiCookbook = (function () {
    function GameguiCookbook() {
    }
    return GameguiCookbook;
}());
GameguiCookbook.prototype.attachToNewParentNoDestroy = function (mobile_in, new_parent_in, relation, place_position) {
    var mobile = $(mobile_in);
    var new_parent = $(new_parent_in);
    var src = dojo.position(mobile);
    if (place_position)
        mobile.style.position = place_position;
    dojo.place(mobile, new_parent, relation);
    mobile.offsetTop;
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
    mobile.offsetTop;
    return box;
};
GameguiCookbook.prototype.ajaxAction = function (action, args, callback, ajax_method) {
    if (!this.checkAction(action))
        return false;
    if (!args)
        args = {};
    if (!args.lock)
        args.lock = true;
    this.ajaxcall("/".concat(this.game_name, "/").concat(this.game_name, "/").concat(action, ".html"), args, this, function () { }, callback, ajax_method);
    return true;
};
GameguiCookbook.prototype.subscribeNotif = function (event, callback) {
    return dojo.subscribe(event, this, callback);
};
GameguiCookbook.prototype.addImageActionButton = function (id, label, method, destination, blinking, color, tooltip) {
    if (!color)
        color = "gray";
    this.addActionButton(id, label, method, destination, blinking, color);
    var div = $(id);
    dojo.style(div, "border", "none");
    dojo.addClass(div, "shadow bgaimagebutton");
    if (tooltip) {
        dojo.attr(div, "title", tooltip);
    }
    return div;
};
GameguiCookbook.prototype.isReadOnly = function () {
    return this.isSpectator || typeof g_replayFrom !== 'undefined' || g_archive_mode;
};
GameguiCookbook.prototype.scrollIntoViewAfter = function (target, delay) {
    if (this.instantaneousMode)
        return;
    if (typeof g_replayFrom != "undefined" || !delay || delay <= 0) {
        $(target).scrollIntoView();
        return;
    }
    setTimeout(function () {
        $(target).scrollIntoView({ behavior: "smooth", block: "center" });
    }, delay);
};
GameguiCookbook.prototype.getPlayerAvatar = function (playerId, size) {
    if (size === void 0) { size = '184'; }
    var avatarDiv = $('avatar_' + playerId);
    if (avatarDiv == null)
        return 'https://x.boardgamearena.net/data/data/avatar/default_184.jpg';
    var smallAvatarURL = dojo.attr(avatarDiv, 'src');
    if (size === '184')
        smallAvatarURL = smallAvatarURL.replace('_32.', '_184.');
    return smallAvatarURL;
};
GameguiCookbook.prototype.divYou = function () {
    return this.divColoredPlayer(this.player_id, __("lang_mainsite", "You"));
};
GameguiCookbook.prototype.divColoredPlayer = function (player_id, text) {
    var player = this.gamedatas.players[player_id];
    if (player === undefined)
        return "--unknown player--";
    return "<span style=\"color:".concat(player.color, ";background-color:#").concat(player.color_back, ";\">").concat(text !== null && text !== void 0 ? text : player.name, "</span>");
};
GameguiCookbook.prototype.setMainTitle = function (html) {
    $('pagemaintitletext').innerHTML = html;
};
GameguiCookbook.prototype.setDescriptionOnMyTurn = function (description) {
    this.gamedatas.gamestate.descriptionmyturn = description;
    var tpl = dojo.clone(this.gamedatas.gamestate.args);
    if (tpl === null)
        tpl = {};
    if (this.isCurrentPlayerActive() && description !== null)
        tpl.you = this.divYou();
    var title = this.format_string_recursive(description, tpl);
    this.setMainTitle(title !== null && title !== void 0 ? title : '');
};
;
GameguiCookbook.prototype.actionErrorCodes = {
    FILTERED_OUT: -512,
    TIMEOUT: -513,
    PLAYER_NOT_ACTIVE: -514,
    DEPENDENCY_FAILED: -515,
    ACTION_NOT_POSSIBLE: -516,
};
GameguiCookbook.prototype.enqueueAjaxAction = function (refItem, dependencies) {
    var _this = this;
    var _a, _b, _c;
    if (this.actionQueue === undefined)
        this.actionQueue = [];
    var item = refItem;
    item.dependencies = dependencies ?
        dependencies.flatMap(function (dep) { return (typeof dep === 'string') ?
            _this.actionQueue.filter(function (a) { return a.action === dep; }) : dep; }) :
        null;
    item.timestamp = Date.now();
    item.state = 'queued';
    this.actionQueue.push(item);
    if (this.isTitleLocked && !this.isTitleLocked()) {
        if (this.actionTitleLockingStrategy === 'sending')
            (_a = this.lockTitleWithStatus) === null || _a === void 0 ? void 0 : _a.call(this, 'Sending move to server...');
        else if (this.actionTitleLockingStrategy === 'actionbar')
            (_b = this.lockTitle) === null || _b === void 0 ? void 0 : _b.call(this, 'pagemaintitle_wrap');
        else if (this.actionTitleLockingStrategy === 'current')
            (_c = this.lockTitle) === null || _c === void 0 ? void 0 : _c.call(this);
    }
    this.asyncPostActions();
    return item;
};
GameguiCookbook.prototype.filterActionQueue = function (filter) {
    var _a;
    if (!this.actionQueue)
        return false;
    var count = this.actionQueue.length;
    for (var i = count - 1; i >= 0; i--) {
        var item = this.actionQueue[i];
        if (item.state === 'inProgress')
            continue;
        if (typeof filter === 'string' ? item.action !== filter : !filter(item))
            continue;
        (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, true, 'Action was filtered out', this.actionErrorCodes.FILTERED_OUT);
        this.actionQueue.splice(i, 1);
    }
    return count !== this.actionQueue.length;
};
GameguiCookbook.prototype.asyncPostActions = function () {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (this.actionQueue === undefined)
        return;
    if (this.actionPostTimeout) {
        clearTimeout(this.actionPostTimeout);
        this.actionPostTimeout = undefined;
    }
    if (!this.isCurrentPlayerActive()) {
        for (var _i = 0, _k = this.actionQueue; _i < _k.length; _i++) {
            var item = _k[_i];
            item.state = 'failed';
            (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, true, 'Player is no longer active', this.actionErrorCodes.PLAYER_NOT_ACTIVE);
        }
        this.actionQueue = [];
    }
    var now = Date.now();
    var _loop_1 = function (i) {
        var item = this_1.actionQueue[i];
        if (item.state === 'inProgress') {
        }
        else if ((item.dependencies === null && i == 0) ||
            ((_b = item.dependencies) === null || _b === void 0 ? void 0 : _b.every(function (dep) { return dep.state === 'complete'; }))) {
            item.state = 'inProgress';
            this_1.ajaxcall("/".concat(this_1.game_name, "/").concat(this_1.game_name, "/").concat(item.action, ".html"), item.args, this_1, function () { }, function (error, errorMessage, errorCode) {
                var _a, _b;
                item.state = error ? 'failed' : 'complete';
                (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, error, errorMessage, errorCode);
                _this.actionQueue = (_b = _this.actionQueue) === null || _b === void 0 ? void 0 : _b.filter(function (x) {
                    var _a;
                    if (x.state === 'queued' && x.dependencies === null && error) {
                        x.state = 'failed';
                        (_a = x.callback) === null || _a === void 0 ? void 0 : _a.call(x, true, 'Dependency failed', _this.actionErrorCodes.DEPENDENCY_FAILED);
                        return false;
                    }
                    return x !== item;
                });
                _this.asyncPostActions();
            });
            (_c = item.onSent) === null || _c === void 0 ? void 0 : _c.call(item);
        }
        else if ((_d = item.dependencies) === null || _d === void 0 ? void 0 : _d.some(function (dep) { return dep.state === 'failed'; })) {
            item.state = 'failed';
            (_e = item.callback) === null || _e === void 0 ? void 0 : _e.call(item, true, 'Dependency failed', this_1.actionErrorCodes.DEPENDENCY_FAILED);
            this_1.actionQueue.splice(i, 1);
            i = 0;
        }
        else if (item.timestamp + ((_f = this_1.actionPostTimeout) !== null && _f !== void 0 ? _f : 10000) < now) {
            item.state = 'failed';
            (_g = item.callback) === null || _g === void 0 ? void 0 : _g.call(item, true, 'Action took too long to post', this_1.actionErrorCodes.TIMEOUT);
            this_1.actionQueue.splice(i, 1);
            i = 0;
        }
        out_i_1 = i;
    };
    var this_1 = this, out_i_1;
    for (var i = 0; i < this.actionQueue.length; i++) {
        _loop_1(i);
        i = out_i_1;
    }
    if (this.actionQueue.length === 0) {
        if (this.actionTitleLockingStrategy && this.actionTitleLockingStrategy !== 'none')
            (_h = this.removeTitleLocks) === null || _h === void 0 ? void 0 : _h.call(this);
        return;
    }
    else if (this.actionQueue.every(function (i) { return i.state != 'inProgress'; })) {
        console.error("There is likely a circular dependency in the action queue. None of the actions can be sent: ", this.actionQueue);
        for (var _l = 0, _m = this.actionQueue; _l < _m.length; _l++) {
            var item = _m[_l];
            item.state = 'failed';
            (_j = item.callback) === null || _j === void 0 ? void 0 : _j.call(item, true, 'Circular dependency', this.actionErrorCodes.DEPENDENCY_FAILED);
        }
        this.actionQueue = [];
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
GameguiCookbook.prototype.cloneHTMLWithoutIds = function (element) {
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
                    el.style[property] = computedStyle.getPropertyValue(property);
                }
                var _loop_2 = function (event_1) {
                    el.addEventListener('click', function (e) {
                        var _a, _b;
                        (_b = (_a = $(id))[event_1]) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                    });
                };
                for (var _b = 0, maintainEvents_1 = maintainEvents; _b < maintainEvents_1.length; _b++) {
                    var event_1 = maintainEvents_1[_b];
                    _loop_2(event_1);
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
GameguiCookbook.prototype.isTitleLocked = function () {
    return (this.titlelock_element != undefined) && this.titlelock_element.childElementCount > 0;
};
GameguiCookbook.prototype.createTitleLock = function () {
    var _a;
    if (this.titlelock_element)
        return this.titlelock_element;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.display_none { display: none !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    var titlelockElement = document.createElement('div');
    titlelockElement.id = 'titlelock_wrap';
    titlelockElement.className = 'roundedboxinner';
    titlelockElement.style.display = 'none';
    (_a = document.getElementById('page-title')) === null || _a === void 0 ? void 0 : _a.appendChild(titlelockElement);
    return this.titlelock_element = titlelockElement;
};
GameguiCookbook.prototype.lockTitleWithStatus = function (status) {
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
GameguiCookbook.prototype.lockTitleWithHTML = function (html) {
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
GameguiCookbook.prototype.lockTitle = function (target) {
    if (this.isTitleLocked())
        return;
    console.log('Locking title');
    this.pushTitleLock(target);
};
GameguiCookbook.prototype.pushTitleLockFromStatus = function (status) {
    var _a;
    (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
    this.pushTitleLockFromHTML('<div><div style="display:inline-block; padding-left: 22px; position:relative;">\
			<img src="https://studio.boardgamearena.com:8084/data/themereleases/240320-1000/img/logo/waiting.gif" style="width:22px; height: 22px; position:absolute; left:-22px;" class="imgtext">\
			<span>' + status + '</span>\
		</div></div>');
};
GameguiCookbook.prototype.pushTitleLockFromHTML = function (html) {
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
GameguiCookbook.prototype.pushTitleLock = function (target) {
    var _a;
    (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
    var elementCount = this.titlelock_element.childElementCount;
    if (elementCount != 0) {
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
GameguiCookbook.prototype.popTitleLockWithoutUpdate = function () {
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
GameguiCookbook.prototype.popTitleLock = function () {
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
GameguiCookbook.prototype.removeTitleLocks = function () {
    if (!this.titlelock_element)
        return;
    this.titlelock_element.innerHTML = '';
    $('pagemaintitle_wrap').classList.remove('display_none');
    $('gameaction_status_wrap').classList.remove('display_none');
    this.titlelock_element.style.display = 'none';
};
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
var KiriaiTheDuel = (function (_super) {
    __extends(KiriaiTheDuel, _super);
    function KiriaiTheDuel() {
        var _this = _super.call(this) || this;
        _this.isInitialized = false;
        _this.resizeTimeout = null;
        _this.onScreenWidthChange = function () {
            if (_this.isInitialized) {
                if (_this.resizeTimeout !== null) {
                    clearTimeout(_this.resizeTimeout);
                }
                _this.resizeTimeout = setTimeout(function () {
                    _this.instantMatch();
                    _this.resizeTimeout = null;
                }, 10);
                _this.instantMatch();
            }
        };
        _this.card_tooltips = [{
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
            }];
        _this.predictionKey = 0;
        _this.onHandCardClick = function (evt, index) {
            var _a;
            evt.preventDefault();
            if (!_this.checkAction('pickedFirst', true)) {
                console.log('Not your turn!');
                return;
            }
            if ((_a = _this.actionQueue) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.action === 'confirmedCards' && a.state === 'inProgress'; })) {
                console.log('Already confirmed cards! There is no backing out now!');
                return;
            }
            if (index == (_this.isRedPlayer() ? _this.redDiscarded() : _this.blueDiscarded())) {
                console.log('This card has already been discarded!');
                return;
            }
            if (index == 6 && (_this.isRedPlayer() ? _this.redSpecialPlayed() : _this.blueSpecialPlayed())) {
                console.log('Thee special card has already been played!');
                return;
            }
            var first = _this.isRedPlayer() ? _this.redPlayed0() : _this.bluePlayed0();
            var second = _this.isRedPlayer() ? _this.redPlayed1() : _this.bluePlayed1();
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
            var rect = target.getBoundingClientRect();
            var y = evt.clientY - rect.top;
            var clickedTopHalf = y < rect.height / 2;
            if (!clickedTopHalf && (index == 1 || index == 2))
                index += 5;
            else if (index == 6)
                index = 8;
            var action;
            var indexOffset;
            if (_this.isRedPlayer()) {
                if (_this.redPlayed0() == 0) {
                    action = 'pickedFirst';
                    indexOffset = 0;
                }
                else if (_this.redPlayed1() == 0) {
                    action = 'pickedSecond';
                    indexOffset = 4;
                }
            }
            else {
                if (_this.bluePlayed0() == 0) {
                    action = 'pickedFirst';
                    indexOffset = 8;
                }
                else if (_this.bluePlayed1() == 0) {
                    action = 'pickedSecond';
                    indexOffset = 12;
                }
            }
            var callback = _this.addPredictionModifier(function (cards) {
                cards &= ~(15 << indexOffset);
                return cards | (index & 15) << indexOffset;
            });
            _this.filterActionQueue('confirmedCards');
            _this.enqueueAjaxAction({
                action: action,
                args: { card_id: index },
                callback: callback
            });
        };
        _this.returnCardToHand = function (evt, first) {
            var _a;
            evt === null || evt === void 0 ? void 0 : evt.preventDefault();
            if ((_a = _this.actionQueue) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.action === 'confirmedCards' && a.state === 'inProgress'; })) {
                console.log('Already confirmed cards! There is no backing out now!');
                return;
            }
            if (first) {
                if (_this.filterActionQueue('pickedFirst')) {
                    return;
                }
            }
            else {
                if (_this.filterActionQueue('pickedSecond')) {
                    return;
                }
            }
            var indexOffset;
            if (_this.isRedPlayer()) {
                indexOffset = first ? 0 : 4;
            }
            else {
                indexOffset = first ? 8 : 12;
            }
            var callback = _this.addPredictionModifier(function (cards) {
                return cards & ~(15 << indexOffset);
            });
            _this.filterActionQueue('confirmedCards');
            _this.enqueueAjaxAction({
                action: first ? "undoFirst" : "undoSecond",
                args: {},
                callback: callback
            });
        };
        _this.notif_instantMatch = function (notif) {
            console.log('notif_placeAllCards', notif);
            if (_this.gamedatas.gamestate.name !== 'setupBattlefield' || notif.type !== 'battlefield setup')
                _this.gamedatas.battlefield = notif.args.battlefield;
            _this.serverCards = notif.args.cards;
            _this.updateCardsWithPredictions();
            _this.instantMatch();
            if (notif.args.redScore !== undefined)
                _this.scoreCtrl[_this.redPlayerId()].toValue(notif.args.redScore);
            if (notif.args.blueScore !== undefined)
                _this.scoreCtrl[_this.bluePlayerId()].toValue(notif.args.blueScore);
        };
        console.log('kiriaitheduel:', _this);
        return _this;
    }
    KiriaiTheDuel.prototype.isRedPlayer = function () { return this.gamedatas.players[this.player_id].color == 'e54025'; };
    KiriaiTheDuel.prototype.redPrefix = function () { return this.isRedPlayer() ? 'my' : 'opponent'; };
    KiriaiTheDuel.prototype.bluePrefix = function () { return this.isRedPlayer() ? 'opponent' : 'my'; };
    KiriaiTheDuel.prototype.redPosition = function () { return (this.gamedatas.battlefield >> 0) & 15; };
    KiriaiTheDuel.prototype.redStance = function () { return (this.gamedatas.battlefield >> 4) & 1; };
    KiriaiTheDuel.prototype.bluePosition = function () { return (this.gamedatas.battlefield >> 5) & 15; };
    KiriaiTheDuel.prototype.blueStance = function () { return (this.gamedatas.battlefield >> 9) & 1; };
    KiriaiTheDuel.prototype.redHit = function () { return ((this.gamedatas.battlefield >> 14) & 1) == 1; };
    KiriaiTheDuel.prototype.blueHit = function () { return ((this.gamedatas.battlefield >> 15) & 1) == 1; };
    KiriaiTheDuel.prototype.battlefieldType = function () { return (this.gamedatas.battlefield >> 16) & 7; };
    KiriaiTheDuel.prototype.redPlayed0 = function () { return (this.gamedatas.cards >> 0) & 15; };
    KiriaiTheDuel.prototype.redPlayed1 = function () { return (this.gamedatas.cards >> 4) & 15; };
    KiriaiTheDuel.prototype.bluePlayed0 = function () { return (this.gamedatas.cards >> 8) & 15; };
    KiriaiTheDuel.prototype.bluePlayed1 = function () { return (this.gamedatas.cards >> 12) & 15; };
    KiriaiTheDuel.prototype.redDiscarded = function () { return (this.gamedatas.cards >> 16) & 7; };
    KiriaiTheDuel.prototype.blueDiscarded = function () { return (this.gamedatas.cards >> 19) & 7; };
    KiriaiTheDuel.prototype.redSpecialCard = function () { return (this.gamedatas.cards >> 22) & 3; };
    KiriaiTheDuel.prototype.blueSpecialCard = function () { return (this.gamedatas.cards >> 24) & 3; };
    KiriaiTheDuel.prototype.redSpecialPlayed = function () { return ((this.gamedatas.cards >> 26) & 1) == 1; };
    KiriaiTheDuel.prototype.blueSpecialPlayed = function () { return ((this.gamedatas.cards >> 27) & 1) == 1; };
    KiriaiTheDuel.prototype.redPlayerId = function () {
        var _this = this;
        return this.isRedPlayer() ? this.player_id : +Object.keys(this.gamedatas.players).find(function (i) { return i != _this.player_id; });
    };
    KiriaiTheDuel.prototype.bluePlayerId = function () {
        var _this = this;
        return this.isRedPlayer() ? +Object.keys(this.gamedatas.players).find(function (i) { return i != _this.player_id; }) : this.player_id;
    };
    KiriaiTheDuel.prototype.setup = function (gamedatas) {
        var _this = this;
        console.log("Starting game setup", this.gamedatas);
        this.actionTitleLockingStrategy = 'actionbar';
        console.log(this.gamedatas.players, this.player_id, this.gamedatas.players[this.player_id], this.gamedatas.players[this.player_id].color, this.gamedatas.players[this.player_id].color == 'e54025');
        this.serverCards = gamedatas.cards;
        this.predictionModifiers = [];
        this.setupNotifications();
        var placeCard = function (id, target, offset) {
            if ($(target) == null) {
                console.error('Div "' + target + '" does not exist.');
                return;
            }
            var div = dojo.place(_this.format_block('jstpl_card', {
                src: g_gamethemeurl + 'img/placeholderCards.jpg',
                x: offset / 0.13,
                id: id
            }), target);
            return div;
        };
        for (var i = 0; i < 5; i++) {
            var red = placeCard("redHand_" + i, this.redPrefix() + 'Hand_' + i, i);
            var blue = placeCard("blueHand_" + i, this.bluePrefix() + 'Hand_' + i, i + 5);
            this.addTooltipHtml(red.parentElement.id, this.createTooltip(i, this.isRedPlayer()));
            this.addTooltipHtml(blue.parentElement.id, this.createTooltip(i, !this.isRedPlayer()));
        }
        var redSP = placeCard("redHand_" + 5, this.redPrefix() + 'Hand_' + 5, 13);
        var blueSP = placeCard("blueHand_" + 5, this.bluePrefix() + 'Hand_' + 5, 13);
        this.addTooltipHtml(redSP.parentElement.id, "<div id=\"redSpecialTooltip\">".concat(_('Waiting to draw starting cards...'), "</div>"));
        this.addTooltipHtml(blueSP.parentElement.id, "<div id=\"blueSpecialTooltip\">".concat(_('Waiting to draw starting cards...'), "</div>"));
        for (var i = 0; i < 2; i++) {
            var div = void 0;
            div = placeCard("redPlayed_" + i, this.redPrefix() + 'Played_' + i, 13);
            div = placeCard("bluePlayed_" + i, this.bluePrefix() + 'Played_' + i, 13);
            $('redPlayed_' + i).style.display = 'none';
            $('bluePlayed_' + i).style.display = 'none';
        }
        for (var _i = 0, _a = ['red_samurai', 'blue_samurai']; _i < _a.length; _i++) {
            var id = _a[_i];
            dojo.place(this.format_block('jstpl_card', {
                src: g_gamethemeurl + 'img/placeholder_SamuraiCards.jpg',
                x: 0,
                id: id + '_card'
            }), id);
        }
        var battlefieldType = this.battlefieldType();
        var battlefieldSize = battlefieldType == 1 ? 5 : 7;
        for (var i = 1; i <= battlefieldSize; i++) {
            dojo.place(this.format_block('jstpl_field_position', {
                id: i,
            }), $('battlefield'));
        }
        if (!this.isRedPlayer())
            $('battlefield').style.flexDirection = 'column-reverse';
        this.instantMatch();
        var _loop_3 = function (i) {
            var index = i + 1;
            dojo.connect($('myHand_' + i), 'onclick', this_2, function (e) { return _this.onHandCardClick(e, index); });
        };
        var this_2 = this;
        for (var i = 0; i < 6; i++) {
            _loop_3(i);
        }
        var _loop_4 = function (i) {
            var first = i == 0;
            dojo.connect($('myPlayed_' + i), 'onclick', this_3, function (e) { return _this.returnCardToHand(e, first); });
        };
        var this_3 = this;
        for (var i = 0; i < 2; i++) {
            _loop_4(i);
        }
        this.isInitialized = true;
        console.log("Ending game setup");
    };
    KiriaiTheDuel.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args);
        switch (stateName) {
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
            var element = $('samurai_field_position_' + index);
            if (element)
                element.classList.remove('highlight');
            else
                break;
            index++;
        }
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
                    var startingPositions = this.isRedPlayer() ? [4, 5, 6] : [2, 3, 4];
                    var _loop_5 = function (index) {
                        var element = $('samurai_field_position_' + index);
                        element.classList.add('highlight');
                        this_4.setupHandles.push(dojo.connect(element, 'onclick', this_4, function (e) {
                            if (_this.isRedPlayer()) {
                                _this.gamedatas.battlefield = (_this.gamedatas.battlefield & ~(15 << 0)) | (index << 0);
                            }
                            else {
                                _this.gamedatas.battlefield = (_this.gamedatas.battlefield & ~(15 << 5)) | (index << 5);
                            }
                            _this.instantMatch();
                        }));
                    };
                    var this_4 = this;
                    for (var _i = 0, startingPositions_1 = startingPositions; _i < startingPositions_1.length; _i++) {
                        var index = startingPositions_1[_i];
                        _loop_5(index);
                    }
                    if (this.isRedPlayer()) {
                        this.setupHandles.push(dojo.connect($('red_samurai'), 'onclick', this, function (e) {
                            _this.gamedatas.battlefield = _this.gamedatas.battlefield ^ (1 << 4);
                            _this.instantMatch();
                        }));
                    }
                    else {
                        this.setupHandles.push(dojo.connect($('blue_samurai'), 'onclick', this, function (e) {
                            _this.gamedatas.battlefield = _this.gamedatas.battlefield ^ (1 << 9);
                            _this.instantMatch();
                        }));
                    }
                    this.addActionButton('confirmBattlefieldButton', _('Confirm'), function (e) {
                        console.log('Confirming selection', e);
                        _this.ajaxAction('confirmedStanceAndPosition', {
                            isHeavenStance: (_this.isRedPlayer() ? _this.redStance() : _this.blueStance()) == 0,
                            position: (_this.isRedPlayer() ? _this.redPosition() : _this.bluePosition())
                        });
                        _this.cleanupSetupBattlefield();
                    });
                    break;
                case "pickCards":
                    this.addActionButton('confirmSelectionButton', _('Confirm'), function (e) {
                        console.log('Confirming selection', e);
                        if (_this.isRedPlayer()) {
                            if (_this.redPlayed0() == 0 && _this.redPlayed1() == 0) {
                                return;
                            }
                        }
                        else {
                            if (_this.bluePlayed0() == 0 && _this.bluePlayed1() == 0) {
                                return;
                            }
                        }
                        _this.lockTitleWithStatus(_('Sending moves to server...'));
                        _this.enqueueAjaxAction({
                            action: 'confirmedCards',
                            args: {}
                        });
                    });
                    break;
            }
        }
    };
    KiriaiTheDuel.prototype.createTooltip = function (x, play_flavor) {
        var tooltip = this.card_tooltips[x];
        return this.format_block('jstpl_tooltip', {
            title: _(tooltip.title),
            type: tooltip.type,
            typeName: _(tooltip.type == 'move' ? 'Movement' : tooltip.type == 'attack' ? 'Attack' : 'Special'),
            desc: _(tooltip.desc),
            src: g_gamethemeurl + 'img/tooltips.jpg',
            x: x / 0.07,
            flavor: play_flavor ? _('Click when playing cards to add/remove from the play area.') : ''
        });
    };
    KiriaiTheDuel.prototype.instantMatch = function () {
        var _this = this;
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
        var updateCard = function (target, card, isRed) {
            if (card == 0) {
                target.style.display = 'none';
                return;
            }
            target.style.display = 'block';
            target.classList.remove('bottomPicked');
            var offset;
            if (card <= 5)
                offset = (isRed ? card : card + 5) - 1;
            else if (card <= 7) {
                offset = (isRed ? card - 5 : card) - 1;
                target.classList.add('bottomPicked');
            }
            else if (card == 8)
                offset = isRed ? _this.redSpecialCard() + 9 : _this.blueSpecialCard() + 9;
            else
                offset = 13;
            target.style.objectPosition = (offset / 0.13) + '% 0px';
        };
        updateCard($('redPlayed_0'), this.redPlayed0(), true);
        updateCard($('redPlayed_1'), this.redPlayed1(), true);
        updateCard($('bluePlayed_0'), this.bluePlayed0(), false);
        updateCard($('bluePlayed_1'), this.bluePlayed1(), false);
        var playedToHand = function (index) {
            if (index == 0)
                return -1;
            if (index <= 5)
                return index - 1;
            if (index <= 7)
                return index - 6;
            if (index == 8)
                return 5;
            return -1;
        };
        var redPlayed = [];
        var bluePlayed = [];
        redPlayed.push(playedToHand(this.redPlayed0()));
        redPlayed.push(playedToHand(this.redPlayed1()));
        bluePlayed.push(playedToHand(this.bluePlayed0()));
        bluePlayed.push(playedToHand(this.bluePlayed1()));
        for (var i = 0; i < 6; i++) {
            if (i < 5) {
                if (this.redDiscarded() - 1 == i)
                    $('redHand_' + i).parentElement.classList.add('discarded');
                else
                    $('redHand_' + i).parentElement.classList.remove('discarded');
                if (this.blueDiscarded() - 1 == i)
                    $('blueHand_' + i).parentElement.classList.add('discarded');
                else
                    $('blueHand_' + i).parentElement.classList.remove('discarded');
            }
            if (redPlayed.includes(i))
                $('redHand_' + i).parentElement.classList.add('played');
            else
                $('redHand_' + i).parentElement.classList.remove('played');
            if (bluePlayed.includes(i))
                $('blueHand_' + i).parentElement.classList.add('played');
            else
                $('blueHand_' + i).parentElement.classList.remove('played');
        }
        if (this.redSpecialCard() != 0 || this.blueSpecialCard() != 0) {
            var redTarget = $('redHand_5').parentElement;
            var blueTarget = $('blueHand_5').parentElement;
            var notPlayedTooltip = function (cardVisible) {
                var pair = cardVisible == 1 ? [6, 7] : cardVisible == 2 ? [5, 7] : [5, 6];
                return '<div class="tooltip-desc">' + _('Opponent has not played their special card yet. It can be one of the following:') + '</div><div class="tooltip-two-column">' + _this.createTooltip(pair[0], false) + _this.createTooltip(pair[1], false) + '</div>';
            };
            if (this.redSpecialCard() == 0) {
                this.addTooltipHtml(redTarget.id, notPlayedTooltip(this.blueSpecialCard()));
            }
            else {
                this.addTooltipHtml(redTarget.id, this.createTooltip(4 + this.redSpecialCard(), this.isRedPlayer()));
            }
            if (this.blueSpecialCard() == 0) {
                this.addTooltipHtml(blueTarget.id, notPlayedTooltip(this.redSpecialCard()));
            }
            else {
                this.addTooltipHtml(blueTarget.id, this.createTooltip(4 + this.blueSpecialCard(), !this.isRedPlayer()));
            }
        }
        $('redHand_5').style.objectPosition = ((this.redSpecialCard() == 0 ? 13 : this.redSpecialCard() + 9) / 0.13) + '% 0px';
        if (this.redSpecialPlayed())
            $('redHand_5').parentElement.classList.add('discarded');
        else
            $('redHand_5').parentElement.classList.remove('discarded');
        $('blueHand_5').style.objectPosition = ((this.blueSpecialCard() == 0 ? 13 : this.blueSpecialCard() + 9) / 0.13) + '% 0px';
        if (this.blueSpecialPlayed())
            $('blueHand_5').parentElement.classList.add('discarded');
        else
            $('blueHand_5').parentElement.classList.remove('discarded');
        var placeSamurai = function (stance, position, isRed) {
            var rot = stance == 0 ? -45 : 135;
            var posElement = $('samurai_field_position_' + position);
            var transform;
            if (posElement) {
                _this.placeOnObject((isRed ? 'red' : 'blue') + '_samurai_offset', posElement);
                if (!_this.isRedPlayer())
                    transform = isRed ? 'translate(-95%, -11.5%) ' : 'translate(95%, 11.5%) ';
                else
                    transform = isRed ? 'translate(95%, 11.5%) scale(-1, -1) ' : 'translate(-95%, -11.5%) scale(-1, -1) ';
            }
            else {
                rot += 45;
                transform = 'translate(45%, ' + ((_this.isRedPlayer() ? isRed : !isRed) ? "" : "-") + '75%) ';
            }
            $((isRed ? 'red' : 'blue') + '_samurai').style.transform = transform + 'rotate(' + rot + 'deg)';
        };
        placeSamurai(this.redStance(), this.redPosition(), true);
        placeSamurai(this.blueStance(), this.bluePosition(), false);
        var redSprite = !this.redHit() ? 0 : 2;
        var blueSprite = !this.blueHit() ? 1 : 3;
        $('red_samurai_card').style.objectPosition = (redSprite / 0.03) + '% 0px';
        $('blue_samurai_card').style.objectPosition = (blueSprite / 0.03) + '% 0px';
        var battlefield = $('battlefield');
        var battlefieldWidth = battlefield.getBoundingClientRect().width;
        var samuraiWidth = battlefieldWidth * 0.24;
        dojo.style($('red_samurai'), 'width', samuraiWidth + 'px');
        dojo.style($('blue_samurai'), 'width', samuraiWidth + 'px');
    };
    KiriaiTheDuel.prototype.addPredictionModifier = function (func) {
        var _this = this;
        var key = this.predictionKey++;
        this.predictionModifiers.push({ key: key, func: func });
        this.updateCardsWithPredictions();
        return function () {
            _this.predictionModifiers = _this.predictionModifiers.filter(function (mod) { return mod.key != key; });
            _this.updateCardsWithPredictions();
        };
    };
    KiriaiTheDuel.prototype.updateCardsWithPredictions = function () {
        var cards = this.serverCards;
        for (var _i = 0, _a = this.predictionModifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            console.log('cards:', cards.toString(2));
            cards = mod.func(cards);
        }
        console.log('cards:', cards.toString(2));
        this.gamedatas.cards = cards;
        this.instantMatch();
    };
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
}(GameguiCookbook));
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
], function (_dojo, declare) {
    return declare("bgagame.kiriaitheduel", ebg.core.gamegui, new KiriaiTheDuel());
});
