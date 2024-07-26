{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
-------
-->
<div id="background-area">
	<img src="{GAMETHEMEURL}{PLAYER_IMAGES}../background-bottom-right.svg" class="background-bottom-right" />
	<img src="{GAMETHEMEURL}{PLAYER_IMAGES}../background-top-left.svg" class="background-top-left" />
	<img src="{GAMETHEMEURL}{PLAYER_IMAGES}../background-top-right.svg" class="background-top-right" />
</div>

<div id="game-area-margin">

<div id="game-area" style="
	--player-color: #{PLAYER_COLOR};
	--opponent-color: #{OPPONENT_COLOR};
">

	<div id="play-area">

		<div class="cardslot" id="player_played_0">
			<p>1st</p>
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
			<div class="selection-border"></div>
		</div>
		<div class="cardslot" id="player_played_1">
			<p>2nd</p>
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
			<div class="selection-border"></div>
		</div>
		<div class="cardslot" id="opponent_played_0">
			<p>1st</p>
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
			<div class="selection-border"></div>
		</div>
		<div class="cardslot" id="opponent_played_1">
			<p>2nd</p>
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
			<div class="selection-border"></div>
		</div>

		<div id="battlefield" class="{BATTLEFIELD_TYPE} cardslot" class="cardslot">
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}{BATTLEFIELD_TYPE}.svg" draggable="false"/>
			<div class="battlefield_position" id="battlefield_position_1"></div>
			<div class="battlefield_position" id="battlefield_position_2"></div>
			<div class="battlefield_position" id="battlefield_position_3"></div>
			<div class="battlefield_position" id="battlefield_position_4"></div>
			<div class="battlefield_position" id="battlefield_position_5"></div>
			<div class="battlefield_position" id="battlefield_position_6"></div>
			<div class="battlefield_position" id="battlefield_position_7"></div>
			<div class="battlefield_position" id="battlefield_position_0"></div>
			<div class="battlefield_position" id="battlefield_position_8"></div>
		</div>

		<div id="player_samurai"  class="cardslot">
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-stance-healthy.svg" draggable="false"/>
		</div>

		<div id="opponent_samurai"  class="cardslot">
			<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-stance-healthy.svg" draggable="false"/>
		</div>

		<div class='slash-effect' id='player-slash-effect_0'></div>
		<div class='slash-effect' id='player-slash-effect_1'></div>
		<div class='slash-effect' id='opponent-slash-effect_0'></div>
		<div class='slash-effect' id='opponent-slash-effect_1'></div>

	</div>

	<div id="hands">

		<div id="hand-icons">
			<img id="discard_icon" src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-icon-discard.svg" draggable="false"/>
			<img id="special_icon" src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-icon-hand.svg" draggable="false"/>
		</div>

		<div id="player-area" class="hand-area">
			<div class="opponent_hand_icon">
				<img id="opponent_hand_icon" src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-icon-hand.svg" draggable="false"/>
				<p>Show Opponent's Hand</p>
			</div>
			<div class="cardslot" id="player-hand_0">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-card-approach.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_1">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-card-charge.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_2">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-card-high-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_3">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-card-low-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_4">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}player-card-balance-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_5">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
		</div>

		<div id="opponent-area" class="hand-area">
			<div class="cardslot" id="opponent-hand_0">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-card-approach.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_1">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-card-charge.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_2">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-card-high-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_3">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-card-low-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_4">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}opponent-card-balance-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_5">
				<img src="{GAMETHEMEURL}{PLAYER_IMAGES}card-back.svg" draggable="false"/>
			</div>
		</div>

	</div>

</div>
</div>


<script type="text/javascript">

const PLAYER_IMAGES = "{PLAYER_IMAGES}";
const PLAYER_COLOR = "{PLAYER_COLOR}";
const OPPONENT_COLOR = "{OPPONENT_COLOR}";

</script>

{OVERALL_GAME_FOOTER}
