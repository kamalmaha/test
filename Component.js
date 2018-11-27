jQuery.sap.declare("fin.cash.cashposition.analyze.FIN_ANALYZEPOSIExtension.Component");

// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "fin.cash.cashposition.analyze",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/FIN_ANALYZEPOSI"
		// we use a URL relative to our own component
		// extension application is deployed with customer namespace
});

this.fin.cash.cashposition.analyze.Component.extend("fin.cash.cashposition.analyze.FIN_ANALYZEPOSIExtension.Component", {
	metadata: {
		manifest: "json"
	}
});