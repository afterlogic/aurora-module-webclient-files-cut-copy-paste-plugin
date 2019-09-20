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
function ButtonsView()
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
	this.storageType = null;
	this.getStorageByType = null;
	this.cutButtonModules = ko.observableArray([]);	//list of modules that disable "cut" button
	this.pasteButtonModules = ko.observableArray([]);	//list of modules that disable "paste" button
	this.isDisabledCutButton = ko.computed(function () {
		return this.cutButtonModules().length > 0;
	}, this);
	this.isDisabledPasteButton = ko.computed(function () {
		return this.pasteButtonModules().length > 0;
	}, this);
}

ButtonsView.prototype.ViewTemplate = '%ModuleName%_ButtonsView';

ButtonsView.prototype.useFilesViewData = function (oFilesView)
{
	this.getStorageByType = _.bind(oFilesView.getStorageByType, oFilesView);
	this.storageType = oFilesView.storageType;
	this.listCheckedAndSelected = oFilesView.selector.listCheckedAndSelected;
	this.checkedReadyForOperations = oFilesView.checkedReadyForOperations;
	this.moveItems = _.bind(oFilesView.moveItems, oFilesView);
	this.cutCommand = Utils.createCommand(this, function () {
		this.copiedItems([]);
		this.cuttedItems(this.listCheckedAndSelected());
		Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_ITEMS_CUTTED')]);
	}, function () {
		return this.checkedReadyForOperations() && this.listCheckedAndSelected().length > 0 && !this.isDisabledCutButton();
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
		return ((this.cuttedItems().length > 0 || this.copiedItems().length > 0) && !this.isDisabledPasteButton());
	});
	this.savedItemsCount = ko.computed(function () {
		return this.cuttedItems().length + this.copiedItems().length;
	}, this);
	oFilesView.pathItems.subscribe(function () {
		var
			iPathItemsLength = oFilesView.pathItems().length,
			oLastPathItem = oFilesView.pathItems()[iPathItemsLength - 1] || false
		;

		//Disable toolbar buttons for "root" directory of Shared files
		//and for folders with access level "Read"
		if ((!this.isSharedStorage()
			|| (iPathItemsLength !== 0
				&& oLastPathItem.oExtendedProps
				&& oLastPathItem.oExtendedProps.Access
				&& oLastPathItem.oExtendedProps.Access === Enums.SharedFileAccess.Write
			))
			&& this.isDropAllowedToStorage()
		)
		{
			this.enableButton(this.pasteButtonModules, '%ModuleName%');
		}
		else
		{
			this.disableButton(this.pasteButtonModules, '%ModuleName%');
		}
		//Disable delete buttons for folders with access level "Read"
		if (this.isSharedStorage()
			&& iPathItemsLength !== 0
			&& oLastPathItem.oExtendedProps
			&& oLastPathItem.oExtendedProps.Access
			&& oLastPathItem.oExtendedProps.Access !== Enums.SharedFileAccess.Write
		)
		{
			this.disableButton(this.cutButtonModules, '%ModuleName%');
		}
		else
		{
			this.enableButton(this.cutButtonModules, '%ModuleName%');
		}
	}, this);
};

ButtonsView.prototype.disableButton = function (koButtonModules, sModuleName)
{
	if (koButtonModules.indexOf(sModuleName) === -1)
	{
		koButtonModules.push(sModuleName);
	}
};

ButtonsView.prototype.enableButton = function (koButtonModules, sModuleName)
{
	koButtonModules.remove(sModuleName);
};

ButtonsView.prototype.isSharedStorage = function ()
{
	return this.storageType() === Enums.FileStorageType.Shared;
};

ButtonsView.prototype.isDropAllowedToStorage = function ()
{
	var oStorage = this.getStorageByType(this.storageType());
	return oStorage && oStorage.droppable === false ? false : true;
};


module.exports = new ButtonsView();
