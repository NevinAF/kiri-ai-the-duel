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

<div style="display: flex; align-items: center; width: calc(100% - 10px); justify-content: center; padding: 5px; user-select: none;">
	<div id="myHandArea" style="flex-grow: 3; max-width: 310px; display: grid; grid-template-columns: 185fr 185fr; grid-template-rows: 270fr 270fr 270fr; gap: 0.5em; margin-bottom: 10px;">
		<div class="cardslot" id="myHand_0"></div>
		<div class="cardslot" id="myHand_1"></div>
		<div class="cardslot" id="myHand_2"></div>
		<div class="cardslot" id="myHand_3"></div>
		<div class="cardslot" id="myHand_4"></div>
		<div class="cardslot" id="myHand_5"></div>
	</div>

	<div id="battlefield" style="flex-grow: 6; max-width: 500px;  display: flex; flex-direction: column; justify-content: space-evenly; aspect-ratio: 1/1">
	</div>

	<div id="playArea" style="flex-grow: 3; max-width: 310px; display: grid; grid-template-columns: 185fr 185fr; grid-template-rows: 270fr 270fr; gap: 0.5em;">
		<div class="cardslot" id="myPlayed_0"></div>
		<div class="cardslot" id="myPlayed_1"></div>
		<div class="cardslot" id="opponentPlayed_0"></div>
		<div class="cardslot" id="opponentPlayed_1"></div>
	</div>
</div>

<div id="opponentHandArea" style="display: flex; align-content: stretch; justify-content: center;">
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_0"></div>
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_1"></div>
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_2"></div>
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_3"></div>
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_4"></div>
	<div class="cardslot" style="max-width:120px flex: 1; flex-basis:120px" id="opponentHand_5"></div>
</div>

<div id="red_samurai_offset" style="position: absolute; user-select: none; pointer-events: none;">
	<div id="red_samurai"  class="cardslot" style="pointer-events: all;"></div>
</div>
<div id="blue_samurai_offset" style="position: absolute; user-select: none; pointer-events: none;">
	<div id="blue_samurai" class="cardslot" style="pointer-events: all;"></div>
</div>

<script type="text/javascript">

// Javascript HTML templates

var jstpl_card =
'<div class="cardontable" style="width: 100%; height:100%;">\
	<img src="${src}" id="${id}" style="object-position: ${x}% 0px; width: 100%; height:100%;" draggable="false" />\
</div>';

var jstpl_field_position =
'<div class="field_position" id="samurai_field_position_${id}">\
	<div  id="red_samurai_field_position_${id}" class="red_field_position"> </div>\
	<div id="blue_samurai_field_position_${id}" class="blue_field_position"> </div>\
</div>';

</script>  

{OVERALL_GAME_FOOTER}
