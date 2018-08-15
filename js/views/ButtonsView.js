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
	this.copiedItems = ko.observableArray([]);
	this.cuttedItems = ko.observableArray([]);
	this.pasteTooltip = ko.computed(function () {
		var aItems = _.union(this.cuttedItems(), this.copiedItems());
		if (aItems.length > 0)
		{
			return TextUtils.i18n('%MODULENAME%/ACTION_PASTE') + ': <br/>' + _.map(aItems, function (oFile) {
				return oFile.fileName();
			}).join(',<br/>');
		}
		else
		{
			return TextUtils.i18n('%MODULENAME%/ACTION_PASTE');
		}
	}, this);
}

CButtonsView.prototype.ViewTemplate = '%ModuleName%_ButtonsView';

CButtonsView.prototype.useFilesViewData = function (oFilesView)
{
	this.listCheckedAndSelected = oFilesView.selector.listCheckedAndSelected;
	this.checkedReadyForOperations = oFilesView.checkedReadyForOperations;
	this.moveItems = _.bind(oFilesView.moveItems, oFilesView);
	this.cutCommand = Utils.createCommand(this, function () {
		this.copiedItems([]);
		this.cuttedItems(this.listCheckedAndSelected());
		Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_CUTTED')]);
	}, function () {
		return this.checkedReadyForOperations() && this.listCheckedAndSelected().length > 0;
	});
	this.copyCommand = Utils.createCommand(this, function () {
		this.copiedItems(this.listCheckedAndSelected());
		this.cuttedItems([]);
		Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_COPIED')]);
	}, function () {
		return this.checkedReadyForOperations() && this.listCheckedAndSelected().length > 0;
	});
	this.pasteCommand = Utils.createCommand(this, function () {
		if (this.cuttedItems().length > 0)
		{
			oFilesView.moveItems('Move', oFilesView.getCurrentFolder(), this.cuttedItems());
			this.cuttedItems([]);
		}
		if (this.copiedItems().length > 0)
		{
			oFilesView.moveItems('Copy', oFilesView.getCurrentFolder(), this.copiedItems());
			this.copiedItems([]);
		}
	}, function () {
		return this.cuttedItems().length > 0 || this.copiedItems().length > 0;
	});
	this.savedItemsCount = ko.computed(function () {
		return this.cuttedItems().length + this.copiedItems().length;
	}, this);
};

module.exports = new CButtonsView();
