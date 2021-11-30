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
function СButtonsView()
{
	this.oFilesView = null;
	this.copiedItems = ko.observableArray([]);
	this.cuttedItems = ko.observableArray([]);
	this.pasteTooltip = ko.computed(function () {
		var aItems = _.union(this.cuttedItems(), this.copiedItems());
		if (aItems.length > 0) {
			return TextUtils.i18n('%MODULENAME%/ACTION_PASTE') + ': <br/>' + _.map(aItems, function (oFile) {
				return oFile.fileName();
			}).join(',<br/>');
		} else {
			return TextUtils.i18n('%MODULENAME%/ACTION_PASTE');
		}
	}, this);
}

СButtonsView.prototype.ViewTemplate = '%ModuleName%_ButtonsView';

СButtonsView.prototype.useFilesViewData = function (oFilesView)
{
	this.oFilesView = oFilesView;

	this.savedItemsCount = ko.computed(function () {
		return this.cuttedItems().length + this.copiedItems().length;
	}, this);
	
	this.isCutAllowed = ko.computed(function () {
		var aItems = oFilesView.selector.listCheckedAndSelected();
		return	!oFilesView.isZipFolder() && !oFilesView.sharedParentFolder()
				&& aItems.length > 0 && oFilesView.allSelectedItemsNotShared()
				&& oFilesView.allSelectedFilesReady();
	}, this);
	this.cutCommand = Utils.createCommand(this, this.executeCut, this.isCutAllowed);

	this.isCopyAllowed = ko.computed(function () {
		return oFilesView.allSelectedFilesReady() && oFilesView.selector.listCheckedAndSelected().length > 0;
	}, this);
	this.copyCommand = Utils.createCommand(this, this.executeCopy, this.isCopyAllowed);

	this.isPasteAllowed = ko.computed(function () {
		var oSharedParentFolder = oFilesView.sharedParentFolder();
		return	this.savedItemsCount() > 0
				&& (!oFilesView.isSharedStorage() && !oSharedParentFolder
				|| oSharedParentFolder && oSharedParentFolder.bSharedWithMeAccessWrite);
	}, this);
	this.pasteCommand = Utils.createCommand(this, this.executePaste, this.isPasteAllowed);
};

СButtonsView.prototype.executeCut = function ()
{
	this.copiedItems([]);
	this.cuttedItems(this.oFilesView.selector.listCheckedAndSelected());
	Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_CUTTED')]);
};

СButtonsView.prototype.executeCopy = function ()
{
	this.copiedItems(this.oFilesView.selector.listCheckedAndSelected());
	this.cuttedItems([]);
	Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_COPIED')]);
};

СButtonsView.prototype.executePaste = function ()
{
	if (this.cuttedItems().length > 0) {
		this.oFilesView.moveItems('Move', this.oFilesView.getCurrentFolder(), this.cuttedItems());
		this.cuttedItems([]);
	}
	if (this.copiedItems().length > 0) {
		this.oFilesView.moveItems('Copy', this.oFilesView.getCurrentFolder(), this.copiedItems());
		this.copiedItems([]);
	}
};

module.exports = new СButtonsView();
