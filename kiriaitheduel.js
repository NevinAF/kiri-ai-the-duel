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
GameguiCookbook.prototype.infoDialog = function (message, title, callback) {
    var myDlg = new ebg.popindialog();
    console.log(myDlg);
    myDlg.create('myDialogUniqueId');
    myDlg.setTitle(_(title));
    myDlg.setMaxWidth(500);
    var html = '<div>' + message + '</div><a href="#" id="info_dialog_button" class="bgabutton bgabutton_blue"><span>Ok</span></a>';
    myDlg.setContent(html);
    myDlg.show(!1);
    myDlg.hideCloseIcon();
    dojo.connect($('info_dialog_button'), 'onclick', this, function (event) {
        event.preventDefault();
        callback === null || callback === void 0 ? void 0 : callback(event);
        myDlg.destroy();
    });
    return myDlg;
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
        _this.predictionKey = 0;
        _this.onHandCardClick = function (evt, index) {
            var _a;
            evt.preventDefault();
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
                args: { card: index },
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
            _this.gamedatas.battlefield = notif.args.battlefield;
            _this.serverCards = notif.args.cards;
            _this.updateCardsWithPredictions();
            _this.instantMatch();
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
            placeCard("redHand_" + i, this.redPrefix() + 'Hand_' + i, i);
            placeCard("blueHand_" + i, this.bluePrefix() + 'Hand_' + i, i + 5);
        }
        placeCard("redHand_" + 5, this.redPrefix() + 'Hand_' + 5, 13);
        placeCard("blueHand_" + 5, this.bluePrefix() + 'Hand_' + 5, 13);
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
        var battlefieldSize = 6;
        for (var i = 1; i <= battlefieldSize; i++) {
            dojo.place(this.format_block('jstpl_field_position', {
                id: i,
            }), $('battlefield'));
        }
        if (!this.isRedPlayer())
            $('battlefield').style.flexDirection = 'column-reverse';
        this.instantMatch();
        var _loop_1 = function (i) {
            var index = i + 1;
            dojo.connect($('myHand_' + i), 'onclick', this_1, function (e) { return _this.onHandCardClick(e, index); });
        };
        var this_1 = this;
        for (var i = 0; i < 6; i++) {
            _loop_1(i);
        }
        var _loop_2 = function (i) {
            var first = i == 0;
            dojo.connect($('myPlayed_' + i), 'onclick', this_2, function (e) { return _this.returnCardToHand(e, first); });
        };
        var this_2 = this;
        for (var i = 0; i < 2; i++) {
            _loop_2(i);
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
            default:
                break;
        }
    };
    KiriaiTheDuel.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        console.log('onUpdateActionButtons: ' + stateName, args);
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
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
        var redRot = this.redStance() == 0 ? 'rotate(-45deg)' : 'rotate(135deg)';
        var blueRot = this.blueStance() == 0 ? 'rotate(-45deg)' : 'rotate(135deg)';
        if (!this.isRedPlayer()) {
            $('red_samurai').style.transform = 'translate(-95%, -11.5%) ' + redRot;
            $('blue_samurai').style.transform = 'translate(95%, 11.5%) ' + blueRot;
        }
        else {
            $('red_samurai').style.transform = 'translate(95%, 11.5%) scale(-1, -1) ' + redRot;
            $('blue_samurai').style.transform = 'translate(-95%, -11.5%) scale(-1, -1) ' + blueRot;
        }
        if ($('red_samurai_field_position_' + this.redPosition()))
            this.placeOnObject('red_samurai_offset', 'red_samurai_field_position_' + this.redPosition());
        if ($('blue_samurai_field_position_' + this.bluePosition()))
            this.placeOnObject('blue_samurai_offset', 'blue_samurai_field_position_' + this.bluePosition());
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
