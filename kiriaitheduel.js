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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define("bgagame/kiriaitheduel", ["require", "exports", "dojo", "ebg/core/gamegui", "cookbook/common", "cookbook/nevinAF/titlelocking", "cookbook/nevinAF/playeractionqueue", "cookbook/nevinAF/confirmationtimeout", "ebg/counter"], function (require, exports, dojo, Gamegui, CommonMixin, TitleLockingMixin, PlayerActionQueue, ConfirmationTimeout) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    var KiriaiTheDuel = (function (_super) {
        __extends(KiriaiTheDuel, _super);
        function KiriaiTheDuel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isInitialized = false;
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
            _this.card_names = [
                'approach',
                'charge',
                'high-strike',
                'low-strike',
                'balance-strike',
                'retreat',
                'change-stance',
                'special'
            ];
            _this.hide_second_for_animations = false;
            _this.server_player_state = 0;
            _this.predictionKey = 0;
            _this.predictionModifiers = [];
            _this.onHandCardClick = function (evt, index) {
                var _a;
                evt.preventDefault();
                if (!_this.checkAction('pickedFirst', true)) {
                    return;
                }
                if ((_a = _this.actionQueue.queue) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.action === 'confirmedCards' && a.state === 'inProgress'; })) {
                    return;
                }
                if (index == _this.playerDiscarded()) {
                    return;
                }
                if (index == 6 && _this.playerSpecialPlayed()) {
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
                _this.actionQueue.filterActionQueue('confirmedCards');
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
                    return;
                }
                if (first) {
                    if (_this.actionQueue.filterActionQueue('pickedFirst')) {
                        return;
                    }
                }
                else {
                    if (_this.actionQueue.filterActionQueue('pickedSecond')) {
                        return;
                    }
                }
                var indexOffset = first ? 6 : 10;
                var callback = _this.addPredictionModifier(function (cards) {
                    return cards & ~(15 << indexOffset);
                });
                _this.actionQueue.filterActionQueue('confirmedCards');
                _this.actionQueue.enqueueAjaxAction({
                    action: first ? "undoFirst" : "undoSecond",
                    args: {},
                    callback: callback
                });
            };
            _this.notif_instantMatch = function (notif) {
                var _a, _b, _c, _d, _e;
                _this.server_player_state = notif.args.player_state;
                _this.gamedatas.opponent_state = notif.args.opponent_state;
                _this.updateCardsWithPredictions(true);
                for (var player in _this.gamedatas.players) {
                    var winner = ((_a = notif.args.winner) === null || _a === void 0 ? void 0 : _a.toString()) == player;
                    if (player == _this.player_id.toString()) {
                        (_b = _this.scoreCtrl[player]) === null || _b === void 0 ? void 0 : _b.toValue(_this.opponentHit() ? (winner ? 2 : 1) : 0);
                        if (winner) {
                            (_c = $('opponent_samurai')) === null || _c === void 0 ? void 0 : _c.classList.add('loser');
                        }
                    }
                    else {
                        (_d = _this.scoreCtrl[player]) === null || _d === void 0 ? void 0 : _d.toValue(_this.playerHit() ? (winner ? 2 : 1) : 0);
                        if (winner) {
                            (_e = $('player_samurai')) === null || _e === void 0 ? void 0 : _e.classList.add('loser');
                        }
                    }
                }
            };
            return _this;
        }
        KiriaiTheDuel.prototype.playerPosition = function () { return (this.gamedatas.player_state >> 0) & 15; };
        KiriaiTheDuel.prototype.playerStance = function () { return (this.gamedatas.player_state >> 4) & 1; };
        KiriaiTheDuel.prototype.playerHit = function () { return ((this.gamedatas.player_state >> 5) & 1) == 1; };
        KiriaiTheDuel.prototype.playerPlayed0 = function () { return (this.gamedatas.player_state >> 6) & 15; };
        KiriaiTheDuel.prototype.playerPlayed1 = function () {
            var card = (this.gamedatas.player_state >> 10) & 15;
            if (this.hide_second_for_animations && card != 0 && this.isSpectator)
                return 9;
            return card;
        };
        KiriaiTheDuel.prototype.playerDiscarded = function () { return (this.gamedatas.player_state >> 14) & 7; };
        KiriaiTheDuel.prototype.playerSpecialCard = function () { return (this.gamedatas.player_state >> 17) & 3; };
        KiriaiTheDuel.prototype.playerSpecialPlayed = function () { return ((this.gamedatas.player_state >> 19) & 1) == 1; };
        KiriaiTheDuel.prototype.opponentPosition = function () { return (this.gamedatas.opponent_state >> 0) & 15; };
        KiriaiTheDuel.prototype.opponentStance = function () { return (this.gamedatas.opponent_state >> 4) & 1; };
        KiriaiTheDuel.prototype.opponentHit = function () { return ((this.gamedatas.opponent_state >> 5) & 1) == 1; };
        KiriaiTheDuel.prototype.opponentPlayed0 = function () { return (this.gamedatas.opponent_state >> 6) & 15; };
        KiriaiTheDuel.prototype.opponentPlayed1 = function () {
            var card = (this.gamedatas.opponent_state >> 10) & 15;
            if (this.hide_second_for_animations && card != 0)
                return 9;
            return card;
        };
        KiriaiTheDuel.prototype.opponentDiscarded = function () { return (this.gamedatas.opponent_state >> 14) & 7; };
        KiriaiTheDuel.prototype.opponentSpecialCard = function () { return (this.gamedatas.opponent_state >> 17) & 3; };
        KiriaiTheDuel.prototype.opponentSpecialPlayed = function () { return ((this.gamedatas.opponent_state >> 19) & 1) == 1; };
        KiriaiTheDuel.prototype.formatSVGURL = function (name) { return "".concat(g_gamethemeurl).concat(PLAYER_IMAGES, "/").concat(name, ".svg"); };
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
            var _loop_1 = function (i) {
                var child = slot.children[i];
                if (!(child instanceof HTMLImageElement))
                    return "continue";
                if (src != null) {
                    child.onload = function () { child.style.display = 'block'; };
                    child.src = src;
                }
                else
                    child.style.display = 'none';
                return { value: void 0 };
            };
            for (var i = 0; i < slot.children.length; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            console.error('Invalid slot: ', slot);
        };
        KiriaiTheDuel.prototype.setup = function (gamedatas) {
            var _this = this;
            this.actionQueue.actionTitleLockingStrategy = 'actionbar';
            this.server_player_state = gamedatas.player_state;
            this.setupNotifications();
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
            var _loop_2 = function (i) {
                var index = i + 1;
                dojo.connect($('player-hand_' + i), 'onclick', this_1, function (e) { return _this.onHandCardClick(e, index); });
            };
            var this_1 = this;
            for (var i = 0; i < 6; i++) {
                _loop_2(i);
            }
            var _loop_3 = function (i) {
                var first = i == 0;
                dojo.connect($('player_played_' + i), 'onclick', this_2, function (e) { return _this.returnCardToHand(e, first); });
            };
            var this_2 = this;
            for (var i = 0; i < 2; i++) {
                _loop_3(i);
            }
            [$('discard_icon'), $('special_icon'), $('opponent_hand_icon')].forEach(function (target) {
                target === null || target === void 0 ? void 0 : target.addEventListener('mouseenter', function () {
                    $('hands').classList.add('show-opponent-area');
                });
                target === null || target === void 0 ? void 0 : target.addEventListener('mouseleave', function () {
                    $('hands').classList.remove('show-opponent-area');
                });
            });
            this.isInitialized = true;
        };
        KiriaiTheDuel.prototype.onEnteringState = function (stateName, args) {
            var _a, _b, _c, _d;
            switch (stateName) {
                case "gameEnd":
                    for (var player in this.gamedatas.players) {
                        if (player == this.player_id.toString()) {
                            if (((_a = this.scoreCtrl[player]) === null || _a === void 0 ? void 0 : _a.getValue()) == 2)
                                (_b = $('opponent_samurai')) === null || _b === void 0 ? void 0 : _b.classList.add('loser');
                        }
                        else {
                            if (((_c = this.scoreCtrl[player]) === null || _c === void 0 ? void 0 : _c.getValue()) == 2)
                                (_d = $('player_samurai')) === null || _d === void 0 ? void 0 : _d.classList.add('loser');
                        }
                    }
                    this.hide_second_for_animations = false;
                    break;
            }
        };
        KiriaiTheDuel.prototype.onLeavingState = function (stateName) {
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
            if (this.isCurrentPlayerActive()) {
                switch (stateName) {
                    case "setupBattlefield":
                        (_a = this.setupHandles) === null || _a === void 0 ? void 0 : _a.forEach(function (h) { return dojo.disconnect(h); });
                        this.setupHandles = [];
                        var _loop_4 = function (index) {
                            var element = $('battlefield_position_' + index);
                            element.classList.add('highlight');
                            this_3.setupHandles.push(dojo.connect(element, 'onclick', this_3, function (e) {
                                _this.gamedatas.player_state = (_this.gamedatas.player_state & ~(15 << 0)) | (index << 0);
                                _this.instantMatch();
                            }));
                            this_3.addTooltip(element.id, _('Select a starting position'), _('Click to set this as your starting position.'));
                        };
                        var this_3 = this;
                        for (var _i = 0, _b = [2, 3, 4]; _i < _b.length; _i++) {
                            var index = _b[_i];
                            _loop_4(index);
                        }
                        this.addTooltip('player_samurai', _("This Samurai Card shows your samurai's positions on the battlefield, stance (heaven or earth), and if it is damaged."), _('Click to switch your stance'));
                        this.setupHandles.push(dojo.connect($('player_samurai'), 'onclick', this, function (e) {
                            _this.gamedatas.player_state = _this.gamedatas.player_state ^ (1 << 4);
                            _this.instantMatch();
                        }));
                        this.addActionButton('confirmBattlefieldButton', _('Confirm'), function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this.checkAction('confirmedStanceAndPosition'))
                                            return [2];
                                        return [4, this.confirmationTimeout.promise(e)];
                                    case 1:
                                        _a.sent();
                                        this.ajaxAction('confirmedStanceAndPosition', {
                                            isHeavenStance: this.playerStance() == 0,
                                            position: this.playerPosition()
                                        });
                                        this.cleanupSetupBattlefield();
                                        return [2];
                                }
                            });
                        }); });
                        break;
                    case "pickCards":
                        this.addActionButton('confirmSelectionButton', _('Confirm'), function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (this.playerPlayed0() == 0 || this.playerPlayed1() == 0) {
                                            this.showMessage(_('You must play both cards before confirming!'), 'error');
                                            return [2];
                                        }
                                        return [4, this.confirmationTimeout.promise(e)];
                                    case 1:
                                        _a.sent();
                                        this.lockTitleWithStatus(_('Sending moves to server...'));
                                        this.actionQueue.enqueueAjaxAction({
                                            action: 'confirmedCards',
                                            args: {}
                                        });
                                        return [2];
                                }
                            });
                        }); });
                        break;
                }
            }
        };
        KiriaiTheDuel.prototype.getSamuraiOffsets = function () {
            var battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;
            var play_area_bounds = $('play-area').getBoundingClientRect();
            var target_bounds_player = $('battlefield_position_' + this.playerPosition()).getBoundingClientRect();
            var target_bounds_opponent = $('battlefield_position_' + (battlefieldSize - this.opponentPosition() + 1)).getBoundingClientRect();
            return {
                player_x: (target_bounds_player.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%',
                player_y: (target_bounds_player.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%',
                opponent_x: (target_bounds_opponent.left - play_area_bounds.left) / play_area_bounds.width * 100 + '%',
                opponent_y: (target_bounds_opponent.top - play_area_bounds.top) / play_area_bounds.height * 100 + '%'
            };
        };
        KiriaiTheDuel.prototype.instantMatch = function () {
            var _this = this;
            var player_area = $('game-area');
            player_area.className = '';
            var updatePlayed = function (target, first, player) {
                if (!(target instanceof HTMLElement))
                    return;
                var card = player ?
                    (first ? _this.playerPlayed0() : _this.playerPlayed1()) :
                    (first ? _this.opponentPlayed0() : _this.opponentPlayed1());
                var src = null;
                if (card != 0 && card != 9)
                    player_area.classList.add(_this.card_names[card - 1] + (player ? '-player' : '-opponent') + "-played" + (first ? '-first' : '-second'));
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
            if (this.playerDiscarded() != 0)
                player_area.classList.add(this.card_names[this.playerDiscarded() - 1] + "-player-discarded");
            if (this.opponentDiscarded() != 0)
                player_area.classList.add(this.card_names[this.opponentDiscarded() - 1] + "-opponent-discarded");
            if (this.opponentSpecialPlayed())
                player_area.classList.add("opponent-played-special");
            $('special_icon').src =
                this.formatSVGURL(this.opponentSpecialPlayed() ? 'opponent-icon-discard' : 'opponent-icon-hand');
            if (this.playerSpecialPlayed())
                player_area.classList.add("player-played-special");
            this.setCardSlot('player-hand_5', this.specialCardURL(true));
            this.setCardSlot('opponent-hand_5', this.specialCardURL(false));
            var player_samurai = $('player_samurai');
            var opponent_samurai = $('opponent_samurai');
            var _a = this.getSamuraiOffsets(), player_x = _a.player_x, player_y = _a.player_y, opponent_x = _a.opponent_x, opponent_y = _a.opponent_y;
            player_samurai.style.left = player_x;
            player_samurai.style.top = player_y;
            opponent_samurai.style.left = opponent_x;
            opponent_samurai.style.top = opponent_y;
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
            return function () {
                _this.predictionModifiers = _this.predictionModifiers.filter(function (mod) { return mod.key != key; });
                _this.updateCardsWithPredictions();
            };
        };
        KiriaiTheDuel.prototype.updateCardsWithPredictions = function (match) {
            if (match === void 0) { match = true; }
            var cards = this.server_player_state;
            for (var _i = 0, _a = this.predictionModifiers; _i < _a.length; _i++) {
                var mod = _a[_i];
                cards = mod.func(cards);
            }
            this.gamedatas.player_state = cards;
            if (match)
                this.instantMatch();
        };
        KiriaiTheDuel.prototype.setupNotifications = function () {
            var _this = this;
            if (this.isSpectator) {
                this.subscribeNotif('_spectator_ battlefield setup', this.notif_instantMatch);
                this.subscribeNotif('_spectator_ played card', this.notif_instantMatch);
                this.subscribeNotif('_spectator_ undo card', this.notif_instantMatch);
                this.subscribeNotif('_spectator_ before first resolve', this.notif_beforeFirstResolve);
                this.subscribeNotif('_spectator_ before second resolve', this.notif_beforeSecondResolve);
                this.subscribeNotif('_spectator_ after resolve', this.notif_afterResolve);
                this.subscribeNotif('_spectator_ player(s) charged', function (n) { return _this.notif_playerMoved(n, true); });
                this.subscribeNotif('_spectator_ player(s) moved', function (n) { return _this.notif_playerMoved(n, false); });
                this.subscribeNotif('_spectator_ player(s) changed stance', this.notif_playerStance);
                this.subscribeNotif('_spectator_ player(s) attacked', this.notif_playerAttacked);
                this.subscribeNotif('_spectator_ player(s) hit', this.notif_instantMatch);
                this.notifqueue.setSynchronous('_spectator_ battlefield setup', 1000);
                this.notifqueue.setSynchronous('_spectator_ before first resolve', 2000);
                this.notifqueue.setSynchronous('_spectator_ before second resolve', 1800);
                this.notifqueue.setSynchronous('_spectator_ after resolve', 1000);
                this.notifqueue.setSynchronous('_spectator_ player(s) charged', 2000);
                this.notifqueue.setSynchronous('_spectator_ player(s) moved', 2000);
                this.notifqueue.setSynchronous('_spectator_ player(s) changed stance', 2000);
                this.notifqueue.setSynchronous('_spectator_ player(s) attacked', 3000);
                this.notifqueue.setSynchronous('_spectator_ player(s) hit', 2000);
            }
            else {
                this.subscribeNotif('battlefield setup', this.notif_instantMatch);
                this.subscribeNotif('played card', this.notif_instantMatch);
                this.subscribeNotif('undo card', this.notif_instantMatch);
                this.subscribeNotif('before first resolve', this.notif_beforeFirstResolve);
                this.subscribeNotif('before second resolve', this.notif_beforeSecondResolve);
                this.subscribeNotif('after resolve', this.notif_afterResolve);
                this.subscribeNotif('player(s) charged', function (n) { return _this.notif_playerMoved(n, true); });
                this.subscribeNotif('player(s) moved', function (n) { return _this.notif_playerMoved(n, false); });
                this.subscribeNotif('player(s) changed stance', this.notif_playerStance);
                this.subscribeNotif('player(s) attacked', this.notif_playerAttacked);
                this.subscribeNotif('player(s) hit', this.notif_instantMatch);
                this.notifqueue.setSynchronous('battlefield setup', 1000);
                this.notifqueue.setSynchronous('before first resolve', 2000);
                this.notifqueue.setSynchronous('before second resolve', 1800);
                this.notifqueue.setSynchronous('after resolve', 1000);
                this.notifqueue.setSynchronous('player(s) charged', 2000);
                this.notifqueue.setSynchronous('player(s) moved', 2000);
                this.notifqueue.setSynchronous('player(s) changed stance', 2000);
                this.notifqueue.setSynchronous('player(s) attacked', 3000);
                this.notifqueue.setSynchronous('player(s) hit', 2000);
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ battlefield setup', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ played card', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ undo card', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ before first resolve', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ before second resolve', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ after resolve', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) charged', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) moved', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) changed stance', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) attacked', function () { return true; });
                this.notifqueue.setIgnoreNotificationCheck('_spectator_ player(s) hit', function () { return true; });
            }
        };
        KiriaiTheDuel.prototype.notif_beforeFirstResolve = function (notif) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.hide_second_for_animations = true;
                    this.server_player_state = notif.args.player_state;
                    this.gamedatas.opponent_state = notif.args.opponent_state;
                    this.updateCardsWithPredictions(true);
                    return [2];
                });
            });
        };
        KiriaiTheDuel.prototype.notif_beforeSecondResolve = function (notif) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, new Promise(function (res) { return setTimeout(res, 750); })];
                        case 1:
                            _a.sent();
                            this.hide_second_for_animations = false;
                            this.server_player_state = notif.args.player_state;
                            this.gamedatas.opponent_state = notif.args.opponent_state;
                            this.updateCardsWithPredictions(true);
                            return [2];
                    }
                });
            });
        };
        KiriaiTheDuel.prototype.notif_afterResolve = function (notif) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, new Promise(function (res) { return setTimeout(res, 750); })];
                        case 1:
                            _a.sent();
                            this.server_player_state = notif.args.player_state;
                            this.gamedatas.opponent_state = notif.args.opponent_state;
                            this.updateCardsWithPredictions(true);
                            return [2];
                    }
                });
            });
        };
        KiriaiTheDuel.prototype.notif_playerStance = function (notif) {
            return __awaiter(this, void 0, void 0, function () {
                var first, player_card, opponent_card, player_card_div, opponent_card_div, player_samurai, opponent_samurai, player_area;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.server_player_state = notif.args.player_state;
                            this.gamedatas.opponent_state = notif.args.opponent_state;
                            this.updateCardsWithPredictions(false);
                            first = this.playerPlayed0() != 0 && this.opponentPlayed0() != 0;
                            player_card = first ? this.playerPlayed0() : this.playerPlayed1();
                            opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
                            player_card_div = $('player_played_' + (first ? 0 : 1));
                            opponent_card_div = $('opponent_played_' + (first ? 0 : 1));
                            player_samurai = $('player_samurai');
                            opponent_samurai = $('opponent_samurai');
                            if ((player_card == 8 && this.playerSpecialCard() != 3 && notif.args.isSpecial) || (player_card == 7 && !notif.args.isSpecial))
                                player_card_div.classList.add('evaluating');
                            if ((opponent_card == 8 && this.opponentSpecialCard() != 3 && notif.args.isSpecial) || ((opponent_card == 7 && !notif.args.isSpecial)))
                                opponent_card_div.classList.add('evaluating');
                            return [4, new Promise(function (res) { return setTimeout(res, 500); })];
                        case 1:
                            _a.sent();
                            player_area = $('game-area');
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
                            return [4, new Promise(function (res) { return setTimeout(res, 1000); })];
                        case 2:
                            _a.sent();
                            player_samurai.classList.remove('rotating');
                            opponent_samurai.classList.remove('rotating');
                            player_card_div.classList.remove('evaluating');
                            opponent_card_div.classList.remove('evaluating');
                            this.instantMatch();
                            return [2];
                    }
                });
            });
        };
        KiriaiTheDuel.prototype.notif_playerMoved = function (notif, charged) {
            return __awaiter(this, void 0, void 0, function () {
                var first, player_card, opponent_card, player_card_div, opponent_card_div, player_charged, player_singleMoved, player_stanceCorrect, opponent_charged, opponent_singleMoved, opponent_stanceCorrect, player_samurai, opponent_samurai;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.server_player_state = notif.args.player_state;
                            this.gamedatas.opponent_state = notif.args.opponent_state;
                            this.updateCardsWithPredictions(false);
                            first = this.playerPlayed0() != 0 && this.opponentPlayed0() != 0;
                            player_card = first ? this.playerPlayed0() : this.playerPlayed1();
                            opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
                            player_card_div = $('player_played_' + (first ? 0 : 1));
                            opponent_card_div = $('opponent_played_' + (first ? 0 : 1));
                            player_charged = player_card == 2 && charged;
                            player_singleMoved = (player_card == 1 || player_card == 6) && !charged;
                            player_stanceCorrect = notif.args.isHeaven == (this.playerStance() == 0);
                            if ((player_charged || player_singleMoved) && player_stanceCorrect)
                                player_card_div.classList.add('evaluating');
                            opponent_charged = opponent_card == 2 && charged;
                            opponent_singleMoved = (opponent_card == 1 || opponent_card == 6) && !charged;
                            opponent_stanceCorrect = notif.args.isHeaven == (this.opponentStance() == 0);
                            if ((opponent_charged || opponent_singleMoved) && opponent_stanceCorrect)
                                opponent_card_div.classList.add('evaluating');
                            return [4, new Promise(function (res) { return setTimeout(res, 500); })];
                        case 1:
                            _a.sent();
                            player_samurai = $('player_samurai');
                            opponent_samurai = $('opponent_samurai');
                            player_samurai.style.transition = '750ms left, 750ms top';
                            opponent_samurai.style.transition = '750ms left, 750ms top';
                            this.instantMatch();
                            return [4, new Promise(function (res) { return setTimeout(res, 1000); })];
                        case 2:
                            _a.sent();
                            player_samurai.style.transition = '';
                            opponent_samurai.style.transition = '';
                            player_card_div.classList.remove('evaluating');
                            opponent_card_div.classList.remove('evaluating');
                            return [2];
                    }
                });
            });
        };
        KiriaiTheDuel.prototype.notif_playerAttacked = function (notif) {
            return __awaiter(this, void 0, void 0, function () {
                var first, player_card, opponent_card, player_position, opponent_position, battlefieldSize, player_card_div, opponent_card_div, effectAndPosition, _a, player_hit_positions, player_stance_good, player_card_valid, _b, opponent_hit_positions, opponent_stance_good, opponent_card_valid, player_hit, opponent_hit, source_player_0_className, source_player_1_className, source_opponent_0_className, source_opponent_1_className, _i, player_hit_positions_1, pos, _c, opponent_hit_positions_1, pos, animateCard, _d, player_hit_positions_2, pos, _e, opponent_hit_positions_2, pos;
                var _this = this;
                var _f, _g, _h, _j, _k, _l, _m, _o;
                return __generator(this, function (_p) {
                    switch (_p.label) {
                        case 0:
                            this.server_player_state = notif.args.player_state;
                            this.gamedatas.opponent_state = notif.args.opponent_state;
                            this.updateCardsWithPredictions(true);
                            first = notif.args.first;
                            player_card = first ? this.playerPlayed0() : this.playerPlayed1();
                            opponent_card = first ? this.opponentPlayed0() : this.opponentPlayed1();
                            player_position = this.playerPosition();
                            opponent_position = this.opponentPosition();
                            battlefieldSize = this.gamedatas.battlefield_type == 1 ? 5 : 7;
                            player_card_div = $('player_played_' + (first ? 0 : 1));
                            opponent_card_div = $('opponent_played_' + (first ? 0 : 1));
                            effectAndPosition = function (card, position, stance, special) {
                                switch (card) {
                                    case 3: return [[position + 2], stance == 0];
                                    case 4: return [[position + 1], stance == 1];
                                    case 5: return [[position], true];
                                    case 8:
                                        switch (special) {
                                            case 1: return [[position, position + 1], stance == 0];
                                            case 2: return [[position + 2, position + 3], stance == 1];
                                            case 3: return [[], true];
                                            default: throw new Error('Invalid special card: ' + special);
                                        }
                                    default: return [[], false];
                                }
                            };
                            _a = effectAndPosition(player_card, player_position, this.playerStance(), this.playerSpecialCard()), player_hit_positions = _a[0], player_stance_good = _a[1];
                            player_card_valid = player_hit_positions.length > 0 || player_stance_good;
                            _b = effectAndPosition(opponent_card, opponent_position, this.opponentStance(), this.opponentSpecialCard()), opponent_hit_positions = _b[0], opponent_stance_good = _b[1];
                            opponent_card_valid = opponent_hit_positions.length > 0 || opponent_stance_good;
                            player_hit_positions = player_hit_positions.filter(function (p) { return p >= 1 && p <= battlefieldSize; });
                            opponent_hit_positions = opponent_hit_positions.filter(function (p) { return p >= 1 && p <= battlefieldSize; });
                            opponent_hit_positions = opponent_hit_positions.map(function (p) { return battlefieldSize - p + 1; });
                            player_hit = player_hit_positions.includes(battlefieldSize - opponent_position + 1) && player_stance_good;
                            opponent_hit = opponent_hit_positions.includes(player_position) && opponent_stance_good;
                            if (player_stance_good && player_hit_positions.length == 0 && opponent_hit) {
                                player_hit = true;
                                opponent_hit = false;
                            }
                            else if (opponent_stance_good && opponent_hit_positions.length == 0 && player_hit) {
                                player_hit = false;
                                opponent_hit = true;
                            }
                            source_player_0_className = $('player' + '-slash-effect_0').className;
                            source_player_1_className = $('player' + '-slash-effect_1').className;
                            source_opponent_0_className = $('opponent' + '-slash-effect_0').className;
                            source_opponent_1_className = $('opponent' + '-slash-effect_1').className;
                            if (player_card_valid)
                                player_card_div.classList.add('evaluating');
                            if (opponent_card_valid)
                                opponent_card_div.classList.add('evaluating');
                            return [4, new Promise(function (res) { return setTimeout(res, 500); })];
                        case 1:
                            _p.sent();
                            if (player_card_valid) {
                                if (player_stance_good) {
                                    for (_i = 0, player_hit_positions_1 = player_hit_positions; _i < player_hit_positions_1.length; _i++) {
                                        pos = player_hit_positions_1[_i];
                                        (_f = $('battlefield_position_' + pos)) === null || _f === void 0 ? void 0 : _f.classList.add('player_highlight');
                                    }
                                }
                                if (!player_stance_good) {
                                    (_g = $('player_samurai')) === null || _g === void 0 ? void 0 : _g.classList.add('attack-stance-bad');
                                }
                            }
                            if (opponent_card_valid) {
                                if (opponent_stance_good) {
                                    for (_c = 0, opponent_hit_positions_1 = opponent_hit_positions; _c < opponent_hit_positions_1.length; _c++) {
                                        pos = opponent_hit_positions_1[_c];
                                        (_h = $('battlefield_position_' + pos)) === null || _h === void 0 ? void 0 : _h.classList.add('opponent_highlight');
                                    }
                                }
                                if (!opponent_stance_good) {
                                    (_j = $('opponent_samurai')) === null || _j === void 0 ? void 0 : _j.classList.add('attack-stance-bad');
                                }
                            }
                            return [4, new Promise(function (res) { return setTimeout(res, 1000); })];
                        case 2:
                            _p.sent();
                            animateCard = function (card, special, prefix, positions, hit) {
                                if (card != 8) {
                                    if (positions.length == 1) {
                                        $(prefix + '-slash-effect_0').classList.add('slash-effect-anim-' + prefix + '-' + _this.card_names[card - 1]);
                                        _this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
                                    }
                                }
                                else if (special == 1) {
                                    if (positions.length >= 1) {
                                        $(prefix + '-slash-effect_0').classList.add('slash-effect-anim-' + prefix + '-kesa-0');
                                        _this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
                                    }
                                    if (positions.length >= 2) {
                                        $(prefix + '-slash-effect_1').classList.add('slash-effect-anim-' + prefix + '-kesa-1');
                                        _this.placeOnObject(prefix + '-slash-effect_1', 'battlefield_position_' + positions[1]);
                                    }
                                }
                                else if (special == 2) {
                                    if (positions.length >= 1) {
                                        $(prefix + '-slash-effect_0').classList.add('slash-effect-anim-' + prefix + '-zantetsu-0');
                                        _this.placeOnObject(prefix + '-slash-effect_0', 'battlefield_position_' + positions[0]);
                                    }
                                    if (positions.length >= 2) {
                                        $(prefix + '-slash-effect_1').classList.add('slash-effect-anim-' + prefix + '-zantetsu-1');
                                        _this.placeOnObject(prefix + '-slash-effect_1', 'battlefield_position_' + positions[1]);
                                    }
                                }
                                else if (special == 3) {
                                    $(prefix + '-slash-effect_0').classList.add('slash-effect-anim-' + prefix + '-counter');
                                    _this.placeOnObject(prefix + '-slash-effect_0', 'battlefield');
                                }
                                if (!hit) {
                                    $(prefix + '-slash-effect_0').classList.add('miss');
                                    $(prefix + '-slash-effect_1').classList.add('miss');
                                }
                            };
                            if (player_card_valid) {
                                animateCard(player_card, this.playerSpecialCard(), 'player', player_hit_positions, player_hit);
                            }
                            if (opponent_card_valid) {
                                animateCard(opponent_card, this.opponentSpecialCard(), 'opponent', opponent_hit_positions, opponent_hit);
                            }
                            return [4, new Promise(function (res) { return setTimeout(res, 1000); })];
                        case 3:
                            _p.sent();
                            for (_d = 0, player_hit_positions_2 = player_hit_positions; _d < player_hit_positions_2.length; _d++) {
                                pos = player_hit_positions_2[_d];
                                (_k = $('battlefield_position_' + pos)) === null || _k === void 0 ? void 0 : _k.classList.remove('player_highlight');
                            }
                            for (_e = 0, opponent_hit_positions_2 = opponent_hit_positions; _e < opponent_hit_positions_2.length; _e++) {
                                pos = opponent_hit_positions_2[_e];
                                (_l = $('battlefield_position_' + pos)) === null || _l === void 0 ? void 0 : _l.classList.remove('opponent_highlight');
                            }
                            $('player-slash-effect_0').className = source_player_0_className;
                            $('player-slash-effect_1').className = source_player_1_className;
                            $('opponent-slash-effect_0').className = source_opponent_0_className;
                            $('opponent-slash-effect_1').className = source_opponent_1_className;
                            (_m = $('player_samurai')) === null || _m === void 0 ? void 0 : _m.classList.remove('attack-stance-bad');
                            (_o = $('opponent_samurai')) === null || _o === void 0 ? void 0 : _o.classList.remove('attack-stance-bad');
                            player_card_div.classList.remove('evaluating');
                            opponent_card_div.classList.remove('evaluating');
                            return [2];
                    }
                });
            });
        };
        return KiriaiTheDuel;
    }(TitleLockingMixin(CommonMixin(Gamegui))));
    dojo.setObject("bgagame.kiriaitheduel", KiriaiTheDuel);
    ((_a = window.bgagame) !== null && _a !== void 0 ? _a : (window.bgagame = {})).kiriaitheduel = KiriaiTheDuel;
    window.addEventListener('scroll', function () {
        $('background-area').style.top = -(window.scrollY * 0.35) + 'px';
    });
});
define("cookbook/common", ["require", "exports", "dojo"], function (require, exports, dojo) {
    "use strict";
    var CommonMixin = function (Base) { return (function (_super) {
        __extends(Common, _super);
        function Common() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
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
            mobile.offsetTop;
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
            mobile.offsetTop;
            return box;
        };
        Common.prototype.ajaxAction = function (action, args, callback, ajax_method) {
            if (!this.checkAction(action))
                return false;
            if (!args)
                args = {};
            if (!args.lock)
                args.lock = true;
            this.ajaxcall("/".concat(this.game_name, "/").concat(this.game_name, "/").concat(action, ".html"), args, this, function () { }, callback, ajax_method);
            return true;
        };
        Common.prototype.subscribeNotif = function (event, callback) {
            return dojo.subscribe(event, this, callback);
        };
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
        Common.prototype.isReadOnly = function () {
            return this.isSpectator || typeof g_replayFrom !== 'undefined' || g_archive_mode;
        };
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
        Common.prototype.divYou = function () {
            return this.divColoredPlayer(this.player_id, __("lang_mainsite", "You"));
        };
        Common.prototype.divColoredPlayer = function (player_id, text) {
            var player = this.gamedatas.players[player_id];
            if (player === undefined)
                return "--unknown player--";
            return "<span style=\"color:".concat(player.color, ";background-color:#").concat(player.color_back, ";\">").concat(text !== null && text !== void 0 ? text : player.name, "</span>");
        };
        Common.prototype.setMainTitle = function (html) {
            $('pagemaintitletext').innerHTML = html;
        };
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
        Common.prototype.addPreferenceListener = function (callback) {
            var _this = this;
            dojo.query('.preference_control').on('change', function (e) {
                var _a;
                var target = e.target;
                if (!(target instanceof HTMLSelectElement)) {
                    console.error("Preference control class is not a valid element to be listening to events from. The target of the event does not have an id.", e.target);
                    return;
                }
                var match = (_a = target.id.match(/^preference_[cf]ontrol_(\d+)$/)) === null || _a === void 0 ? void 0 : _a[1];
                if (!match)
                    return;
                var matchId = parseInt(match);
                if (isNaN(matchId)) {
                    console.error("Preference control id was not a valid number.", match);
                    return;
                }
                var pref = _this.prefs[matchId];
                if (!pref) {
                    console.warn("Preference was changed but somehow the preference id was not found.", matchId, _this.prefs);
                    return;
                }
                var value = target.value;
                if (!pref.values[value]) {
                    console.warn("Preference value was changed but somehow the value is not a valid value.", value, pref.values);
                }
                pref.value = value;
                callback(matchId);
            });
        };
        Common.prototype.onScriptError = function (error, url, line) {
            if (this.page_is_unloading)
                return;
            console.error("Script error:", error);
            _super.prototype.onScriptError.call(this, error, url, line);
        };
        Common.prototype.showError = function (log, args) {
            if (args === void 0) { args = {}; }
            args['you'] = this.divYou();
            var message = this.format_string_recursive(log, args);
            this.showMessage(message, "error");
            console.error(message);
        };
        Common.prototype.getPlayerColor = function (player_id) {
            var _a, _b;
            return (_b = (_a = this.gamedatas.players[player_id]) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : null;
        };
        Common.prototype.getPlayerName = function (player_id) {
            var _a, _b;
            return (_b = (_a = this.gamedatas.players[player_id]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null;
        };
        Common.prototype.getPlayerFromColor = function (color) {
            for (var id in this.gamedatas.players) {
                var player = this.gamedatas.players[id];
                if ((player === null || player === void 0 ? void 0 : player.color) === color)
                    return player;
            }
            return null;
        };
        Common.prototype.getPlayerFromName = function (name) {
            for (var id in this.gamedatas.players) {
                var player = this.gamedatas.players[id];
                if ((player === null || player === void 0 ? void 0 : player.name) === name)
                    return player;
            }
            return null;
        };
        return Common;
    }(Base)); };
    return CommonMixin;
});
define("cookbook/nevinAF/playeractionqueue", ["require", "exports"], function (require, exports) {
    "use strict";
    var PlayerActionQueue = (function () {
        function PlayerActionQueue(game) {
            this.actionErrorCodes = {
                FILTERED_OUT: -512,
                TIMEOUT: -513,
                PLAYER_NOT_ACTIVE: -514,
                DEPENDENCY_FAILED: -515,
                ACTION_NOT_POSSIBLE: -516,
            };
            this.game = game;
        }
        PlayerActionQueue.prototype.enqueueAjaxAction = function (refItem, dependencies) {
            var _this = this;
            var _a, _b, _c;
            if (this.queue === undefined)
                this.queue = [];
            var item = refItem;
            item.dependencies = dependencies ?
                dependencies.flatMap(function (dep) { return (typeof dep === 'string') ?
                    _this.queue.filter(function (a) { return a.action === dep; }) : dep; }) :
                null;
            item.timestamp = Date.now();
            item.state = 'queued';
            this.queue.push(item);
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
            var _loop_5 = function (i) {
                var item = this_4.queue[i];
                if (!item) {
                    console.warn("Found a null item in the action queue. This should not happen and is likely an internal error.");
                    this_4.queue.splice(i, 1);
                    i--;
                    return out_i_1 = i, "continue";
                }
                if (item.state === 'inProgress') {
                }
                else if ((item.dependencies === null && i == 0) ||
                    ((_b = item.dependencies) === null || _b === void 0 ? void 0 : _b.every(function (dep) { return dep.state === 'complete'; }))) {
                    item.state = 'inProgress';
                    this_4.game.ajaxcall("/".concat(this_4.game.game_name, "/").concat(this_4.game.game_name, "/").concat(item.action, ".html"), item.args, this_4, function () { }, function (error, errorMessage, errorCode) {
                        var _a, _b;
                        item.state = error ? 'failed' : 'complete';
                        (_a = item.callback) === null || _a === void 0 ? void 0 : _a.call(item, error, errorMessage, errorCode);
                        _this.queue = (_b = _this.queue) === null || _b === void 0 ? void 0 : _b.filter(function (x) {
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
                    (_e = item.callback) === null || _e === void 0 ? void 0 : _e.call(item, true, 'Dependency failed', this_4.actionErrorCodes.DEPENDENCY_FAILED);
                    this_4.queue.splice(i, 1);
                    i = 0;
                }
                else if (item.timestamp + ((_f = this_4.actionPostTimeout) !== null && _f !== void 0 ? _f : 10000) < now) {
                    item.state = 'failed';
                    (_g = item.callback) === null || _g === void 0 ? void 0 : _g.call(item, true, 'Action took too long to post', this_4.actionErrorCodes.TIMEOUT);
                    this_4.queue.splice(i, 1);
                    i = 0;
                }
                out_i_1 = i;
            };
            var this_4 = this, out_i_1;
            for (var i = 0; i < this.queue.length; i++) {
                _loop_5(i);
                i = out_i_1;
            }
            if (this.queue.length === 0) {
                if (this.actionTitleLockingStrategy && this.actionTitleLockingStrategy !== 'none')
                    (_h = this.removeTitleLocks) === null || _h === void 0 ? void 0 : _h.call(this);
                return;
            }
            else if (this.queue.every(function (i) { return i.state != 'inProgress'; })) {
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
define("cookbook/nevinAF/titlelocking", ["require", "exports", "dojo"], function (require, exports, dojo) {
    "use strict";
    var TitleLockingMixin = function (Base) { return (function (_super) {
        __extends(TitleLocking, _super);
        function TitleLocking() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
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
                            el.style[property] = computedStyle.getPropertyValue(property);
                        }
                        var _loop_6 = function (event_1) {
                            el.addEventListener('click', function (e) {
                                var _a, _b;
                                (_b = (_a = $(id))[event_1]) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                            });
                        };
                        for (var _b = 0, maintainEvents_1 = maintainEvents; _b < maintainEvents_1.length; _b++) {
                            var event_1 = maintainEvents_1[_b];
                            _loop_6(event_1);
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
        TitleLocking.prototype.isTitleLocked = function () {
            return (this.titlelock_element != undefined) && this.titlelock_element.childElementCount > 0;
        };
        TitleLocking.prototype.lockTitle = function (target) {
            if (this.isTitleLocked())
                return;
            console.log('Locking title');
            this.pushTitleLock(target);
        };
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
        TitleLocking.prototype.pushTitleLock = function (target) {
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
        TitleLocking.prototype.pushTitleLockFromStatus = function (status) {
            var _a;
            (_a = this.titlelock_element) !== null && _a !== void 0 ? _a : (this.titlelock_element = this.createTitleLock());
            this.pushTitleLockFromHTML('<div><div style="display:inline-block; padding-left: 22px; position:relative;">\
				<img src="https://studio.boardgamearena.com:8084/data/themereleases/240320-1000/img/logo/waiting.gif" style="width:22px; height: 22px; position:absolute; left:-22px;" class="imgtext">\
				<span>' + status + '</span>\
			</div></div>');
        };
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
        TitleLocking.prototype.removeTitleLocks = function () {
            if (!this.titlelock_element)
                return;
            this.titlelock_element.innerHTML = '';
            $('pagemaintitle_wrap').classList.remove('display_none');
            $('gameaction_status_wrap').classList.remove('display_none');
            this.titlelock_element.style.display = 'none';
        };
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
define("cookbook/nevinAF/confirmationtimeout", ["require", "exports", "ebg/core/common"], function (require, exports) {
    "use strict";
    var ConfirmationTimeout = (function () {
        function ConfirmationTimeout(cancel_area, options) {
            if (options === void 0) { options = {}; }
            var _a, _b, _c;
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
        ConfirmationTimeout.prototype.off = function () {
            if (this._timeout == null)
                return;
            clearTimeout(this._timeout);
            this._timeout = null;
            this._cancelElement.style.display = 'none';
            if (this._animationElement)
                this._animationElement.style.display = 'none';
        };
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
        ConfirmationTimeout.prototype.promise = function (evt) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.set(evt, resolve);
            });
        };
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
        ConfirmationTimeout.prototype.mouseMoved = function (evt) {
            if (!this._followMouse && evt.target == this._cancelElement)
                return;
            if (this._animationElement) {
                var size = this._animationElement.getBoundingClientRect();
                this._animationElement.style.left = evt.clientX - size.width / 2 + 'px';
                this._animationElement.style.top = evt.clientY - size.height / 2 + 'px';
            }
        };
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
        ConfirmationTimeout.prototype.setDurationPreference = function (durationPref) {
            if (gameui === undefined) {
                console.error('Cannot use duration preferences before the games "setup" function!');
                this.setDuration(1000);
                return;
            }
            var pref = gameui.prefs[durationPref];
            if (pref === undefined) {
                console.error('Invalid duration preference id: ' + durationPref);
                durationPref = 4;
            }
            else
                durationPref = toint(pref.value);
            var duration = [0, 300, 600, 1000, 1500, 2000][durationPref - 1];
            if (duration === undefined || isNaN(duration)) {
                console.error('Invalid duration preference value: ' + durationPref);
                duration = 1000;
            }
            this.setDuration(duration);
        };
        ConfirmationTimeout.prototype.setFollowMouse = function (followMouse) {
            this._followMouse = followMouse;
        };
        ConfirmationTimeout.prototype.setCancelAreaClasses = function (classes) {
            this._cancelElement.className = classes;
        };
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
    return ConfirmationTimeout;
});
