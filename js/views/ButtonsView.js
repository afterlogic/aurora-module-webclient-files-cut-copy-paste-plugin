'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Utils = require('%PathToCoreWebclientModule%/js/utils/Common.js'),

	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js')
;

CButtonsView

/**
 * @constructor 
 */
function CButtonsView()
{
	this.oFilesView = null;
	this.copiedItems = ko.observableArray([]);
	this.cuttedItems = ko.observableArray([]);
	this.sharedParentFolderWhereItemsCutFrom = ko.observable(null);

	this.savedItemsCount = ko.computed(function () {
		return this.cuttedItems().length + this.copiedItems().length;
	}, this);

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

CButtonsView.prototype.ViewTemplate = '%ModuleName%_ButtonsView';

CButtonsView.prototype.useFilesViewData = function (filesView)
{
	this.oFilesView = filesView;

	this.cutCommand = Utils.createCommand(this, this.executeCut, filesView.isCutAllowed);

	this.copyCommand = Utils.createCommand(this, this.executeCopy, filesView.isCopyAllowed);

	this.isPasteAllowed = ko.computed(function () {
		var
			allowPaste = false,
			sharedParentFolder = filesView.sharedParentFolder()
		;
		if (this.copiedItems().length > 0) {
			allowPaste = !filesView.isSharedStorage() && !sharedParentFolder
						 || sharedParentFolder && sharedParentFolder.sharedWithMeAccessWrite();
		}
		if (this.cuttedItems().length > 0) {
			allowPaste = filesView.storageType() === Enums.FileStorageType.Personal
						 && (!sharedParentFolder || sharedParentFolder && sharedParentFolder.sharedWithMeAccessWrite())
						 || filesView.isCorporateStorage()
						 || filesView.isSharedStorage() && sharedParentFolder && sharedParentFolder.sharedWithMeAccessWrite();
		}
		return allowPaste;
	}, this);
	this.pasteCommand = Utils.createCommand(this, this.executePaste, this.isPasteAllowed);
};

CButtonsView.prototype.executeCut = function ()
{
	this.copiedItems([]);
	this.cuttedItems(this.oFilesView.selector.listCheckedAndSelected());
	this.sharedParentFolderWhereItemsCutFrom(this.oFilesView.sharedParentFolder());
	Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_CUTTED')]);
};

CButtonsView.prototype.executeCopy = function ()
{
	this.copiedItems(this.oFilesView.selector.listCheckedAndSelected());
	this.cuttedItems([]);
	Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_COPIED')]);
};

CButtonsView.prototype.executePaste = function ()
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

module.exports = new CButtonsView();
