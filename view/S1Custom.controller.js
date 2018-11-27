jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("fin.cash.cashposition.analyze.util.Conversions");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("sap.ui.generic.app.navigation.service.NavigationHandler");
jQuery.sap.require("sap.ui.generic.app.navigation.service.SelectionVariant");
jQuery.sap.require("sap.suite.ui.commons.util.DateUtils");
jQuery.sap.require("fin.cash.cashposition.analyze.helper.AppSettingsHelper");
jQuery.sap.require("fin.cash.cashposition.analyze.util.ErrorHandler");
jQuery.sap.require("fin.cash.cashposition.analyze.util.Util");
sap.ui.controller("fin.cash.cashposition.analyze.FIN_ANALYZEPOSIExtension.view.S1Custom", {
	util: null,
	oNavigationHandler: null,
	oPersonalization: null,
	bIsBankAccountViewCreated: false,
	bIsGLAccountViewCreated: false,
	bIsBankAccountView: false,
	oCurrView: null,
	oCurrSmartFilterBar: null,
	oCurrSmartTable: null,
	oCurrTable: null,
	bIsInitizedCall: false,
	onInit: function() {
		var t = this;
		this.util = fin.cash.cashposition.analyze.util.Conversions;
		this.oResoureModel = this.oApplicationFacade.getResourceBundle();
		this.oDateModel = this.getView().getModel();
		this.oDateErrorHandler = fin.cash.cashposition.analyze.util.ErrorHandler;
		this.oUtil = fin.cash.cashposition.analyze.util.Util;
		this.oComponent = this.getComponent();
		this.oNavigationHandler = new sap.ui.generic.app.navigation.service.NavigationHandler(this);
		if (sap.ui.Device.system.desktop) {
			this.getView().addStyleClass("sapUiSizeCompact");
		}
		var b = [];
		b.push({
			sId: "ButtonSwitchView",
			onBtnPressed: function(a) {
				t._switchView();
			}
		});
		var o = {
			buttonList: b,
			oAddBookmarkSettings: {
				title: this.oApplicationFacade.getResourceBundle().getText("FULLSCREEN_TITLE"),
				icon: "sap-icon://Fiori2/F0101",
				customUrl: function() {
					t.saveAppState();
					return document.URL;
				}
			},
			oJamOptions: {
				oShareSettings: {
					oDataServiceUrl: "/sap/opu/odata/sap/SM_INTEGRATION_SRV",
					object: {
						id: window.location.href,
						display: new sap.m.Label({
							text: this.oApplicationFacade.getResourceBundle().getText("FULLSCREEN_TITLE")
						}),
						share: ""
					}
				}
			},
			oEmailSettings: {
				sSubject: this.oApplicationFacade.getResourceBundle().getText("FULLSCREEN_TITLE"),
				sRecepient: "",
				fGetMailBody: function() {
					t.saveAppState();
					return document.URL;
				}
			},
			aAdditionalSettingButtons: [{
				sI18nBtnTxt: "SETTINGS",
				sId: "ButtonSetting",
				onBtnPressed: $.proxy(this.onAppSettingsPressed, this)
			}]
		};
		this.setHeaderFooterOptions(o);
		this.oPersonalization = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("Personalization");
		if (this.oPersonalization) {
			var p = {
				container: "fin.cash.cashposition.analyze" + (sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser().getId() || {}),
				item: "favorites"
			};
			this.oPersonalizer = this.oPersonalization.getPersonalizer(p);
		}
		this.oAppSettingsHelper = new fin.cash.cashposition.analyze.helper.AppSettingsHelper(this.oApplicationFacade.getODataModel(), this.getView(),
			this, this.oPersonalizer);
		var s = new sap.ui.model.json.JSONModel({
			scaling: 0,
			decimals: 3
		});
		this.getView().setModel(s, "Scaling");
		this.oDateErrorHandler.initODateErrorHandler(this);
		var e = null;
		var d = null;
		if (this.extHookAssignExtTableColumnsForTableView) {
			this.extHookAssignExtTableColumnsForTableView(e, d);
		}
		if (this.extHookAssignExtTableColumnsForDeltaView) {
			this.extHookAssignExtTableColumnsForDeltaView(e, d);
		}
		if (this.extHookAssignExtTableColumnsBCV) {
			this.extHookAssignExtTableColumnsBCV(e, d);
		}
		if (this.extHookAssignExtTableColumnsBAV) {
			this.extHookAssignExtTableColumnsBAV(e, d);
		}
		if (this.extHookonDataReceived) {
			this.extHookonDataReceived(this.model);
		}
		if (this.extHookOnInit) {
			this.extHookOnInit();
		}
	},

	onclickBAC: function() {
		
                     var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
                        this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
         
         this.oCrossAppNavigator.toExternal({ target : { shellHash : "#MemoRecord-createMemoRecord" } });
                        // var hashForApp = this.oCrossAppNavigator.hrefForExternal({
                        //   target: {semanticObject: "MemoRecord",action: "createMemoRecord"},
                          //params: {"ODataSearchFieldFilter": FUNumber}
                         //});
	},
	
	
		onclickGLV: function() {
		
 var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
                        this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
         
         this.oCrossAppNavigator.toExternal({ target : { shellHash : "#MemoRecord-createMemoRecord" } });
	},
	
	
	

	_switchView: function() {
		var i = false;
		if (this.bIsBankAccountViewCreated) {
			var b = this.getView().byId("containerBankAccount");
			var a = b.getVisible();
			if (a) {
				i = true;
			}
		}
		if (i) {
			this._switchToGLAccountView();
		} else {
			this._switchToBankAccountView();
		}
	},
	_switchToGLAccountView: function() {
		if (!this.bIsGLAccountViewCreated) {
			this._createGLAccountView();
		}
		var g = this.getView().byId("containerGLAccount");
		g.setVisible(true);
		if (this.bIsBankAccountViewCreated) {
			var b = this.getView().byId("containerBankAccount");
			b.setVisible(false);
		}
		this.oCurrSmartFilterBar = this.getView().byId("smartFilterBarGL");
		this.oCurrSmartTable = this.getView().byId("GLAccountSmartTable");
		this.oCurrTable = this.getView().byId("GLAccountTable");
		this.setSmartLinkMapField(false);
		var o = this._oHeaderFooterOptions;
		o.buttonList[0].sI18nBtnTxt = "displayAll";
		var a = this.getView().getModel("i18n").getResourceBundle();
		var s = a.getText("displayAll");
		this.setBtnText("ButtonSwitchView", s);
		this.bIsBankAccountView = false;
	},
	_switchToBankAccountView: function() {
		if (!this.bIsBankAccountViewCreated) {
			this._createBankAccountView();
		}
		var b = this.getView().byId("containerBankAccount");
		b.setVisible(true);
		if (this.bIsGLAccountViewCreated) {
			var g = this.getView().byId("containerGLAccount");
			g.setVisible(false);
		}
		this.oCurrSmartFilterBar = this.getView().byId("smartFilterBarBankAcct");
		this.oCurrSmartTable = this.getView().byId("BankAccountSmartTable");
		this.oCurrTable = this.getView().byId("BankAccountTable");
		this.setSmartLinkMapField(true);
		var o = this._oHeaderFooterOptions;
		var a = this.getView().getModel("i18n").getResourceBundle();
		var s = a.getText("displayDelta");
		this.setBtnText("ButtonSwitchView", s);
		this.bIsBankAccountView = true;
	},
	_createBankAccountView: function() {
		var f = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.cashposition.analyze.FIN_ANALYZEPOSIExtension.view.BankAccountView", this);
		this.getView().byId("pageCashPosition").addContent(f);
		var b = this.getView().byId("BankAccountTable");
		if (sap.ui.Device.system.desktop) {
			b.addStyleClass("sapUiSizeCondensed");
		} else {
			b.addStyleClass("sapUiSizeCozy");
		}
		b.setSelectionMode(sap.ui.table.SelectionMode.Single);
		var a = this.getView().byId("containerBankAccount");
		a.setVisible(false);
		this.bIsBankAccountViewCreated = true;
	},
	_createGLAccountView: function() {
		var f = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.cashposition.analyze.FIN_ANALYZEPOSIExtension.view.GLAccountView", this);
		this.byId("pageCashPosition").addContent(f);
		var g = this.getView().byId("GLAccountTable");
		if (sap.ui.Device.system.desktop) {
			g.addStyleClass("sapUiSizeCondensed");
		} else {
			g.addStyleClass("sapUiSizeCozy");
		}
		g.setSelectionMode(sap.ui.table.SelectionMode.Single);
		var a = this.getView().byId("containerGLAccount");
		a.setVisible(false);
		this.bIsGLAccountViewCreated = true;
	},
	setSmartLinkMapField: function(v) {
		if (v) {
			this.getView().byId("idBefore").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay1").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay2").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay3").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay4").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay5").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay6").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay7").setMapFieldToSemanticObject(false);
			this.getView().byId("idAfter").setMapFieldToSemanticObject(false);
		} else {
			this.getView().byId("idBeforeGL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay1GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay2GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay3GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay4GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay5GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay6GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idDay7GL").setMapFieldToSemanticObject(false);
			this.getView().byId("idAfterGL").setMapFieldToSemanticObject(false);
		}
	},
	onBeforeRendering: function() {
		var t = this;
		t.oAppSettingsHelper.asyncGetSettings(function(s) {
			var a = 0,
				d = 2,
				b = 0;
			if (s.Scaling) {
				a = s.Scaling;
			}
			if (s.Decimals) {
				d = s.Decimals;
			}
			if (s.DefaultView) {
				b = s.DefaultView;
			}
			t.getView().getModel("Scaling").setData({
				scaling: a,
				decimals: d
			}, false);
			t.initAppState(true, b);
		}, function() {
			t.setDefaultView(0);
		}, this);
		this.bIsInitizedCall = true;
	},
	showMessageBox: function(m, M, s, t) {
		var i = null;
		switch (t) {
			case "Error":
				{
					i = sap.m.MessageBox.Icon.ERROR;
					break;
				}
			case "Warning":
				{
					i = sap.m.MessageBox.Icon.WARNING;
					break;
				}
			case "Information":
				{
					i = sap.m.MessageBox.Icon.INFORMATION;
					break;
				}
		}
		sap.m.MessageBox.show(m, {
			icon: i,
			title: M,
			details: s,
			styleClass: "sapUiSizeCompact",
			actions: [sap.m.MessageBox.Action.CLOSE]
		});
	},
	onInitSmartFilterBar: function() {
		if (this.bIsInitizedCall === false) {
			this.initAppState(false, 0);
		}
		this.bIsInitizedCall = false;
	},
	initAppState: function(I, d) {
		var p = this.oNavigationHandler.parseNavigation();
		var t = this;
		p.done(function(a, u, n) {
			var s = new sap.ui.generic.app.navigation.service.SelectionVariant(a.selectionVariant);
			var v = s.getValue("ValueDate");
			var c = t.getCertaintyLevelDefault();
			if (n === sap.ui.generic.app.navigation.service.NavType.iAppState) {
				if (a.customData && I === true) {
					t.restoreView(a.customData.tableEntitySet);
				}
				var h = a && a.bNavSelVarHasDefaultsOnly;
				if (t.oCurrTable) {
					t.oCurrTable.setNumberOfExpandedLevels(0);
				}
				if (v === undefined) {
					s.addSelectOption("ValueDate", "I", "EQ", t.getValueDateDefault());
				}
				var S = s.getParameterNames().concat(s.getSelectOptionsPropertyNames());
				for (var i = 0; i < S.length; i++) {
					if (t.oCurrSmartFilterBar) {
						if (t.oCurrSmartFilterBar.getControlByKey(S[i]) === undefined) {
							s.removeSelectOption(S[i]);
						} else {
							t.oCurrSmartFilterBar.addFieldToAdvancedArea(S[i]);
						}
					}
				}
				if (t.oCurrSmartFilterBar) {
					if (!h || t.oCurrSmartFilterBar.getCurrentVariantId() === "") {
						t.oCurrSmartFilterBar.clearVariantSelection();
						t.oCurrSmartFilterBar.clear();
						t.oCurrSmartFilterBar.setDataSuiteFormat(s.toJSONString(), true);
					}
				}
				if (a.tableVariantId && t.oCurrSmartTable) {
					t.oCurrSmartTable.setCurrentVariantId(a.tableVariantId);
				}
				if (!h && t.oCurrSmartFilterBar) {
					t.oCurrSmartFilterBar.search();
				}
			} else if (n === sap.ui.generic.app.navigation.service.NavType.initial) {
				if (I === true) {
					t.setDefaultView(d);
				}
				s.addSelectOption("ValueDate", "I", "EQ", t.getValueDateDefault());
				jQuery.each(c, function(b, e) {
					s.addSelectOption("CertaintyLevel", "I", "EQ", e);
				});
				a.selectionVariant = s.toJSONString();
				t.oCurrSmartFilterBar.setDataSuiteFormat(a.selectionVariant);
			} else if (n === sap.ui.generic.app.navigation.service.NavType.xAppState) {
				if (I === true) {
					t.setDefaultView(d);
				}
				var C = t.oCurrSmartFilterBar.getCurrentVariantId();
				if (!s.getSelectOption("ValueDate")) {
					s.addSelectOption("ValueDate", "I", "EQ", t.getValueDateDefault());
				}
				if (!s.getSelectOption("CertaintyLevel")) {
					jQuery.each(c, function(b, e) {
						s.addSelectOption("CertaintyLevel", "I", "EQ", e);
					});
				}
				if (s.getSelectOption("Currency")) {
					s.renameSelectOption("Currency", "BankAccountCurrency");
				}
				s.setID(C);
				a.selectionVariant = s.toJSONString();
				t.oCurrSmartFilterBar.setDataSuiteFormat(a.selectionVariant);
			}
		});
		p.fail(function(e) {
			var o = this.getView().getModel("i18n").getResourceBundle();
			e.setUIText({
				oi18n: o,
				sTextKey: "INBOUND_NAV_ERROR"
			});
			e.showMessageBox();
		});
	},
	setDefaultView: function(s) {
		if (parseInt(s) === 0) {
			this._switchToBankAccountView();
		} else {
			this._switchToGLAccountView();
		}
	},
	restoreView: function(e) {
		switch (e) {
			case "CashDisPositionDeltaViewSet":
				{
					this._switchToGLAccountView();
					break;
				}
			case "CashDisPositionTableViewSet":
				{
					this._switchToBankAccountView();
					break;
				}
		}
	},
	getComponent: function() {
		var c = sap.ui.core.Component.getOwnerIdFor(this.getView());
		return sap.ui.component(c);
	},
	onAppSettingsPressed: function() {
		var s = this.oAppSettingsHelper.getSettingsDialog();
		if (s) {
			s.open();
		}
	},
	onShowAll: function() {
		this.getODataDataForDelta("ShowAll");
	},
	onShowDelta: function() {
		this.getODataDataForDelta("ShowDelta");
	},
	getODataDataForDelta: function(m) {
		var e = null;
		switch (m) {
			case "ShowDelta":
				{
					e = "CashDisPositionDeltaViewSet";
					this.oCurrSmartTable.setEntitySet(e);
					this.oCurrSmartTable.rebindTable(true);
					break;
				}
			case "ShowAll":
				{
					e = "CashDisPositionTableViewSet";
					this.oCurrSmartTable.setEntitySet(e);
					this.oCurrSmartTable.rebindTable(true);
					break;
				}
		}
	},
	onExpandForBankAccountView: function() {
		var g = this.oCurrTable._aGroupedColumns.length;
		this.oCurrTable.setNumberOfExpandedLevels(g);
		this.oCurrSmartTable.rebindTable(true);
	},
	onCollapseForBankAccountView: function() {
		this.oCurrTable.setNumberOfExpandedLevels(0);
		this.oCurrTable.collapseAll();
	},
	onExpandForGLView: function() {
		var g = this.oCurrTable._aGroupedColumns.length;
		this.oCurrTable.setNumberOfExpandedLevels(g);
		this.oCurrSmartTable.rebindTable(true);
	},
	onCollapseForGLView: function() {
		this.oCurrTable.setNumberOfExpandedLevels(0);
		this.oCurrTable.collapseAll();
	},
	onBeforeRebindTable: function(e) {
		var b = e.getParameter("bindingParams");
		b.parameters["provideTotalResultSize"] = false;
		if (b.parameters.select.indexOf("SummarizationTerm") !== -1 && this.oCurrSmartFilterBar.getFilterData(true).SummarizationGroup.items.length ===
			0) {
			var o = this.getView().getModel("i18n").getResourceBundle();
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: o.getText("GROUPING_EMPTY")
			});
			b.preventTableBind = true;
		} else {
			b.preventTableBind = false;
		}
		var v = this.oCurrSmartFilterBar.getFilterData(true).ValueDate;
		if (v) {
			this.refillDaysColumn(v);
		}
	},
	refillDaysColumn: function(d) {
		var c = d;
		if (this.bIsBankAccountView) {
			this.getView().byId("PaymentDay1ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay2ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay3ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay4ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay5ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay6ColLabel").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay7ColLabel").setText(this.util.dateFormatMedium(c));
		} else {
			this.getView().byId("PaymentDay1ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay2ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay3ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay4ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay5ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay6ColLabelGL").setText(this.util.dateFormatMedium(c));
			c = sap.suite.ui.commons.util.DateUtils.incrementDateByIndex(c, 1);
			this.getView().byId("PaymentDay7ColLabelGL").setText(this.util.dateFormatMedium(c));
		}
	},
	onBeforePopoverOpens: function(e) {
		var p = e.getParameters();
		var i = p.originalId;
		var s = new sap.ui.generic.app.navigation.service.SelectionVariant(this.oCurrSmartFilterBar.getDataSuiteFormat());
		this.processNullNaviValue(i, s);
		this.setDateForDiffPaymentDay(p, s, i);
		this.cleanCertainLevelForOverdueAndFuture(p, s, i);
		this.addMoreNavParameters(s);
		this.removeNavPlanLevelValueForBalance(p, s);
		this.removeNotUsedContextNavParameters(p);
		this.saveAppState();
		this.oNavigationHandler.processBeforeSmartLinkPopoverOpens(p, s.toJSONString(), this.oInnerAppData);
	},
	removeNavPlanLevelValueForBalance: function(p, s) {
		if (p.semanticAttributes.KeyFigure && p.semanticAttributes.KeyFigure === "1") {
			s.removeSelectOption("PlanningLevel");
		}
	},
	processNullNaviValue: function(i, s) {
		var S = this.getView().byId(i);
		var c = S.getBindingContext();
		var o = c.getObject(c.getPath());
		if (o.BankAccount === "") {
			if (s.getSelectOption("BankAccount")) {
				s.removeSelectOption("BankAccount");
			}
			s.addSelectOption("BankAccount", "I", "EQ", "");
		}
		if (o.PlanningLevel === "") {
			if (s.getSelectOption("PlanningLevel")) {
				s.removeSelectOption("PlanningLevel");
			}
			s.addSelectOption("PlanningLevel", "I", "EQ", "");
		}
		if (o.GLAccount === "") {
			if (s.getSelectOption("GLAccount")) {
				s.removeSelectOption("GLAccount");
			}
			s.addSelectOption("GLAccount", "I", "EQ", "");
		}
	},
	removeNotUsedContextNavParameters: function(p) {
		delete p.semanticAttributes.PaymentAfter;
		delete p.semanticAttributes.PaymentBefore;
		delete p.semanticAttributes.PaymentDay1;
		delete p.semanticAttributes.PaymentDay2;
		delete p.semanticAttributes.PaymentDay3;
		delete p.semanticAttributes.PaymentDay4;
		delete p.semanticAttributes.PaymentDay5;
		delete p.semanticAttributes.PaymentDay6;
		delete p.semanticAttributes.PaymentDay7;
		if (p.semanticAttributes.KeyFigure && p.semanticAttributes.KeyFigure === "1") {
			delete p.semanticAttributes.KeyFigure;
		}
	},
	setDateForDiffPaymentDay: function(p, s, i) {
		var v = s.getValue("ValueDate");
		if (v) {
			var V = this.parseNavToValueDate(p, i, v[0].Low);
			s.removeParameter("ValueDate");
			if (V && V.sLow && V.sHigh) {
				s.addSelectOption("ValueDate", "I", "BT", V.sLow, V.sHigh);
			}
		}
	},
	cleanCertainLevelForOverdueAndFuture: function(p, s, i) {
		if (i.search(/idBefore/) !== -1 || i.search(/idAfter/) !== -1) {
			var c = s.getSelectOption("CertaintyLevel");
			if (c !== undefined) {
				jQuery.each(c, function(a, v) {
					if (v.Low === "ACTUAL") {
						c.splice(a, 1);
						return false;
					}
				});
				s.removeSelectOption("CertaintyLevel");
				s.massAddSelectOption("CertaintyLevel", c);
			}
		}
		if (p.semanticAttributes.KeyFigure && p.semanticAttributes.KeyFigure === "1") {
			if (i.search(/idDay1/) !== -1 || i.search(/idDay1GL/) !== -1) {
				s.removeSelectOption("CertaintyLevel");
				s.addSelectOption("CertaintyLevel", "I", "EQ", "ACTUAL");
			}
		}
	},
	addMoreNavParameters: function(s) {
		s.addParameter("TransferFrom", "X");
		s.addParameter("TransferTo", "X");
		if (!s.getSelectOption("BankAccountCurrency")) {
			s.addParameter("BankAccountCurrency", " ");
		}
	},
	onNavTargetsObtained: function(e) {
		var E = e.getParameters();
		E.show(" ", null, E.actions);
	},
	onPopoverLinkPressed: function(e) {
		this.saveAppState();
	},
	getValueDateDefault: function() {
		var t = new Date();
		return t.toJSON();
	},
	getCertaintyLevelDefault: function() {
		var l = [
			"ACTUAL",
			"SI_CIT",
			"TRM_D",
			"TRM_O",
			"CMIDOC",
			"FICA",
			"MEMO"
		];
		return l;
	},
	onTargetObtained: function(e) {
		var p = e.getParameters();
		var s = e.getSource();
		var c = false;
		if (p.originalId.indexOf("linkGLAccount") !== -1) {
			c = true;
		}
		var d = false;
		if (this.oCurrSmartTable.getEntitySet() === "CashDisPositionGLViewSet" && p.semanticAttributes.GLAccount !== "") {
			d = true;
		}
		var a = [];
		var f = this.addContentToPopOver(p, s);
		jQuery.each(p.actions, function(i, v) {
			var b = v.getHref();
			if (c) {
				if (d) {
					if (b.search(/GLAccount-displayBalance/) !== -1 || b.search(/GLAccount-displayGLLineItem/) !== -1) {
						a.push(v);
					}
				}
			} else {
				if (b.search(/BankAccount-analyzePaymentDetails/) !== -1 || b.search(/BankAccount-transferFromCurrency/) !== -1 || b.search(
						/BankAccount-transferToCurrency/) !== -1) {
					if (b.search(/BankAccount-analyzePaymentDetailsCompany/) !== -1 || b.search(/BankAccount-analyzePaymentDetailsPM/) !== -1 || b.search(
							/BankAccount-analyzePaymentDetailsCurrency/) !== -1 || b.search(/BankAccount-analyzePaymentDetailsBank/) !== -1 || b.search(
							/BankAccount-analyzePaymentDetailsStatus/) !== -1 || b.search(/BankAccount-analyzePaymentDetailsLiquidityItem/) !== -1) {
						return true;
					}
					a.push(v);
				}
			}
		});
		p.actions = this.provideAdditionalParameter(a);
		p.show(null, null, p.actions, f);
	},
	addContentToPopOver: function(p, s) {
		var f = new sap.ui.layout.form.SimpleForm({
			ColumnsL: 2
		});
		f.setLayout("ResponsiveGridLayout");
		if (p.originalId.indexOf("linkGLAccount") === -1) {
			var a = new sap.m.Text();
			var b = new sap.m.Text();
			var A = this.oResoureModel.getText("AMUONTLABEL");
			var B = this.oResoureModel.getText("BANKACCOUNTLABEL");
			var o = new sap.m.Label({
				text: A
			});
			var c = new sap.m.Label({
				text: B
			});
			a.setText(s.getProperty("text"));
			b.setText(p.semanticAttributes.BankAccount);
			f.addContent(o);
			f.addContent(a);
			if (p.semanticAttributes.BankAccount !== null) {
				f.addContent(c);
				f.addContent(b);
			}
		} else {
			var g = new sap.m.Text();
			g.setText(s.getProperty("text"));
			var G = this.oResoureModel.getText("GLACCOUNTLABEL");
			var d = new sap.m.Label({
				text: G
			});
			f.addContent(d);
			f.addContent(g);
		}
		var C = this.oResoureModel.getText("COMPANYCODELABEL");
		var e = new sap.m.Label({
			text: C
		});
		var h = new sap.m.Text();
		if (p.semanticAttributes.CompanyCodeName !== undefined) {
			h.setText(p.semanticAttributes.CompanyCode + "(" + p.semanticAttributes.CompanyCodeName + ")");
		} else {
			h.setText(p.semanticAttributes.CompanyCode);
		}
		if (p.semanticAttributes.CompanyCode !== null) {
			f.addContent(e);
			f.addContent(h);
		}
		return f;
	},
	provideAdditionalParameter: function(a) {
		var A = [];
		var t = null;
		jQuery.each(a, function(i, v) {
			var u = v.getHref();
			if (u.search(/Bank-transferFrom/) !== -1 && u.search(/Bank-transferTo/) === -1) {
				t = u.replace("TransferTo=X", "TransferTo= ");
				v.setHref(t);
			}
			if (u.search(/Bank-transferTo/) !== -1) {
				t = u.replace("TransferFrom=X", "TransferFrom= ");
				v.setHref(t);
			}
		});
		A = a;
		return A;
	},
	onBankAccountLinkPressed: function(e) {
		var c = e.getSource();
		var C = c.getBindingContext();
		var s = "BankAccount";
		var a = "displayBankAccount";
		var n = {};
		if (C.getProperty("BankAccount") === "Not Assigned") {
			var m = this.oResoureModel.getText("BANKACCOUTNAVCONTENT");
			var M = this.oResoureModel.getText("BANKACCOUTNAVTITLE");
			var b = this.oResoureModel.getText("BANKACCOUNTNABDETAIL");
			var t = "Error";
			this.showMessageBox(m, M, b, t);
		} else {
			n.ACC_NUM = C.getProperty("BankAccount");
			var i = {
				selectionVariant: this.oCurrSmartFilterBar.getDataSuiteFormat(),
				tableVariandId: this.oCurrSmartTable.getCurrentVariantId()
			};
			var o = jQuery.proxy(function(E) {
				var d = this.getView().getModel("i18n").getResourceBundle();
				E.setUIText({
					oi18n: d,
					sTextKey: "OUTBOUND_NAV_ERROR"
				});
				E.showMessageBox();
			}, this);
			this.saveAppState();
			this.oNavigationHandler.navigate(s, a, n, i, o);
		}
	},
	parseNavToValueDate: function(p, i, v) {
		var s = [
			"idBefore",
			"idDay1",
			"idDay2",
			"idDay3",
			"idDay4",
			"idDay5",
			"idDay6",
			"idDay7",
			"idAfter",
			"idBeforeGL",
			"idDay1GL",
			"idDay2GL",
			"idDay3GL",
			"idDay4GL",
			"idDay5GL",
			"idDay6GL",
			"idDay7GL",
			"idAfterGL"
		];
		var B = {};
		B.Flow = 0;
		B.Opening = 1;
		B.Closing = 2;
		var b = B.Flow;
		var n = new Date(v);
		var f = jQuery.extend(true, new Date(), n);
		var F = jQuery.extend(true, new Date(), n);
		var o = jQuery.extend(true, new Date(), n);
		f.setFullYear(1900);
		f.setMonth(0);
		f.setDate(1);
		var V = {};
		jQuery.each(s, function(a, c) {
			var P = new RegExp(c);
			if (P.test(i)) {
				var k = p.semanticAttributes.KeyFigure;
				if (k == "1") {
					b = B.Opening;
				} else if (k === undefined) {
					b = B.Closing;
				} else {
					b = B.Flow;
				}
				if (c !== "idBefore" && c !== "idAfter" && c !== "idDay1" && c !== "idDay1GL" && c !== "idBeforeGL" && c !== "idAfterGL") {
					var d;
					if (a <= 8) {
						d = a - 1;
					} else {
						d = a - 10;
					}
					n.setDate(n.getDate() + d);
					o.setDate(n.getDate() - 1);
					V = {
						sLow: b == B.Opening || b == B.Closing ? f.toJSON() : n.toJSON(),
						sHigh: b == B.Opening ? o.toJSON() : n.toJSON()
					};
					return false;
				} else if (c === "idBefore" || c === "idBeforeGL") {
					n.setDate(n.getDate() - 1);
					o.setDate(n.getDate() - 1);
					V = {
						sLow: b == B.Opening || b == B.Closing ? f.toJSON() : f.toJSON(),
						sHigh: b == B.Opening ? o.toJSON() : n.toJSON()
					};
					return false;
				} else if (c === "idDay1" || c === "idDay1GL") {
					n.setDate(n.getDate());
					o.setDate(n.getDate() - 1);
					V = {
						sLow: p.semanticAttributes.PaymentBefore && parseInt(p.semanticAttributes.PaymentBefore) === 0 && b === B.Flow ? n.toJSON() : f
							.toJSON(),
						sHigh: b == B.Opening ? o.toJSON() : n.toJSON()
					};
					return false;
				} else if (c === "idAfter" || c === "idAfterGL") {
					if (c === "idAfter") {
						d = a - 1;
					} else {
						d = a - 10;
					}
					n.setDate(n.getDate() + d);
					F.setFullYear(9999);
					F.setMonth(0);
					F.setDate(1);
					V = {
						sLow: n.toJSON(),
						sHigh: F.toJSON()
					};
					return false;
				}
			}
		});
		return V;
	},
	setNavCustomData: function() {
		var c = {};
		c.tableEntitySet = this.oCurrSmartTable.getEntitySet();
		return c;
	},
	saveAppState: function() {
		this.oInnerAppData = {
			selectionVariant: this.oCurrSmartFilterBar.getDataSuiteFormat(),
			tableVariantId: this.oCurrSmartTable.getCurrentVariantId(),
			customData: this.setNavCustomData()
		};
		this.oStoreInnerAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.oInnerAppData);
		this.oStoreInnerAppStatePromise.done(function() {});
		this.oStoreInnerAppStatePromise.fail(function(e) {
			var o = this.getView().getModel("i18n").getResourceBundle();
			e.setUIText({
				oi18n: o,
				sTextKey: "STORE_ERROR"
			});
			e.showMessageBox();
		});
	},
	extHookAssignExtTableColumnsBAV: function(e, d) {
		// Place your hook implementation code here 
	},
	extHookAssignExtTableColumnsForDeltaView: function(e, d) {
		// Place your hook implementation code here 
	}
});