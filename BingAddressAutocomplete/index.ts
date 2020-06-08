	/// <reference path="types/MicrosoftMaps/Modules/Autosuggest.d.ts" />

import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class BingAddressAutocomplete implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private notifyOutputChanged: () => void;
    private searchBox: HTMLInputElement;

    private value: string;
    private street: string;
    private city: string;
    private county: string;
    private state: string;
    private zipcode: string;
    private country: string;
    private countrycode: string;
    private latitude: number;
    private longitude: number;

    constructor() {

    }

    public init(context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement) {
        if (typeof (context.parameters.bingapidevkey) === "undefined" ||
            typeof (context.parameters.bingapidevkey.raw) === "undefined" ||
            typeof (context.parameters.bingapiprodkey) === "undefined" ||
            typeof (context.parameters.bingapiprodkey.raw) === "undefined" ||
            typeof (context.parameters.isproductionbingkey) === "undefined") {
            container.innerHTML = "Please provide a valid bing api key/ missing production bing key flag";
            return;
        }

        this.notifyOutputChanged = notifyOutputChanged;

        this.searchBox = document.createElement("input");
        this.searchBox.setAttribute("id", "searchBox");
        this.searchBox.className = "addressAutocomplete";
        this.searchBox.addEventListener("mouseenter", this.onMouseEnter.bind(this));
        this.searchBox.addEventListener("mouseleave", this.onMouseLeave.bind(this));
        if (typeof (context.parameters.value) !== "undefined" &&
            typeof (context.parameters.value.raw) !== "undefined" && context.parameters.value.raw != null) {
            this.searchBox.setAttribute("value", context.parameters.value.raw);
        }

		container.setAttribute("id", "searchBoxContainer");
        container.appendChild(this.searchBox);

        let productionBingKeyFlag = context.parameters.isproductionbingkey.raw;
        let bingApiKey = context.parameters.bingapidevkey.raw;
        if (productionBingKeyFlag == true) {
            bingApiKey = context.parameters.bingapiprodkey.raw;
        }

        let bingApiKey = context.parameters.bingapikey.raw;
        let scriptUrl = "https://www.bing.com/api/maps/mapcontrol?callback=loadAutoSuggest&key=" + bingApiKey;

        let scriptNode = document.createElement("script");
        scriptNode.setAttribute("type", "text/javascript");
		scriptNode.setAttribute("src", scriptUrl);
		// scriptNode.setAttribute("async", "");
		// scriptNode.setAttribute("defer", "");

        document.head.appendChild(scriptNode);
        var _this = this;
        window.setTimeout(() => {

			Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
				callback: () => {
                    var options = {maxResults: 5};
                    var manager = new Microsoft.Maps.AutosuggestManager(options);
                    manager.attachAutosuggest('#searchBox', '#searchBoxContainer', (suggestionResult) => {

                        _this.street = suggestionResult.address.addressLine;
                        _this.city = suggestionResult.address.locality;
                        _this.county = suggestionResult.address.district;
                        _this.state = suggestionResult.address.adminDistrict;
                        _this.country = suggestionResult.address.countryRegion;
                        _this.zipcode = suggestionResult.address.postalCode;
                        _this.countrycode = suggestionResult.address.countryRegionISO2;
                        _this.latitude = suggestionResult.location.latitude;
                        _this.longitude = suggestionResult.location.longitude;

                        _this.value = suggestionResult.formattedSuggestion || "";
                        _this.notifyOutputChanged();
                    });
                },
				errorCallback: () =>{alert("Error with loading of module Microsoft.Maps.AutoSuggest.");}
			});
			

        },
            1000);
	}

	private selectedSuggestion(suggestionResult: Microsoft.Maps.ISuggestionResult): void {
		
		alert(suggestionResult.formattedSuggestion);

		this.value = "";
		this.street = "";
		this.city = "";
		this.county = "";
		this.state = "";
		this.country = "";
        this.zipcode = "";
        this.countrycode = "";
        this.latitude = 0;
        this.longitude = 0;
		
		this.value = suggestionResult.formattedSuggestion || "";
		this.notifyOutputChanged();
	}

    private onMouseEnter(): void {
        this.searchBox.className = "addressAutocompleteFocused";
    }

    private onMouseLeave(): void {
        this.searchBox.className = "addressAutocomplete";
    }


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
    }

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
    public getOutputs(): IOutputs {
        return {
            value: this.value,
            street: this.street,
            city: this.city,
            county: this.county,
            state: this.state,
            country: this.country,
            zipcode: this.zipcode,
            countrycode: this.countrycode,
            latitude: this.latitude,
            longitude: this.longitude
        };
    }

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}