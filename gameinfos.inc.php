<?php

$gameinfos = array( 

	// Name of the game in English (will serve as the basis for translation) 
	'game_name' => "Kiri-ai: The Duel",

	// Game publisher (use empty string if there is no publisher)
	'publisher' => 'Mugen Gaming',

	// Url of game publisher website
	'publisher_website' => 'https://mugengaming.com/',

	// Board Game Geek ID of the publisher
	'publisher_bgg_id' => 53904,

	// Board game geek ID of the game
	'bgg_id' => 387769,

	'players' => array( 2 ),

	'suggest_player_number' => null,
	'not_recommend_player_number' => null,

	// Estimated game duration, in minutes (used only for the launch, afterward the real duration is computed)
	'estimated_duration' => 5,

	// Time in second add to a player when "giveExtraTime" is called (speed profile = fast)
	'fast_additional_time' => 20,

	// Time in second add to a player when "giveExtraTime" is called (speed profile = medium)
	'medium_additional_time' => 35,

	// Time in second add to a player when "giveExtraTime" is called (speed profile = slow)
	'slow_additional_time' => 50,

	// There are no possible ties.
	'tie_breaker_description' => "",

	// In two player games, there is no need to compare losing scores...
	'losers_not_ranked' => false,

	'solo_mode_ranked' => false,

	// Game is "beta". A game MUST set is_beta=1 when published on BGA for the first time, and must remains like this until all bugs are fixed.
	'is_beta' => 1,

	// Is this game cooperative (all players wins together or loose together)
	'is_coop' => 0,

	// Language dependency. If false or not set, there is no language dependency. If true, all players at the table must speak the same language.
	// If an array of shortcode languages such as array( 1 => 'en', 2 => 'fr', 3 => 'it' ) then all players at the table must speak the same language, and this language must be one of the listed languages.
	// NB: the default will be the first language in this list spoken by the player, so you should list them by popularity/preference.
	'language_dependency' => false,

	// Colors attributed to players. 
	'player_colors' => array( "e54025", "5093a3" ),

	// Favorite colors support : if set to "true", support attribution of favorite colors based on player's preferences (see reattributeColorsBasedOnPreferences PHP method)
	// NB: this parameter is used only to flag games supporting this feature; you must use (or not use) reattributeColorsBasedOnPreferences PHP method to actually enable or disable the feature.
	'favorite_colors_support' => true,

	// When doing a rematch, the player order is swapped using a "rotation" so the starting player is not the same
	// If you want to disable this, set this to true
	'disable_player_order_swap_on_rematch' => false,

	// Game interface width range (pixels)
	// Note: game interface = space on the left side, without the column on the right
	'game_interface_width' => array(

		// Minimum width
		//  default: 740
		//  maximum possible value: 740 (ie: your game interface should fit with a 740px width (correspond to a 1024px screen)
		//  minimum possible value: 320 (the lowest value you specify, the better the display is on mobile)
		'min' => 740,

		// Maximum width
		//  default: null (ie: no limit, the game interface is as big as the player's screen allows it).
		//  maximum possible value: unlimited
		//  minimum possible value: 740
		'max' => null
	),


//////// BGA SANDBOX ONLY PARAMETERS (DO NOT MODIFY)

	// simple : A plays, B plays, C plays, A plays, B plays, ...
	// circuit : A plays and choose the next player C, C plays and choose the next player D, ...
	// complex : A+B+C plays and says that the next player is A+B
	'is_sandbox' => false,
	'turnControl' => 'simple'

////////
);
