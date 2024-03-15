/// <reference path="types/bga/globals.d.ts" />
/// <reference path="types/dojo/dojo/1.11/index.d.ts" />
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