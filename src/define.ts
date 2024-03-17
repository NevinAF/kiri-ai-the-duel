/// <reference path="types/index.d.ts" />
/// <reference path="kiriaitheduel.ts" />

define([
	"dojo",
	"dojo/_base/declare",
	"ebg/core/gamegui",
	"ebg/counter",
],
function (dojo, declare) {
	return declare("bgagame.kiriaitheduel", ebg.core.gamegui, new KiriaiTheDuel());
});