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
        _this.getCardUniqueId = function (isRed, card_type) {
            if (card_type == -1)
                return 12;
            else if (isRed)
                return (card_type < 5) ? card_type : card_type + 5;
            else
                return card_type + 5;
        };
        _this.revealCard = function (back_card_id, new_card_id) {
            _this.placeOnObject('cardontable_' + new_card_id, 'cardontable_' + back_card_id);
            dojo.destroy('cardontable_' + back_card_id);
        };
        _this.moveCard = function (card_id, to) {
            console.log('Moving card ' + card_id + ' to ' + to + '.');
            if (card_id == -1)
                return;
            var target = $('cardontable_' + card_id);
            var divTo = $(to);
            if (target == null) {
                console.log('Div "' + 'cardontable_' + card_id + '" does not exist.');
                return;
            }
            if (divTo == null) {
                console.log('Div "' + to + '" does not exist.');
                return;
            }
            var targetPosition = target.getBoundingClientRect();
            var divToPosition = divTo.getBoundingClientRect();
            var relativePosition = {
                top: targetPosition.top - divToPosition.top,
                left: targetPosition.left - divToPosition.left
            };
            dojo.place(target, divTo);
            dojo.style(target, 'top', relativePosition.top + 'px');
            dojo.style(target, 'left', relativePosition.left + 'px');
            _this.slideToObject('cardontable_' + card_id, to).play();
        };
        _this.updateAll = function () {
            _this.placeAllCards();
            _this.updateFlippedStatus();
            _this.updateStance();
            _this.updatePosition();
            for (var id in _this.gamedatas.state.damage) {
                $(id + "_damage").innerHTML = _this.gamedatas.state.damage[id];
            }
        };
        _this.placeAllCards = function () {
            var cards = this.gamedatas.state.cards;
            for (var i in cards)
                for (var j in cards[i])
                    this.moveCard(cards[i][j], i + "_" + j);
        };
        _this.updateFlippedStatus = function () {
            var flippedState = _this.gamedatas.state.flippedState;
            var cardIds = [1, 2, 6, 7];
            for (var i in cardIds) {
                var cardId = cardIds[i];
                var cardDiv = $('cardontable_' + cardId);
                var state = flippedState[cardDiv.parentNode.id + '_Flipped'];
                if (state == undefined || (state != 0 && state != 1)) {
                    dojo.removeClass(cardDiv, 'topPicked');
                    dojo.removeClass(cardDiv, 'bottomPicked');
                }
                else if (state == 0) {
                    dojo.addClass(cardDiv, 'topPicked');
                    dojo.removeClass(cardDiv, 'bottomPicked');
                }
                else {
                    dojo.addClass(cardDiv, 'bottomPicked');
                    dojo.removeClass(cardDiv, 'topPicked');
                }
            }
        };
        _this.updateStance = function () {
            var stances = _this.gamedatas.state.stances;
            for (var id in stances) {
                var div = $(id);
                if (div == null) {
                    console.log('Div "' + id + '" does not exist.');
                    continue;
                }
                if (stances[id] == 0) {
                    dojo.addClass(div, 'heaven_stance');
                    dojo.removeClass(div, 'earth_stance');
                }
                else {
                    dojo.addClass(div, 'earth_stance');
                    dojo.removeClass(div, 'heaven_stance');
                }
            }
        };
        _this.updatePosition = function () {
            var positions = _this.gamedatas.state.positions;
            for (var id in positions) {
                var div = $(id);
                var divFrom = div.parentNode;
                var divTo = $(id + "_field_position_" + positions[id]);
                dojo.place(div, divTo);
                _this.placeOnObject(div, divFrom);
                _this.slideToObject(div, divTo).play();
            }
        };
        _this.onCardClick = function (evt) {
            var target = evt.target;
            var parent = target.parentNode;
            var card_id = +target.id.split('_')[1];
            if (parent.id.includes('Hand')) {
                var rect = target.getBoundingClientRect();
                var y = evt.clientY - rect.top;
                var clickedTopHalf = y < rect.height / 2;
                _this.playCardFromHand(card_id, clickedTopHalf);
            }
            else if (parent.id.includes('Played')) {
                _this.returnCardToHand(card_id);
            }
            else {
                console.log('Card is not in the hand or played cards.', evt);
            }
        };
        _this.playCardFromHand = function (card_id, clickedTopHalf) {
            if (!_this.checkAction('pickedCards')) {
                console.log('It is not time to play cards.');
                return;
            }
            var playerType = _this.player_id == _this.gamedatas.redPlayer ? 'red' : 'blue';
            var card_div = $('cardontable_' + card_id);
            if (!card_div.parentNode.id.startsWith(playerType + "Hand")) {
                console.log('Card is not in the hand.');
                return;
            }
            var isFirstOpen = $(playerType + 'Played_0').childNodes.length == 0;
            var isSecondOpen = $(playerType + 'Played_1').childNodes.length == 0;
            if (!isFirstOpen && !isSecondOpen) {
                console.log('Both cards are already played! Must choose one to return before playing another.');
                return;
            }
            var flippableCards = [1, 2, 6, 7];
            if (flippableCards.includes(card_id)) {
                if (clickedTopHalf) {
                    dojo.addClass(card_div, 'topPicked');
                    dojo.removeClass(card_div, 'bottomPicked');
                }
                else {
                    dojo.addClass(card_div, 'bottomPicked');
                    dojo.removeClass(card_div, 'topPicked');
                }
            }
            if (isFirstOpen) {
                _this.moveCard(card_id, playerType + 'Played_0');
                return;
            }
            if (isSecondOpen) {
                _this.moveCard(card_id, playerType + 'Played_1');
                return;
            }
        };
        _this.returnCardToHand = function (card_id) {
            if (!_this.checkAction('pickedCards')) {
                console.log('It is not time to return cards.');
                return;
            }
            var playerType = _this.player_id == _this.gamedatas.redPlayer ? 'red' : 'blue';
            var card_div = $('cardontable_' + card_id);
            if (!card_div.parentNode.id.startsWith(playerType + "Played_")) {
                console.log('Card is not in the played cards.');
                return;
            }
            dojo.removeClass(card_div, 'topPicked');
            dojo.removeClass(card_div, 'bottomPicked');
            var handSlotId = playerType + 'Hand_';
            for (var i = 0; i < 6; i++) {
                if ($(handSlotId + i).childNodes.length == 0) {
                    _this.moveCard(card_id, handSlotId + i);
                    return;
                }
            }
            console.log('No empty hand slots!');
        };
        _this.confirmPlayedCards = function () {
            if (!_this.checkAction('pickedCards')) {
                console.log('It is not time to confirm cards.');
                return;
            }
            var playerType = _this.player_id == _this.gamedatas.redPlayer ? 'red' : 'blue';
            var firstCard = $(playerType + 'Played_0').children[0];
            var secondCard = $(playerType + 'Played_1').children[0];
            if (firstCard == null || secondCard == null) {
                console.log('Both cards must be played before confirming.');
                return;
            }
            var firstCardId = +firstCard.id.split('_')[1];
            var secondCardId = +secondCard.id.split('_')[1];
            if (dojo.hasClass(firstCard, 'bottomPicked'))
                firstCardId = -firstCardId;
            if (dojo.hasClass(secondCard, 'bottomPicked'))
                secondCardId = -secondCardId;
            _this.ajaxcall('/kiriaitheduel/kiriaitheduel/pickedCards.html', {
                lock: true,
                firstCard: firstCardId,
                secondCard: secondCardId,
            }, _this, function (result) { }, function (is_error) { });
        };
        _this.setupNotifications = function () {
            console.log('notifications subscriptions setup');
            dojo.subscribe('playCards', _this, "notif_placeAllCards");
            dojo.subscribe('cardsResolved', _this, "notif_placeAllCards");
            dojo.subscribe('drawSpecialCard', _this, "notif_placeAllCards");
            _this.notifqueue.setSynchronous('playCards', 3000);
            _this.notifqueue.setSynchronous('cardsResolved', 3000);
            _this.notifqueue.setSynchronous('drawSpecialCard', 3000);
            dojo.subscribe('cardsPlayed', _this, "notif_cardsPlayed");
            dojo.subscribe('cardFlipped', _this, "notif_cardFlipped");
            _this.notifqueue.setSynchronous('cardFlipped', 1000);
        };
        _this.notif_placeAllCards = function (notif) {
            console.log('notif_placeAllCards', notif);
            _this.gamedatas.state = notif.args.state;
            _this.updateAll();
        };
        _this.notif_cardsPlayed = function (notif) {
        };
        _this.notif_cardFlipped = function (notif) {
            _this.revealCard(notif.args.back_card_id, notif.args.card_id);
        };
        console.log('kiriaitheduel:', _this);
        return _this;
    }
    KiriaiTheDuel.prototype.setup = function (gamedatas) {
        console.log("Starting game setup");
        this.setupNotifications();
        for (var i = 1; i < 14; i++) {
            dojo.connect($('cardontable_' + i), 'onclick', this, 'onCardClick');
        }
        dojo.connect($('confirmSelectionButton'), 'onclick', this, 'confirmPlayedCards');
        this.updateAll();
        console.log("Ending game setup");
    };
    KiriaiTheDuel.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName);
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
        console.log('onUpdateActionButtons: ' + stateName);
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'pickCards':
                    var pickCardsArgs = args;
                    break;
            }
        }
    };
    return KiriaiTheDuel;
}(Game));
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
], function (dojo, declare) {
    return declare("bgagame.kiriaitheduel", ebg.core.gamegui, new KiriaiTheDuel());
});
