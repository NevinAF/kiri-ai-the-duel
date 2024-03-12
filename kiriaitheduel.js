/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * KiriaiTheDuel implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * kiriaitheduel.js
 *
 * KiriaiTheDuel user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
],
function (dojo, declare) {
    return declare("bgagame.kiriaitheduel", ebg.core.gamegui, {
        constructor: function(){
            console.log('kiriaitheduel constructor');

			// this.cardwidth = 135;
            // this.cardheight = 170;
        },

        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
            }

			this.redPlayer = gamedatas.redPlayer;
			this.bluePlayer = gamedatas.bluePlayer;

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

			let playerType = this.player_id == this.redPlayer ? 'red' : 'blue';

			for (let i = 1; i < 14; i++) {
				dojo.connect($('cardontable_' + i), 'onclick', this, 'onCardClick');
			}

			dojo.connect($('confirmSelectionButton'), 'onclick', this, 'confirmPlayedCards');

			this.updateAll(gamedatas.state);

            console.log( "Ending game setup" );
        },

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

		getCardUniqueId : function(isRed, card_type)
		{
			if (card_type == -1) return 12;
            else if (isRed) return (card_type < 5) ? card_type : card_type + 5
			else return card_type + 5;
        },

		revealCard : function(back_card_id, new_card_id) {

			this.placeOnObject('cardontable_' + new_card_id, 'cardontable_' + back_card_id);

			dojo.destroy('cardontable_' + back_card_id);
				// Maybe return this to a hidden area?
		},

        moveCard : function(card_id, to)
		{
			console.log('Moving card ' + card_id + ' to ' + to + '.');

			if (card_id == -1) return;

			let target = $('cardontable_' + card_id);
			let divTo = $(to);

			if (target == null)
			{
				console.log('Div "' + 'cardontable_' + card_id + '" does not exist.');
				return;
			}

			if (divTo == null)
			{
				console.log('Div "' + to + '" does not exist.');
				return;
			}

			let divFrom = target.parentNode;

			dojo.place(target, divTo);

			this.placeOnObject('cardontable_' + card_id, divFrom);
            this.slideToObject('cardontable_' + card_id, to).play();
        },

		updateAll : function(state)
		{
			this.placeAllCards(state.cards);
			this.updateFlippedStatus(state.flippedState);
			this.updateStance(state.stances);
			this.updatePosition(state.positions);

			for (let id in state.damage)
			{
				$(id + "_damage").innerHTML = state.damage[id];
			}
		},

		placeAllCards : function(cards)
		{
			for (let i in cards) // i = 'redHand', 'blueHand', 'redPlayed'...
				for (let j in cards[i]) // j = 0, 1 [, 2, 3, 4, 5]
					this.moveCard(cards[i][j], i + "_" + j);
		},

		updateFlippedStatus: function(flippedState)
		{
			// There are only 4 cards that have a flipped state, so we can manually check the specific cards rather than the played cards. The prevents having to
			let cardIds = [1, 2, 6, 7];
			for (let i in cardIds)
			{
				let cardId = cardIds[i];
				let cardDiv = $('cardontable_' + cardId);
				let state = flippedState[cardDiv.parentNode.id + '_Flipped'];

				// If undefined or not 0/1, remove the topPicked/bottomPicked class. If 0, add topPicked. If 1, add bottomPicked.

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
		},

		updateStance: function(stances)
		{
			for (let id in stances)
			{
				let div = $(id);
				if (div == null)
				{
					console.log('Div "' + id + '" does not exist.');
					continue;
				}

				if (stances[id] == 0)
				{
					dojo.addClass(div, 'heaven_stance');
					dojo.removeClass(div, 'earth_stance');
				}
				else
				{
					dojo.addClass(div, 'earth_stance');
					dojo.removeClass(div, 'heaven_stance');
				}
			}
		},

		updatePosition: function(positions)
		{
			for (let id in positions)
			{
				let div = $(id);
				let divFrom = div.parentNode;
				let divTo = $(id + "_field_position_" + positions[id]);

				dojo.place(div, divTo);

				this.placeOnObject(div, divFrom);
				this.slideToObject(div, divTo).play();
			}
		},

        ///////////////////////////////////////////////////
        //// Player's action

		onCardClick: function( evt )
		{
			let card_id = evt.target.id.split('_')[1];

			// If parent contains 'hand' text, then playCardFromHand
			if (evt.target.parentNode.id.includes('Hand')) {
				// we need to know if the top half or bottom half was clicked
				let rect = evt.target.getBoundingClientRect();
				let y = evt.clientY - rect.top;
				let clickedTopHalf = y < rect.height / 2;
				this.playCardFromHand(card_id, clickedTopHalf);
			}
			else if (evt.target.parentNode.id.includes('Played')) {
				this.returnCardToHand(card_id);
			}
			else {
				console.log('Card is not in the hand or played cards.', evt);
			}
		},

        playCardFromHand: function( card_id, clickedTopHalf )
		{
			if (!this.checkAction('pickedCards')) {
				console.log('It is not time to play cards.');
				return;
			}

			let playerType = this.player_id == this.redPlayer ? 'red' : 'blue';
			let card_div = $('cardontable_' + card_id);

			// Make sure the parent is one of the hand slots
			if (!card_div.parentNode.id.startsWith(playerType + "Hand"))
			{
				console.log('Card is not in the hand.');
				return;
			}

			// Check if the <playerType>FirstCard div is empty
			let isFirstOpen = $(playerType + 'Played_0').childNodes.length == 0;
			let isSecondOpen = $(playerType + 'Played_1').childNodes.length == 0;

			if (!isFirstOpen && !isSecondOpen) {
				console.log('Both cards are already played! Must choose one to return before playing another.');
				return;
			}

			let flippableCards = [1, 2, 6, 7];
			if (flippableCards.includes(parseInt(card_id))) {
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
				this.moveCard(card_id, playerType + 'Played_0');
				return;
			}

			if (isSecondOpen) {
				this.moveCard(card_id, playerType + 'Played_1');
				return;
			}
		},

		returnCardToHand: function( card_id )
		{
			if (!this.checkAction('pickedCards')) {
				console.log('It is not time to return cards.');
				return;
			}

			let playerType = this.player_id == this.redPlayer ? 'red' : 'blue';
			let card_div = $('cardontable_' + card_id);

			// Make sure the parent is one of the hand slots
			if (!card_div.parentNode.id.startsWith(playerType + "Played_"))
			{
				console.log('Card is not in the played cards.');
				return;
			}

			// Remove the topPicked/bottomPicked classes
			dojo.removeClass(card_div, 'topPicked');
			dojo.removeClass(card_div, 'bottomPicked');

			// Now, find the first empty hand slot and move the card there (_0, _1, _2, _3)

			let handSlotId = playerType + 'Hand_';
			for (let i = 0; i < 6; i++) {
				if ($(handSlotId + i).childNodes.length == 0) {
					this.moveCard(card_id, handSlotId + i);
					return;
				}
			}

			console.log('No empty hand slots!');
		},

		confirmPlayedCards: function()
		{
			if (!this.checkAction('pickedCards')) {
				console.log('It is not time to confirm cards.');
				return;
			}

			let playerType = this.player_id == this.redPlayer ? 'red' : 'blue';
			let firstCard = $(playerType + 'Played_0').childNodes[0];
			let secondCard = $(playerType + 'Played_1').childNodes[0];

			if (firstCard == null || secondCard == null) {
				console.log('Both cards must be played before confirming.');
				return;
			}

			let firstCardId = firstCard.id.split('_')[1];
			let secondCardId = secondCard.id.split('_')[1];

			// If the first card or second card has the bottomPicked class, negate the card id
			if (dojo.hasClass(firstCard, 'bottomPicked'))
				firstCardId = -firstCardId;
			if (dojo.hasClass(secondCard, 'bottomPicked'))
				secondCardId = -secondCardId;

			this.ajaxcall('/kiriaitheduel/kiriaitheduel/pickedCards.html', {
				lock : true,
				firstCard : firstCardId,
				secondCard : secondCardId
			}, this, function(result) {}, function(is_error) {});
		},

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your kiriaitheduel.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );

			dojo.subscribe('playCards', this, "notif_placeAllCards");
			dojo.subscribe('cardsResolved', this, "notif_placeAllCards");
			dojo.subscribe('drawSpecialCard', this, "notif_placeAllCards");
			this.notifqueue.setSynchronous( 'playCards', 3000 );
			this.notifqueue.setSynchronous( 'cardsResolved', 3000 );
			this.notifqueue.setSynchronous( 'drawSpecialCard', 3000 );
			dojo.subscribe('cardsPlayed', this, "notif_cardsPlayed");
			dojo.subscribe('cardFlipped', this, "notif_cardFlipped");
			this.notifqueue.setSynchronous( 'cardFlipped', 1000 );

            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods

		notif_placeAllCards: function(notif) {
			console.log('notif_placeAllCards', notif);
			this.updateAll(notif.args.state);
		},
        
        notif_cardsPlayed: function(notif) {
			// Show placeholder for the played cards?
		},

		notif_cardFlipped: function(notif) {
			this.revealCard(notif.args.back_card_id, notif.args.card_id);
		}
   });
});
