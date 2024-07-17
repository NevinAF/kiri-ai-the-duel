{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- KiriaiTheDuel implementation : © Nevin Foster nevin.foster2@gamil.com
-------
-->



<div id="game-area" style="
">

	<div id="play-area">

		<div id="battlefield" class="{BATTLEFIELD_TYPE} cardslot" class="cardslot">
			<img src="{GAME_THEME_URL}{BATTLEFIELD_TYPE}.svg" draggable="false"/>
			<div class="battlefield_position" id="battlefield_position_1"></div>
			<div class="battlefield_position" id="battlefield_position_2"></div>
			<div class="battlefield_position" id="battlefield_position_3"></div>
			<div class="battlefield_position" id="battlefield_position_4"></div>
			<div class="battlefield_position" id="battlefield_position_5"></div>
			<div class="battlefield_position" id="battlefield_position_6"></div>
			<div class="battlefield_position" id="battlefield_position_7"></div>
		</div>

		<div id="player_samurai"  class="cardslot">
			<img src="{GAME_THEME_URL}player-stance-healthy.svg" draggable="false"/>
		</div>

		<div id="opponent_samurai"  class="cardslot">
			<img src="{GAME_THEME_URL}opponent-stance-healthy.svg" draggable="false"/>
		</div>

		<div class="cardslot" id="player_played_0">
			<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
		</div>
		<div class="cardslot" id="player_played_1">
			<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
		</div>
		<div class="cardslot" id="opponent_played_0">
			<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
		</div>
		<div class="cardslot" id="opponent_played_1">
			<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
		</div>
	</div>

	<div id="hands">

		<div id="hand-icons">
			<img id="discard_icon" src="{GAME_THEME_URL}opponent-icon-damaged-heaven.svg" draggable="false"/>
			<img id="special_icon" src="{GAME_THEME_URL}opponent-icon-heaven.svg" draggable="false"/>
		</div>

		<div id="player-area" class="hand-area">
			<div class="cardslot" id="player-hand_0">
				<img src="{GAME_THEME_URL}player-card-approach.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_1">
				<img src="{GAME_THEME_URL}player-card-charge.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_2">
				<img src="{GAME_THEME_URL}player-card-high-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_3">
				<img src="{GAME_THEME_URL}player-card-low-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_4">
				<img src="{GAME_THEME_URL}player-card-balance-strike.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
			<div class="cardslot" id="player-hand_5">
				<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
				<div class="selection-border"></div>
			</div>
		</div>

		<div id="opponent-area" class="hand-area">
			<div class="cardslot" id="opponent-hand_0">
				<img src="{GAME_THEME_URL}opponent-card-approach.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_1">
				<img src="{GAME_THEME_URL}opponent-card-charge.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_2">
				<img src="{GAME_THEME_URL}opponent-card-high-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_3">
				<img src="{GAME_THEME_URL}opponent-card-low-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_4">
				<img src="{GAME_THEME_URL}opponent-card-balance-strike.svg" draggable="false"/>
			</div>
			<div class="cardslot" id="opponent-hand_5">
				<img src="{GAME_THEME_URL}card-back.svg" draggable="false"/>
			</div>
		</div>

	</div>

</div>


<script type="text/javascript">

var jstpl_tooltip =
'<div class="tooltip-container">\
	<h3>${title}</h3>\
	<div class="tooltip-tag tooltip-type-${type}">${typeName}</div>\
	<div class="tooltip-desc">${desc}</div>\
	<div class="tooltip-img"><img src="{src}"/></div>\
	<div class="tooltip-desc" style="font-style: italic;">${flavor}</div>\
</div>'

</script>

{OVERALL_GAME_FOOTER}
