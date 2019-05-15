'use strict';

module.exports = function (oAppData) {
	var App = require('%PathToCoreWebclientModule%/js/App.js');

	if (App.isUserNormalOrTenant())
	{
		return {
			start: function (ModulesManager) {
				ModulesManager.run('FilesWebclient', 'registerToolbarButtons', [require('modules/%ModuleName%/js/views/ButtonsView.js')]);
			}
		};
	}
	
	return null;
};
