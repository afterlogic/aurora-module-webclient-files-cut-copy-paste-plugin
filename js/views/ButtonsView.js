'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Utils = require('%PathToCoreWebclientModule%/js/utils/Common.js'),
	
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js')
;

/**
 * @constructor
 */
function CButtonsView()
{
	this.cuttedItems = ko.observableArray([]);
}

CButtonsView.prototype.ViewTemplate = '%ModuleName%_ButtonsView';

CButtonsView.prototype.useFilesViewData = function (oFilesView)
{
	this.listCheckedAndSelected = oFilesView.selector.listCheckedAndSelected;
	this.moveItems = _.bind(oFilesView.moveItems, oFilesView)
	this.cutCommand = Utils.createCommand(this, function () {
		this.cuttedItems(this.listCheckedAndSelected());
		Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_CUTTED')]);
	}, function () {
		return this.listCheckedAndSelected().length > 0;
	});
	this.pasteCommand = Utils.createCommand(this, function () {
		oFilesView.moveItems('Move', oFilesView.getCurrentFolder(), this.cuttedItems());
		this.cuttedItems([]);
	}, function () {
		return this.cuttedItems().length > 0;
	});
};

module.exports = new CButtonsView();
