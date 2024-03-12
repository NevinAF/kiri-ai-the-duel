{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- KiriaiTheDuel implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    kiriaitheduel_kiriaitheduel.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->


This is your game interface. You can edit this HTML in your ".tpl" file.

<div id="redHandArea">
    <h3>Red Hand</h3>
    <div class="cardrow" id="redHand">
		<div class="cardslot movable" id="redHand_0"></div>
		<div class="cardslot movable" id="redHand_1"></div>
		<div class="cardslot movable" id="redHand_2"></div>
		<div class="cardslot movable" id="redHand_3"></div>
		<div class="cardslot movable" id="redHand_4"></div>
		<div class="cardslot movable" id="redHand_5"></div>
    </div>
</div>

<div id="playArea">
    <h3>PlayArea</h3>

	<div id="redDamageContainer">
		<h3>Red Damage</h3>
		<div id="red_samurai_damage"></div>
	</div>

	<div id="blueDamageContainer">
		<h3>Blue Damage</h3>
		<div id="blue_samurai_damage"></div>
	</div>

	<div id="standard_battlefield">
		<div class="field_position">
			<div  id="red_samurai_field_position_5" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_5" class="blue_field_position"> </div>
		</div>
		<div class="field_position">
			<div  id="red_samurai_field_position_4" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_4" class="blue_field_position"> </div>
		</div>
		<div class="field_position">
			<div  id="red_samurai_field_position_3" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_3" class="blue_field_position"> </div>
		</div>
		<div class="field_position">
			<div  id="red_samurai_field_position_2" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_2" class="blue_field_position"> </div>
		</div>
		<div class="field_position">
			<div  id="red_samurai_field_position_1" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_1" class="blue_field_position"> </div>
		</div>
		<div class="field_position">
			<div  id="red_samurai_field_position_0" class="red_field_position"> </div>
			<div id="blue_samurai_field_position_0" class="blue_field_position"> </div>
		</div>

		<div id="red_samurai"  class="samurai_card"></div>
		<div id="blue_samurai" class="samurai_card"></div>
	</div>
		

	<div id="misc" class="cardrow">
		<div id="deck" class="cardslot">
			<div class="cardontable" id="cardontable_1" ></div>
			<div class="cardontable" id="cardontable_2" ></div>
			<div class="cardontable" id="cardontable_3" ></div>
			<div class="cardontable" id="cardontable_4" ></div>
			<div class="cardontable" id="cardontable_5" ></div>
			<div class="cardontable" id="cardontable_6" ></div>
			<div class="cardontable" id="cardontable_7" ></div>
			<div class="cardontable" id="cardontable_8" ></div>
			<div class="cardontable" id="cardontable_9" ></div>
			<div class="cardontable" id="cardontable_10"></div>
			<div class="cardontable" id="cardontable_11"></div>
			<div class="cardontable" id="cardontable_12"></div>
			<div class="cardontable" id="cardontable_13"></div>

			<div class="cardontable" id="cardontable_97"></div>
			<div class="cardontable" id="cardontable_98"></div>
			<div class="cardontable" id="cardontable_99"></div>
		</div>

		<div class="cardslot" id="redPlayed_0"></div>
		<div class="cardslot" id="redPlayed_1"></div>
		<div class="cardslot" id="bluePlayed_0"></div>
		<div class="cardslot" id="bluePlayed_1"></div>
		<div class="cardslot" id="redDiscard_0"></div>
		<div class="cardslot" id="redDiscard_1"></div>
		<div class="cardslot" id="blueDiscard_0"></div>
		<div class="cardslot" id="blueDiscard_1"></div>
	</div>
</div>

<div id="blueHandArea">
    <h3>Blue Hand</h3>
    <div id="blueHand" class="cardrow">
		<div class="cardslot" id="blueHand_0"></div>
		<div class="cardslot" id="blueHand_1"></div>
		<div class="cardslot" id="blueHand_2"></div>
		<div class="cardslot" id="blueHand_3"></div>
		<div class="cardslot" id="blueHand_4"></div>
		<div class="cardslot" id="blueHand_5"></div>
    </div>
</div>

<button id='confirmSelectionButton'>Confirm Selection</button>



<script type="text/javascript">

// Javascript HTML templates

var jstpl_playedCard = '<div class="cardontable" id="cardontable_${card_id}" style="background-position:-${x}px 0px">\
                        </div>';

</script>  

{OVERALL_GAME_FOOTER}
