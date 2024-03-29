{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
-------
-->

<div id="game-area">
	<div id="my-hand-area">
		<div class="cardslot" id="myHand_0"></div>
		<div class="cardslot" id="myHand_1"></div>
		<div class="cardslot" id="myHand_2"></div>
		<div class="cardslot" id="myHand_3"></div>
		<div class="cardslot" id="myHand_4"></div>
		<div class="cardslot" id="myHand_5"></div>
	</div>

	<div id="battlefield">
		<div id="red_samurai_offset" class="samurai_offset">
			<div id="red_samurai"  class="cardslot"></div>
		</div>
		<div id="blue_samurai_offset" class="samurai_offset">
			<div id="blue_samurai" class="cardslot"></div>
		</div>
	</div>

	<div id="play-area">
		<div class="cardslot" id="myPlayed_0"></div>
		<div class="cardslot" id="myPlayed_1"></div>
		<div class="cardslot" id="opponentPlayed_0"></div>
		<div class="cardslot" id="opponentPlayed_1"></div>
	</div>
</div>

<div id="opponent-hand-area">
	<div class="cardslot" id="opponentHand_0"></div>
	<div class="cardslot" id="opponentHand_1"></div>
	<div class="cardslot" id="opponentHand_2"></div>
	<div class="cardslot" id="opponentHand_3"></div>
	<div class="cardslot" id="opponentHand_4"></div>
	<div class="cardslot" id="opponentHand_5"></div>
</div>

<script type="text/javascript">

var jstpl_card =
'<img class="cardImg" src="${src}" id="${id}" style="object-position: ${x}% 0px;" draggable="false" />';

var jstpl_field_position =
'<div class="field_position" id="samurai_field_position_${id}"></div>';

</script>  

{OVERALL_GAME_FOOTER}
