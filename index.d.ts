// Modern ES module exports
export declare const lx: lxr.LxCustomReportLib;
export { lxr };

// Global variable for backward compatibility (legacy side-effect import pattern)
declare global {
  const lx: lxr.LxCustomReportLib;
}

declare module lxr
{
	interface HostReportSetup extends ReportSetup {
	    settings: HostReportSetupSettings;
	}
	interface HostReportSetupSettings extends ReportSetupSettings {
	    features: Feature[];
	}
	type FeatureType = 'FUNCTIONAL' | 'QUOTA';
	type FeatureStatus = 'DISABLED' | 'ENABLED';
	interface Feature {
	    id?: string;
	    name?: string;
	    type?: FeatureType;
	    description?: string;
	    status?: FeatureStatus;
	    quota?: number;
	    roles?: string[];
	    customized?: boolean;
	}
	/**
	 * Entry class of the LeanIX Reporting Library.
	 * An instance of this class is globally available as `lx` variable.
	 *
	 * @example
	 * ```js
	 * // The sequence to initialise the library for a report looks like this:
	 * lx.init()
	 * .then(function (setupInfo) {
	 *   // Process setupInfo and create config object
	 *   var config = {};
	 *   lx.ready(config);
	 * });
	 * ```
	 */
	export class LxCustomReportLib {
	    table: ReportLibTable;
	    get latestPublishedState(): any;
	    readonly dataModelHelpers: DataModelHelpers;
	    private messenger;
	    private _currentSetup;
	    private latestFacetsResults;
	    private _latestPublishedState;
	    private customDropdownCallbacks;
	    private latestMouseEvent;
	    private latestFocusedElement;
	    constructor();
	    /**
	     * Starts initialisation of the reporting framework. Returns a promise
	     * which is resolved once initialisation with the framework is finished. The
	     * resolved promise contains a {@link ReportSetup} instance with information
	     * provided to you through the framework.
	     * With that information you should be able to set up your report properly. Once
	     * that is done the {@link LxCustomReportLib.ready} function needs be called to signal
	     * that the report is ready to receive and process data and user events.
	     *
	     * @return A promise that resolves to the ReportSetup object
	     */
	    init(): Promise<ReportSetup>;
	    /**
	     * Signals that the custom report is ready. A configuration must be provided
	     * to tell the framework about the requirements of the report (most importantly which data it needs).
	     * The provided configuration acts as an interface between the report code
	     * and the report framework.
	     *
	     * @param {ReportConfiguration} [configuration={}] Configuration object
	     */
	    ready(configuration?: ReportConfiguration): void;
	    /**
	     * Getter to receive the current state of the report setup.
	     * The object is only available if the report already called a successful init() {@link LxCustomReportLib.init}.
	     */
	    get currentSetup(): HostReportSetup;
	    /**
	     * In case the report has new requirements towards the report framework it can
	     * update the configuration that was initially passed to {@link LxCustomReportLib.ready}.
	     *
	     * @param configuration
	     */
	    updateConfiguration(configuration: ReportConfiguration): void;
	    /**
	     * A static tableConfig should be returned via {@link ReportConfiguration.tableConfigCallback},
	     * but if the tableConfig is dynamic, this function can be used to update it at any time.
	     *
	     * Hint: if the provided attribute is a string field name, which is not present in the data model, this
	     * field would be ignored, and not shown as a table column.
	     *
	     * @param tableConfig
	     */
	    updateTableConfig(tableConfig: ReportTableConfig): void;
	    /**
	     * Execute a custom GraphQL query to the LeanIX GraphQL API.
	     *
	     * @param query GraphQL query
	     * @param variables GraphQL variables
	     * @return A promise that resolves to the resulting data
	     * @example
	     * ```js
	     * lx.executeGraphQL(`{
	     *  allFactSheets(factSheetType: ITComponent) {
	     *    edges {
	     *      node {
	     *        id
	     *        name
	     *        type
	     *        description
	     *      }
	     *    }
	     *  }
	     * }`)
	     * ```
	     */
	    executeGraphQL(query: string, variables?: string, trackingKey?: string): Promise<any>;
	    /**
	     * Get projections from the impact service.
	     *
	     * @param attributes Fact Sheet attributes that the projection items should include.
	     * @param filters Filter definition for the projection items
	     * @param pointsOfView Amount of different point of views that the projection should include.
	     *
	     * @beta
	     */
	    getProjections(attributes: ProjectionAttribute[], filters: ProjectionFilter[], pointsOfView: PointOfViewInput[]): Promise<ProjectionsResponse>;
	    /**
	     * Get all Fact Sheets from the GraphQL endpoint.
	     *
	     * @param factSheetType Fact Sheet type that needs to match.
	     * @param attributes Fact Sheet attributes that the response should include.
	     * @param facetSelection Filter definition for the Fact Sheets, if Composite Filters are defined, they are used instead of the normal Facet Filters.
	     * @param pointsOfView A record of different point of views and their associated keys that the response should include and will return the Fact Sheets per each point of view key.
	     * @param options Optional options to further specify the Fact Sheets
	     *
	     * @beta
	     */
	    getAllFactSheets(factSheetType: string, attributes: AttributeDescription[], facetSelection: ReportFacetsSelection, pointsOfView: Record<string, GraphQLPointOfViewInput>, options?: GraphQLOptions): Promise<ReportAllFactSheetsResponse>;
	    /**
	     * Get a list of measurements from the metrics service.
	     *
	     * @param nameOnly Set this to true to receive only the measurement names
	     * @return A promise that resolves to an array of measurements
	     *
	     * @beta
	     */
	    getMetricsMeasurements(nameOnly?: boolean): Promise<MetricsMeasurement[]>;
	    /**
	     * Get raw data for a metrics time series.
	     *
	     * @param query A metrics service query
	     * @return A promise that resolves to the raw series data
	     *
	     * @beta
	     */
	    getMetricsRawSeries(query: string): Promise<number[][]>;
	    /**
	     * Allows making XHR requests through the parent's origin.
	     *
	     * @param method The HTTP method for the request. GET, PUT, and POST requests are permitted.
	     *               For POST and PUT requests, not every endpoint is allowed.
	     * @param path Relative URL for the request.
	     * @param body Optional body for POST and PUT requests. Defaults to an empty object.
	     * @param responseType The expected type of the response. Can be 'text' or 'blob'. Defaults to 'text'.
	     * @param extendedHandling Optional boolean to add a custom header for extended request handling.
	     *                         If true, adds 'x-gateway-handle-request: EXTENDED' header. Defaults to false.
	     * @return A promise that resolves to the returned data.
	     */
	    executeParentOriginXHR(method: 'GET' | 'POST' | 'PUT', path: string, body?: any, responseType?: 'text' | 'blob', extendedHandling?: boolean): Promise<any>;
	    /**
	     * Get the current filter result.
	     *
	     * @return Current filter result
	     */
	    getFilterResult(): any[];
	    /**
	     * Show a dialog to the user to select one or more Fact Sheets.
	     *
	     * @param config Configures the Fact Sheet selection.
	     * @return A promise that resolves to the selected Fact Sheet(s)
	     *  or to `false` if the user canceled the selection
	     */
	    requestFactSheetSelection(config: FactSheetSelectionConfig): Promise<false | any | any[]>;
	    /**
	     * Show a customisable configuration dialog to the user, in which the user can adjust report settings.
	     *
	     * @param fields An object containing the form fields to be displayed in this dialog.
	     * @param values An object with the same keys as __fields__ containing the initial values of those fields.
	     * @return A promise that resolves to the configuration confirmed by the user or to `false` if the user canceled the configuration
	     * @example
	     * ```js
	     * const fields = {
	     *   level: {
	     *     type: 'SingleSelect',
	     *     label: 'Level to be displayed',
	     *     options: [
	     *       { value: '1', label: 'First level' },
	     *       { value: '2', label: 'Both levels' }
	     *     ]
	     *   },
	     *   hideEmpty: {
	     *    type: 'Checkbox',
	     *    label: 'Hide empty elements'
	     *   }
	     * };
	     * const initialValues = {
	     *   level: '2',
	     *   hideEmpty: false
	     * };
	     *
	     * lx.openFormModal(fields, initialValues).then((values) => {
	     *   if (values) {
	     *     console.log('Selection:', values.level, values.hideEmpty);
	     *   } else {
	     *     console.log('Selection cancelled');
	     *   }
	     * });
	     * ```
	     */
	    openFormModal(fields: FormModalFields, values: FormModalValues, update?: (form: FormModal) => FormModal): Promise<FormModalValues | false>;
	    /**
	     * Show a customisable configuration dialog to the user, in which the user can adjust report settings.
	     *
	     * @param formModal An object {@link FormModal} containing the form fields, values, optional messages and optional valid flag.
	     * @param update Callback function called on form update.
	     * @return A promise that resolves to the configuration confirmed by the user or to `false` if the user canceled the configuration
	     * @example
	     * ```js
	     * const fields = {
	     *   level: {
	     *     type: 'SingleSelect',
	     *     label: 'Level to be displayed',
	     *     options: [
	     *       { value: '1', label: 'First level' },
	     *       { value: '2', label: 'Both levels' }
	     *     ]
	     *   },
	     *   hideEmpty: {
	     *    type: 'Checkbox',
	     *    label: 'Hide empty elements'
	     *   }
	     * };
	     * const values = {
	     *   level: '2',
	     *   hideEmpty: false
	     * };
	     *
	     * const messages = {
	     *  level: {type: 'error', message:'example message'}
	     * }
	     *
	     * const update = (formModal: lxr.FormModal): lxr.FormModal => {return createFormModal()}
	     *
	     * lx.openFormModal({fields, values, messages, valid: true}, updated).then((values) => {
	     *   if (values) {
	     *     console.log('Selection:', values.level, values.hideEmpty);
	     *   } else {
	     *     console.log('Selection cancelled');
	     *   }
	     * });
	     * ```
	     */
	    openFormModal(formModal: FormModal, update?: (form: FormModal) => FormModal): Promise<FormModalValues | false>;
	    private doOpenFormModal;
	    /**
	     * Shows an overlaying sidepane with the provided elements.
	     *
	     * @beta
	     */
	    openSidePane(sidePaneElements: SidePaneElements, update?: (factSheetUpdate: FactSheetUpdate) => void, onClick?: (sidepaneClick: SidePaneClick) => void): void;
	    /**
	     * This method allows you to open any link in a new browser tab. Only Chrome and Safari
	     * allows you to open a new tab out of an iframe. Since reports run inside an iframe,
	     * they are not allowed to open links in other browsers.
	     * Therefore, the framework allows you to request to open a link.
	     * This will show a popup box outside the iframe containing the link.
	     * The user can click on it in order to open the link in a new tab.
	     *
	     * It is not possible to directly open the link outside the iframe,
	     * since some browsers (e.g. Firefox) show a popup warning
	     * whenever a link is opened via a message coming from an iframe.
	     *
	     * @param url Link-URL
	     * @param @deprecated _target (target is ignored due to new popup behavior)
	     * @example
	     * ```js
	     * lx.openLink(this.baseUrl + '/factsheet/Application/28fe4aa2-6e46-41a1-a131-72afb3acf256');
	     * // The baseUrl can be found in the setup returned by lx.init() like this:
	     * // lx.init().then(setup => { this.baseUrl = setup.settings.baseUrl });
	     * ```
	     */
	    openLink(url: string, _target?: string): void;
	    /**
	     * Navigate to a route within the LeanIX single-page app.
	     *
	     * @param url Relative URL within LeanIX to navigate to
	     */
	    openRouterLink(url: string): void;
	    /**
	     * Navigate to inventory using provided filters
	     *
	     * @param filters Specified filters will be applied to inventory
	     */
	    navigateToInventory(filters: NavigateToInventoryFilters): void;
	    /**
	     * In case the report has some sort of internal state it should be published
	     * to the framework. The state will be persisted when the user saves a certain
	     * report configuration. Once that report configuration is restored the framework
	     * will pass the saved state to the report on initialisation
	     * ({@link LxCustomReportLib.init} and {@link ReportSetup.savedState})
	     *
	     * @param state Custom report state
	     */
	    publishState(state: any): void;
	    /**
	     * This function opens a "new" instance of the report in a separate tab.
	     * The state and facet filter parameters can be used as initial values for the new opened instance of the report.
	     *
	     * @param state Custom report state
	     * @param facetSelection Facet filter selection ({@link UISelection.facets})
	     * @param name Preset name of the new report opened in new tab. If not set, falls back to default name.
	     *
	     * @beta
	     */
	    openReportInNewTab(state: any, facetSelection: ContextFacetsSelectionState[], name?: string): void;
	    /**
	     * Show a spinner on top of the report. Call {@link LxCustomReportLib.hideSpinner} to hide it again.
	     */
	    showSpinner(): void;
	    /**
	     * This method allows reports to check on users' workspace permissions.
	     * Therefore, reports can enable features according to given workspace permissions.
	     * See: [Authorization Model]{@link https://docs-eam.leanix.net/docs/authorization-model}
	     * @param permissions Shiro permissions string array to check (example: `['BOOKMARKS:CREATE:VISUALIZER', 'BOOKMARKS:CREATE:REPORTS']` creation of diagram bookmarks)
	     * @returns Promise of all requested permissions as key-value pair of the requested user permissions.
	     */
	    hasPermission(permissions: string[]): Promise<{
	        [permissionKey: string]: boolean;
	    }>;
	    /**
	     * Hide the spinner that was previously shown via {@link LxCustomReportLib.showSpinner}.
	     */
	    hideSpinner(): void;
	    /**
	     * @deprecated. UI Elements are created on {@link ReportConfiguration.ui}.
	     *
	     * Display a button to toggle edit mode. Call {@link LxCustomReportLib.hideEditToggle} to hide it again.
	     * {@link ReportConfiguration.allowEditing} and {@link ReportConfiguration.toggleEditingCallback} need to be set
	     * to enable edit mode.
	     */
	    showEditToggle(): void;
	    /**
	     * @deprecated. UI Elements are created or removed on {@link ReportConfiguration.ui}.
	     *
	     * Hide the button shown via {@link LxCustomReportLib.showEditToggle}.
	     */
	    hideEditToggle(): void;
	    /**
	     * Send list of Fact Sheets that could not be displayed in the report due to missing data.
	     * A warning will be shown the user to inform them of this.
	     *
	     * @param excludedFactSheets List of excluded Fact Sheets
	     */
	    sendExcludedFactSheets(excludedFactSheets: any[]): void;
	    /**
	     * Display a custom legend for a given number of items. If a legend from a view is currently
	     * displayed, the calls to this function are ignored.
	     *
	     * @param items Legend items to be displayed
	     * @exampleHide the spinner that was previously shown via
	     * ```js
	     * lx.showLegend([
	     *   { label: 'foo', bgColor: '#ff0000' },
	     *   { label: 'bar', bgColor: '#0000ff' }
	     * ])
	     * ```
	     */
	    showLegend(items: LegendItem[]): void;
	    /**
	     * Show toastr of different types, with a custom message and a optional title.
	     *
	     * @param {ToastrType} type toastr type
	     * @param {string} message message content
	     * @param {string} [title] optional title
	     * @example
	     * ```js
	     * lx.showToastr('error', 'Something went wrong');
	     * lx.showToastr('warning', 'This is a warning', 'Attention');
	     * ```
	     */
	    showToastr(type: ToastrType, message: string, title?: string): void;
	    /**
	     * Track report framework events with amplitude tracking.
	     *
	     * @param {ReportEvent} event event type and content
	     * @example
	     * ```js
	     * lx.trackReportEvent(
	     *  {
	     *     type: 'DataChange'
	     *     reportType: 'net.leanix.matrix'
	     *     baseFactSheetType: 'Application'
	     *     view: 'lifecycle'
	     *     cluster: ['relApplicationToBusinessCapability']
	     *     drilldown: ['relToChild']
	     *  }
	     * );
	     * ```
	     */
	    trackReportEvent(event: ReportEvent): void;
	    /**
	     * Returns the translation of a custom translation key according to the user's current language.
	     * If the translation key can be resolved to a translated string interpolation will be applied.
	     * If the translation key resolves to an object the object will be returned.
	     *
	     * @param key Translation key
	     * @param interpolationData Interpolation data
	     * @return Translation string or object
	     * @example
	     * ```js
	     * // For the custom translation json
	     * {
	     *   "header": {
	     *     "title": "The title",
	     *     "subtitle": "Subtitle",
	     *     "description": "Hello {{name}}"
	     *   }
	     * }
	     *
	     * lx.translateCustomKey('header.title') // => 'The title'
	     * lx.translateCustomKey('header')       // => { "title": "The title", "subtitle": "Subtitle", "description": "Hello {{name}}" }
	     * lx.translateCustomKey('header.description', { name: 'John' })  // => 'Hello John'
	     * ```
	     */
	    translateCustomKey(key: string, interpolationData?: Record<string, string | number>): string | any;
	    /**
	     * Returns the translation of a Fact Sheet type in singular or plural form.
	     * If multiplicity is not provided the singular version will be returned.
	     *
	     * @param fsType Fact Sheet type
	     * @param grammaticalNumber Grammatical number, i.e., 'singular' or 'plural'. Defaults to 'singular'.
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateFactSheetType('BusinessCapability')            // => 'Business Capability'
	     * lx.translateFactSheetType('BusinessCapability', 'plural')  // => 'Business Capabilities'
	     * ```
	     */
	    translateFactSheetType(fsType: string, grammaticalNumber?: 'singular' | 'plural'): string;
	    /**
	     * Returns the translation of a field on a Fact Sheet.
	     * In case the field is not present in the translation model, the fieldName would be returned.
	     *
	     * @param fsType Fact Sheet type
	     * @param fieldName Name of the Fact Sheet field
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateField('Application', 'release') // => 'Release'
	     * ```
	     */
	    translateField(fsType: string, fieldName: string): string;
	    /**
	     * Returns the translation of a field value for fields with predefined set of values (e.g. Single Select).
	     * In case the field value is not present in the translation model, the value would be returned.
	     *
	     * @param fsType Fact Sheet type
	     * @param fieldName Name of the Fact Sheet field
	     * @param value Value of this field
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateFieldValue('Application', 'functionalSuitability', 'appropriate')  // => 'Appropriate'
	     * ```
	     */
	    translateFieldValue(fsType: string, fieldName: string, value: string): string;
	    /**
	     * Returns the translation of the items a Fact Sheet relation links to.
	     * In case the relation is not present in the translation model, the relationName would be returned.
	     *
	     * @param relationName Name of the relation
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateRelation('relDataObjectToApplication')  // => 'Applications'
	     * lx.translateRelation('relToChild')                  // => 'Children'
	     * ```
	     */
	    translateRelation(relationName: string): string;
	    /**
	     * Returns the translation of a field present in a relation.
	     * In case the relation is not present in the translation model, the fieldName would be returned.
	     *
	     * @param relationName Name of the relation
	     * @param fieldName Field of the relation
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateRelationField('relDataObjectToApplication', 'usage')  // => 'Usage'
	     * lx.translateRelationField('relApplicationToBusinessCapability', 'functionalSuitability')  // => 'Functional Fit'
	     * ```
	     */
	    translateRelationField(relationName: string, fieldName: string): string;
	    /**
	     * Returns the translation of a field value for fields with predefined set of values (e.g. Single Select)
	     * present in a relation. In case the relation, fieldName or fieldValue is not present in the translation model, the fieldValue would be returned.
	     *
	     * @param relationName Name of the relation
	     * @param fieldName Field of the relation
	     * @param fieldValue Value of this field
	     * @return Translation
	     * @example
	     * ```js
	     * lx.translateRelationFieldValue('relApplicationToBusinessCapability', 'functionalSuitability', 'appropriate')  // => 'Appropriate'
	     * ```
	     */
	    translateRelationFieldValue(relationName: string, fieldName: string, fieldValue: string): string;
	    /**
	     * Check if a given Feature is enabled for the current Workspace.
	     *
	     * @param featureId Feature identifier
	     * @return Boolean expressing if the feature is enabled.
	     */
	    isFeatureEnabled(featureId: string): Promise<boolean>;
	    /**
	     * Returns a formatted currency number according to the users currency settings.
	     *
	     * @param value Value to be formatted
	     * @param minimumFractionDigits Minimum number of digits to use for the fraction
	     * @param compact Defines whether to show compact display
	     * @param locale Defines locale info 'de-DE', 'en-EN'
	     * @param maximumFractionDigits Maximum number of digits to use for the fraction. When specified,
	     *                              restricts the number of decimal places shown (useful for rounding).
	     * @return Currency string
	     * @example
	     * ```js
	     * lx.formatCurrency(123.50, 2) => '€123.50'
	     * lx.formatCurrency(12333.50, 0, true) => '€12K'
	     * lx.formatCurrencyWithoutCode(10255, 0, true, undefined, 1) => '€10.3K'
	     * lx.formatCurrency(1288893.50, 2, true, 'de-DE') => '1,29 Mio. €'
	     * ```
	     */
	    formatCurrency(value: number, minimumFractionDigits?: number, compact?: boolean, locale?: string, maximumFractionDigits?: number): string;
	    /**
	     * Returns the configured or default meta data for a field at a Fact Sheet.
	     *
	     * @param fsType Fact Sheet type
	     * @param fieldName Name of a Fact Sheet field or relation
	     * @return Meta data
	     * @example
	     * ```js
	     * lx.getFactSheetFieldMetaData('Application', 'functionalSuitability')
	     * // Returns:
	     * // {
	     * //   values: {
	     * //     perfect: {
	     * //       bgColor: '#fff',
	     * //       color: '#000'
	     * //     }
	     * //     ...
	     * //   }
	     * // }
	     * // Getting the actual background color for a field value:
	     * lx.getFactSheetFieldMetaData('Application', 'functionalSuitability').values['perfect'].bgColor
	     * ```
	     */
	    getFactSheetFieldMetaData(fsType: string, fieldName: string): FieldViewMetaData | undefined;
	    /**
	     * Returns the configured or default meta data for a field of a Fact Sheet relation.
	     *
	     * @param fsType Fact Sheet type
	     * @param relationName Name of the directed relation
	     * @param fieldName Name of a field on the relation
	     * @return Meta data
	     * @example
	     * ```js
	     * lx.getFactSheetRelationFieldMetaData('Application', 'relApplicationToITComponent', 'technicalSuitability')
	     * // Returns:
	     * // {
	     * //   values: {
	     * //     fullyAppropriate: {
	     * //       bgColor: '#fff',
	     * //       color: '#000'
	     * //     }
	     * //   ...
	     * //   }
	     * // }
	     *
	     * // Getting the actual background color for a field value:
	     * lx.getFactSheetRelationFieldMetaData(
	     *  'Application',
	     *  'relApplicationToITComponent',
	     *  'technicalSuitability'
	     * ).values['perfect'].bgColor
	     * ```
	     */
	    getFactSheetRelationFieldMetaData(fsType: string, relationName: string, fieldName: string): FieldViewMetaData;
	    private setupPerformanceObserver;
	    private createReportRequirements;
	    private mountCallbacks;
	    private mountUISelectionCallback;
	    private mountUISelectionUpdateCallback;
	    private mountUIElementsButtonClickCallback;
	    private mountUIButtonCallback;
	    private mountFacetsCallbacks;
	    private mountFacetsResultCallback;
	    private validateConfig;
	    private mountSetupCallback;
	    private mountCustomDropdownSelectionCallbacks;
	    private mountExportDataCallback;
	    private mountTableConfigCallback;
	    private mountFormModalUpdate;
	    private mountSidepaneFactSheetUpdate;
	    private mountSidepaneClick;
	    private mountSidepaneClose;
	    private mountCallback;
	    private getLocationQuery;
	    private createReportExportData;
	    private getCurrentStyles;
	    private encodeAllImages;
	    private encodeImage;
	    private sanitizeDimension;
	    private encodeSvgImage;
	    private translateHtmlTags;
	    private replaceInterpolations;
	    private mountDomEventPublishing;
	    private mountErrorEventPublishing;
	    private waitForElement;
	}
	export const lxCustomReportLib: LxCustomReportLib;
	export const lx: LxCustomReportLib;
	export const lxr: {};
	export {};

	export class DataModelHelpers {
	    getRelationDefinition(enrichedDataModel: EnrichedDataModel, directionalRelation: string): RelationDataModel | null;
	    isConstrainingRelation(enrichedDataModel: EnrichedDataModel, relationName: string): boolean;
	}

	export type PaperOrientation = 'portrait' | 'landscape';
	export interface BaseExportData {
	    name: string;
	    content: string;
	    styles?: string;
	}
	export interface SvgExportData extends BaseExportData {
	    inputType: 'SVG';
	    outputType: 'SVG';
	}
	export interface RasterImageExportData extends BaseExportData {
	    inputType: 'SVG' | 'HTML';
	    outputType: 'JPEG' | 'PNG';
	}
	export interface PdfExportData extends BaseExportData {
	    inputType: 'SVG' | 'HTML';
	    outputType: 'PDF';
	    fitHorizontally?: boolean;
	    fitVertically?: boolean;
	    /** @default 'A4' */
	    format?: PaperFormat;
	    /** @default 'portrait' */
	    orientation?: PaperOrientation;
	    /** @default { top: 0, right: 0, bottom: 0, left: 0 } */
	    margin?: PageMargin;
	    footer?: string;
	    header?: string;
	}
	export type PaperFormat = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'Letter';
	export interface PageMargin {
	    /** @default '0' */
	    top?: number;
	    /** @default '0' */
	    right?: number;
	    /** @default '0' */
	    bottom?: number;
	    /** @default '0' */
	    left?: number;
	}
	export type ImageExportData = RasterImageExportData | SvgExportData;
	export type ExportData = PdfExportData | ImageExportData;
	export interface ExportInitialData {
	    title?: string;
	    data: string;
	    styles: string;
	    fileNameSuffix?: string;
	    inputType: ExportData['inputType'];
	    paperSize: {
	        format: 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'letter' | 'autofit';
	    };
	    orientation: PaperOrientation | null;
	    fitHorizontally: boolean;
	    fitVertically: boolean;
	    viewLegendData?: {
	        html: string;
	        styles: string;
	    };
	    usage?: 'thumbnail' | 'export';
	}
	export interface ReportUser {
	    id: string;
	    firstName: string;
	    lastName: string;
	    email: string;
	    userName: string;
	}
	export type ReportFactSheetPermissibleAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'INLINE_EDIT';
	export interface ReportFactSheetFieldPermissions {
	    [fieldName: string]: ReportFactSheetPermissibleAction[];
	}
	export interface ReportFactSheetRelationPermission {
	    self: ReportFactSheetPermissibleAction[];
	}
	export interface ReportFactSheetRelationPermissions {
	    [relationName: string]: ReportFactSheetRelationPermission;
	}
	export interface ReportFactSheetPermission {
	    self: ReportFactSheetPermissibleAction[];
	    fields: ReportFactSheetFieldPermissions;
	    relations: ReportFactSheetRelationPermissions;
	}
	export interface ReportFactSheetPermissions {
	    [factSheetName: string]: ReportFactSheetPermission;
	}
	export type Language = 'en' | 'de' | 'es' | 'fr' | 'pt' | 'ja';
	export interface ReportSetupSettings {
	    baseUrl: string;
	    environment: Environment;
	    viewModel: ViewModel;
	    dataModel: EnrichedDataModel;
	    tagModel: TagModel;
	    factSheetPermissions: ReportFactSheetPermissions;
	    translations: ReportSetupTranslations;
	    currency: ReportSetupCurrency;
	    currentUser: ReportUser;
	    language: Language;
	    workspace: Workspace;
	    page: PageContext;
	    mtmWorkspaceSettings: MtmWorkspaceSettings;
	}
	export interface ReportSetupConfig {
	    factSheetType?: string;
	    [others: string]: any;
	}
	export interface ReportSetupTranslations {
	    factSheetTypes: {
	        [key: string]: string;
	    };
	    relations: {
	        [relationName: string]: RelationTranslation;
	    };
	    fields: {
	        [factSheetType: string]: FactSheetFieldsTranslation;
	    };
	    /**
	     * The reports custom translation for the current language.
	     */
	    custom: {
	        label: string;
	        [customKeys: string]: any;
	    };
	}
	export interface FactSheetFieldsTranslation {
	    [fieldName: string]: FieldTranslation;
	}
	export interface FieldTranslation {
	    label: string | null;
	    values: Record<string, FieldValueTranslation>;
	}
	export interface FieldValueTranslation {
	    label: string | null;
	}
	export interface RelationTranslation {
	    label: string | null;
	    fields: Record<string, FieldTranslation>;
	}
	export interface ReportSetupCurrency {
	    code: string;
	    symbol: string;
	}
	export interface Workspace {
	    id: string;
	    name: string;
	    /** @internal */
	    type: MtmWorkspaceType;
	    /** @internal */
	    status: MtmWorkspaceStatus;
	    /** @internal */
	    contract: {
	        /** @internal */
	        type: MtmContractType;
	    };
	}
	/** @internal */
	export type MtmWorkspaceStatus = 'ACTIVE' | 'BLOCKED';
	/** @internal */
	export type MtmWorkspaceType = 'LIVE' | 'DEMO' | 'SANDBOX';
	/** @internal */
	export type MtmContractType = 'REGULAR' | 'TRIAL';
	export interface FiscalYears {
	    default?: {
	        /**
	         * Month starting from 0 = Jan, 1 = Feb, ...
	         */
	        month: number;
	        /**
	         * the day-of-the-month, starting from 1
	         */
	        date: number;
	    };
	}
	/** Workspace settings that are stored in MTM */
	export interface MtmWorkspaceSettings {
	    fiscalYears?: FiscalYears;
	}
	export interface BookmarkFilter {
	    /**
	     *  The FactSheet type can be get and set with:
	     *  - FacetsService.getSelectedFactSheetTypeFromFilters(facetFilter)
	     *  - FacetsService.updateFactSheetTypeInFilters(facetFilter, newFactSheetType)
	     */
	    fsType?: string;
	    facetFilter: FacetFilter[];
	    fullTextSearchTerm?: string;
	    factSheetIds?: string[];
	    sorting?: Sorting[];
	}
	export interface ReportingBookmarkState<T = any> {
	    filters: {
	        [key: string]: BookmarkFilter;
	    };
	    views: {
	        [context: string]: {
	            activeViewKey?: string;
	            factSheetType?: string;
	            viewOption?: ViewOption;
	        };
	    };
	    customState?: T | null;
	    customDropdownSelections?: ReportDropdownSelections;
	    tableConfig?: TableConfig;
	    tableSortings?: Sorting[];
	    /**
	     * @deprecated
	     */
	    timeline?: TimelineBookmarkSelection;
	}
	export interface ReportSetup {
	    reportId: string;
	    bookmarkName: string;
	    config: ReportSetupConfig;
	    settings: ReportSetupSettings;
	    savedState?: ReportingBookmarkState;
	}
	export interface FacetFilter {
	    facetKey: string;
	    keys: string[];
	    operator?: FacetKeyOperator;
	    dateFilter?: DateFilter;
	    subscriptionFilter?: SubscriptionFilterInput;
	    excludeTransitiveRelations?: boolean;
	    subFilter?: {
	        facetFilters: FacetFilter[];
	        fullTextSearch?: string;
	        ids?: string[];
	    };
	}
	export type DateFilterType = 'POINT' | 'TODAY' | 'END_OF_MONTH' | 'END_OF_YEAR' | 'RANGE' | 'RANGE_STARTS' | 'RANGE_ENDS' | 'TIMELINE';
	export interface DateFilter {
	    type: DateFilterType;
	    minDate?: string;
	    maxDate?: string;
	    from?: string;
	    to?: string;
	    useTimelineDates?: boolean;
	}
	/** Valid GraphQL FacetType; constants defined in facets.const.ts */
	export type BackendFacetType = 'SIMPLE' | 'TAG' | 'FACTSHEETTYPE' | 'FACTSHEETSUBTYPE' | 'RELATION' | 'LIFECYCLE' | 'SUBSCRIPTIONS' | 'EXTERNAL_ID' | 'HIERARCHY';
	/** Pseudo-FacetTypes implemented only in front-end; constants defined in facets.const.ts */
	export type FrontendFacetType = 'FACT_SHEET_ID' | 'FULLTEXTSEARCH' | 'SINGLE_SELECT' | 'UNKNOWN' | 'AGGREGATION';
	export type FacetType = BackendFacetType | FrontendFacetType;
	export enum FacetKeyOperator {
	    OR = "OR",
	    AND = "AND",
	    NOR = "NOR"
	}
	interface FacetListEntry {
	    /**
	     * Key that identifies this FacetListEntry.
	     */
	    key: string;
	    /**
	     * Name of the FacetListEntry
	     */
	    name: string;
	    /**
	     * Translated label of the FacetListEntry
	     */
	    label?: string;
	    /**
	     * How many search results can be expected if this
	     * facet list entry is selected.
	     */
	    count: number;
	    /**
	     * Is this FacetListEntry selected. Default: false.
	     */
	    selected?: boolean;
	}
	export interface FacetGroup {
	    /**
	     * Key of the facet.
	     * For facets of type TAG the facetKey contains the tag's UUID.
	     */
	    facetKey: string;
	    /**
	     * The logical operation that is set for this facet.
	     */
	    operator: FacetKeyOperator;
	    /**
	     * List of operators the backend supports for this facet.
	     */
	    possibleOperators?: string[];
	    /**
	     * The type of the facet results.
	     * Depending on the type of the results the facet is rendered differently.
	     * 'UNKNOWN' is set when the information from the BE is missing, for example
	     * when the Facet is generated on the fly (in the Bookmarks)
	     */
	    facetType: FacetType;
	    /**
	     * Might contain additional information depending on the 'facetType'.
	     * For facetType FACTSHEETSUBTYPE: contains the selected Fact Sheet type.
	     * For facetType TAG: contains the facet key.
	     */
	    facetSubType?: string;
	    /**
	     * List of available entries.
	     */
	    results: FacetListEntry[];
	    /**
	     * Subfilter applied to this facet.
	     */
	    subFilter?: FacetSubfilter;
	    /**
	     * Optional date filter
	     */
	    dateFilter?: DateFilter;
	    /**
	     * Optional subscription filter
	     */
	    subscriptionFilter?: SubscriptionFilter;
	    /**
	     * Total number of available results (including the ones from results)
	     */
	    total?: number;
	    /**
	     * Facet is open; default = true
	     */
	    open?: boolean;
	    isSelected?: boolean;
	    /**
	     * Facet is visible
	     */
	    visible?: boolean;
	    /**
	     * Facet is read-only
	     */
	    readOnly?: boolean;
	    /**
	     * Facet is read-only
	     */
	    initialValue?: FacetGroupSettingValue;
	}
	export interface FacetGroupSettingValue extends FacetFilter {
	    facetKey: string;
	    keys: string[];
	    operator?: FacetKeyOperator;
	    dateFilter?: DateFilter;
	    subscriptionFilter?: SubscriptionFilter;
	    facetType?: FacetType;
	}
	export interface SubscriptionFilter {
	    type: SubscriptionType;
	    role?: SubscriptionRole;
	}
	export interface SubscriptionRole {
	    id: string;
	    name: string;
	    description?: string;
	    comment?: string;
	    subscriptionType: SubscriptionType;
	    restrictToFactSheetTypes?: string[];
	}
	export type SubscriptionType = 'RESPONSIBLE' | 'OBSERVER' | 'ACCOUNTABLE';
	export interface FacetSubfilter {
	    facetGroups?: FacetGroup[];
	    facetFilters?: FacetFilter[];
	    fullTextSearch?: string;
	    ids?: string[];
	}
	export interface SubscriptionFilterInput {
	    type: SubscriptionType;
	    roleId?: string;
	}
	export enum CompositeOperator {
	    OR = "OR",
	    AND = "AND"
	}
	export interface CompositeFactSheetFilter {
	    group: CompositeGroupFilter;
	}
	export interface CompositeGroupFilter {
	    operator: CompositeOperator;
	    elements: SimpleCompositeFilter[];
	}
	export interface SimpleCompositeFilter {
	    filter: CompositeFilter;
	}
	export interface CompositeFilter {
	    operator: CompositeOperator;
	    elements: FacetFilter[];
	}
	export type SortingMode = 'BY_FIELD' | 'BY_LIFECYCLE_LAST_PHASE';
	export type SortingOrder = 'asc' | 'desc';
	export interface Sorting {
	    mode?: SortingMode;
	    key: string;
	    order: SortingOrder;
	}
	export interface TableConfig {
	    columns: TableColumn[];
	}
	export interface TableColumn {
	    factSheetType: string;
	    key: string;
	    /**
	     * Field type
	     */
	    type: DataModelFieldType;
	    virtualKey?: string;
	    /**
	     * Frontend attributes
	     * @type {string}
	     */
	    sort?: string;
	    required?: boolean;
	    editable?: boolean;
	    sortable?: boolean;
	    align?: TableColumnAlign;
	    resizable?: boolean;
	    movable?: boolean;
	    width?: number;
	    label?: string;
	    expanded?: boolean;
	    isRelationColumn?: boolean;
	    isCustomColumn?: boolean;
	}
	export type DataModelFieldType = 'DOUBLE' | 'INTEGER' | 'LIFECYCLE' | 'LOCATION' | 'MULTIPLE_SELECT' | 'SINGLE_SELECT' | 'STRING' | 'EXTERNAL_ID' | 'PROJECT_STATUS' | 'AGGREGATED' | 'READ_ACCESS_CONTROL_LIST' | 'WRITE_ACCESS_CONTROL_LIST' | 'RELATION' | 'TAGS' | 'SUBSCRIPTIONS' | 'DATE_TIME' | 'COMPLETION' | 'QUALITYSEALSTATUS';
	export type TableColumnAlign = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFY';
	export interface ReportDropdownSelections {
	    [dropdownId: string]: string;
	}
	/**
	 * Configures the reporting table for the report.
	 * It allows to specify the initial attributes
	 * that should be displayed in the table.
	 *
	 * Example:
	 * factSheetType: 'Application',
	 * attributes: ['release', 'alias'],
	 * relatedFactSheetTypes: \{
	 *    BusinessCapability: 'relApplicationToBusinessCapability',
	 *    UserGroup: 'relApplicationToUserGroup'
	 * \}
	 */
	export interface ReportTableConfig {
	    factSheetType: string;
	    attributes: ReportTableConfigAttribute[];
	    columns?: TableColumn[];
	    /**
	     * Maps Fact Sheet type to relation type in order to
	     * add them as subfilter in table view.
	     */
	    relatedFactSheetTypes?: {
	        [facetsConfigKey: string]: string;
	    };
	}
	/**
	 * Represents a Fact Sheet attribute to be displayed in a table. The attribute can be either the field name, as string, or a table column for more advanced fields.
	 */
	export type ReportTableConfigAttribute = string | ReportTableColumn;
	export interface ReportTableColumn {
	    key: string;
	    label?: string;
	    type: DataModelFieldType;
	    sortable?: boolean;
	    align?: TableColumnAlign;
	    /** A custom column is one that is provided by the report and does not correspond to an existing Fact Sheet attribute */
	    isCustomColumn?: boolean;
	    virtualKey?: string;
	}
	/**
	 * Represents one selectable entry.
	 *
	 * @deprecated Use `DropdownEntry` in the UI configuration instead.
	 */
	export interface CustomDropdownEntry {
	    id: string;
	    name: string;
	    /**
	     * This callback is invoked once the user selects the corresponding entry.
	     */
	    callback?: (currentEntry: CustomDropdownEntry) => void;
	}
	/**
	 * Represents a custom dropdown menu with several entries.
	 *
	 * @deprecated Use {@link UIDropdown} in the UI configuration instead.
	 */
	export interface CustomDropdown {
	    id: string;
	    name: string;
	    entries: CustomDropdownEntry[];
	    position?: 'left' | 'right';
	    initialSelectionEntryId?: string;
	}
	/**
	 * Describes the available configuration options for a report.
	 */
	export interface ReportConfiguration {
	    /**
	     * Multiple facets configurations ({@link ReportFacetsConfig}) can be provided
	     * in order to allow the user to filter different aspects of your report.
	     */
	    facets?: ReportFacetsConfig[];
	    menuActions?: {
	        /**
	         * Does the report provide configuration possibilities.
	         * If true: There will be a configuration action shown to the user,
	         *      that triggers __configureCallback__.
	         *
	         * @default false.
	         */
	        showConfigure?: boolean;
	        /**
	         * This callback is invoked whenever the user wants to see / change
	         * the reports configuration.
	         */
	        configureCallback?: () => void;
	        /**
	         * Define custom dropdowns that are shown to the user and allow him or her
	         * to select different options that influence how the report behaves or
	         * presents data.
	         *
	         * @deprecated Use `elements` in the UI configuration instead.
	         */
	        customDropdowns?: CustomDropdown[];
	    };
	    /**
	     *
	     * This callback is invoked whenever the user changes the view of the report.
	     * It is also invoked, once the report view results are loaded during
	     * initialization.
	     *
	     * In order to define which views should be available to the user, you can
	     * specify a Fact Sheet type via {@link ReportConfiguration.reportViewFactSheetType}.
	     */
	    reportViewCallback?: (view: ViewResult) => void;
	    /**
	     * If defined the views that are applicable for this Fact Sheet type will be
	     * available for the user to be selected from a dropdown.
	     * Whenever the view is fetched from the backend the view data will be
	     * provided via {@link ReportConfiguration.reportViewCallback}.
	     */
	    reportViewFactSheetType?: string;
	    /**
	     * Additional options that can be provided for the view calculation.
	     */
	    reportViewOption?: ViewOption;
	    /**
	     * Defines whether the reporting framework should allow the user to switch
	     * into a table view that shows the data of the report.
	     * If not specified the default value is `true`, so the table view will be
	     * allowed if not explicitly disabled.
	     *
	     * Hint: In order to configure the table (e.g. initially visible columns)
	     * for the report use {@link ReportConfiguration.tableConfigCallback}
	     */
	    allowTableView?: boolean;
	    /**
	     * This callback is invoked one time after the report has been initialised to
	     * get an initial, static configuration for the table. If the configuration is dynamic or
	     * computed asynchronously, {@link LxCustomReportLib.ready} needs to be used instead.
	     */
	    tableConfigCallback?: () => ReportTableConfig;
	    /**
	     * @deprecated. Use UIButton to show the edit toggle.
	     *
	     * Specifiy whether the user shall be able to edit the report.
	     * If the user toggles the editing mode the reporting framework
	     * calls {@link ReportConfiguration.toggleEditingCallback} to inform
	     * you about enabled or disabled edit mode.
	     */
	    allowEditing?: boolean;
	    /**
	     * @deprecated. Use UIButton click callback to invoke an action for enable/disable.
	     *
	     * This callback is invoked whenever the user enables or disables editing.
	     * The action to enable or disable editing is only visible when {@link ReportConfiguration.allowEditing}
	     * is set to true.
	     */
	    toggleEditingCallback?: (editingEnabled: boolean) => void;
	    /**
	     * The export options allow to influence the PDF or image export of a report.
	     */
	    export?: ReportExportConfiguration;
	    /**
	     * `ui` defines the configuration of the UI elements to be displayed around the report.
	     *
	     * @beta
	     */
	    ui?: UIConfiguration;
	    /**
	     * Sentry error tracking configuration. If not provided, Sentry will not be initialized.
	     */
	    sentryConfig?: SentryConfig;
	}
	export interface ReportExportConfiguration {
	    /**
	     * Flag to disable export for the given report.
	     * This option hides the export capabilities within the report container.
	     * @default false
	     */
	    disabled?: boolean;
	    /**
	     * CSS selector which specifies the DOM element whose contents should be
	     * extracted for export to PDF or image.
	     */
	    exportElementSelector?: string;
	    /**
	     * The type of content that is extracted from the DOM
	     * to be exported. Default is HTML.
	     *
	     * Specify SVG if your report uses SVG elements for visualization.
	     */
	    inputType?: 'HTML' | 'SVG';
	    /**
	     * autoScale has been renamed to {@link fitHorizontally} and will be
	     * removed in the near future.
	     *
	     * @default false
	     * @deprecated
	     */
	    autoScale?: boolean;
	    /**
	     * fitHorizontally scales the content for PDF exports to fit it to the
	     * page width so that no content is cut off.
	     * It should not be enabled if the content is already responsive HTML.
	     *
	     * @default true
	     */
	    fitHorizontally?: boolean;
	    /**
	     * fitVertically scales the content for PDF exports to fit it to the
	     * page height so that the content fits on a single page.
	     *
	     * @default true
	     */
	    fitVertically?: boolean;
	    /**
	     * Paper format for PDF exports.
	     * @default 'a4'
	     */
	    format?: 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'letter' | 'autofit';
	    /**
	     * Paper orientation for PDF exports.
	     * @default 'portrait'
	     */
	    orientation?: 'portrait' | 'landscape';
	    /**
	     * Usage of the export.
	     * Determines if the export is triggered for thumbnail creation or from the user.
	     * @default thumbnail
	     */
	    usage?: 'thumbnail' | 'export';
	    /**
	     * This callback is invoked just before the report framework extracts the HTML
	     * from the report to export it as PDF or image. It allows to make adjustments
	     * to the HTML for exporting.
	     */
	    beforeExport?: (exportElement: HTMLElement, reportExportConfig: ReportExportConfiguration) => HTMLElement | Promise<HTMLElement>;
	}
	export interface UIMinimalConfiguration {
	    /**
	     * `timeline` defines the timeline UI element.
	     */
	    timeline?: UITimeline | null;
	    /**
	     * `elements` defines the configuration of each UI element.
	     *
	     */
	    elements?: UIElements;
	    /**
	     * `showCompositeFilters` flag to show composite filters in the report ui
	     *
	     * @beta
	     */
	    showCompositeFilters?: boolean;
	}
	export interface UIConfiguration extends UIMinimalConfiguration {
	    /**
	     * `update` provides a callback to react to changes from the UI elements.
	     *
	     * It's called when initializing the report's UI elements and whenever the user
	     * interacts with them.
	     *
	     * `selection` is an object that reflects the state of the current selection
	     * of the UI elements.
	     *
	     * `update` also allows modifying the ui configuration by returning the target configuration. Use `null` to
	     * destroy any visible elements. When using an `undefined` value for a specific element, the element remains
	     * untouched.
	     *
	     */
	    update: (selection: UISelection) => undefined | UIMinimalConfiguration | Promise<UIMinimalConfiguration | undefined>;
	}
	/**
	 * `SentryConfig` defines the configuration needed to initialize Sentry error tracking for a report.
	 */
	export interface SentryConfig {
	    dsn: string;
	    environment?: string;
	}
	/**
	 * `UIElements` defines the configuration needed to allow a report to show certain {@link UIElement} items in the Reports page.
	 */
	export interface UIElements {
	    /**
	     * `values` is the collection of values associated to the {@link UIElement} items.
	     */
	    values: UIElementValues;
	    /**
	     * `root` defines the root structure of the {@link UIElements}.
	     */
	    root: UIRoot;
	}
	/**
	 * `UIRoot` allows to define the root items structure with an optional `style` for basic templating.
	 */
	export interface UIRoot {
	    /**
	     * `items` define the collection of {@link UIElement} items to be used.
	     */
	    items: UIElement[];
	    /**
	     * `style` allows a certain limited template styling for the `items`.
	     */
	    style?: UIStyle;
	}
	/**
	 * `UIElementValues` defines a key-value collection of values that each {@link UIElement} has assigned.
	 * `UIElementValues` expects as a key the `id` property defined for a given {@link UIElement}. The type of value is
	 * dependent on the type of {@link UIElement} being used.
	 */
	export type UIElementValues = Record<string, unknown>;
	/**
	 * `UIElementType` is a identifier for each type of UI element that is used.
	 */
	export type UIElementType = 'container' | 'dropdown' | 'groupDropdown' | 'factSheetDropdown' | 'buttonGroup' | 'button' | 'impactSourcePicker' | 'layoutMode' | 'zoom' | 'hierarchyDepth' | 'suggestionDropdown';
	export interface UIBaseElement {
	    id: string;
	    type: UIElementType;
	}
	/**
	 * `UIElement` defines the different types of UI elements that are available to be defined in the Reports page.
	 */
	export type UIElement = UIContainer | UIDropdown | UIGroupDropdown | UIFactSheetDropdown | UIButtonGroup | UIButton | UIImpactSourcePicker | UILayoutMode | UIZoom | UIHierarchyDepth | UISuggestionDropdown;
	/**
	 * `UIContainer` allows to group elements in template groups.
	 */
	export interface UIContainer {
	    type: 'container';
	    /**
	     * `items` defines the items that belong to this container.
	     */
	    items: UIElement[];
	}
	/**
	 * `UILayoutMode` is a dropdown UI element.
	 *
	 * The dropdown presents a list of layout mode possible for a report.
	 * Reports define layout modes by adding them to the `entries` property of this element.
	 * @beta
	 */
	export interface UILayoutMode extends UIBaseElement {
	    type: 'layoutMode';
	    entries: LayoutModeEntry[];
	    label: string;
	}
	/**
	 * Object, used in the {@link UILayoutMode | UILayoutMode} to define layout mode entries.
	 * @beta
	 */
	export interface LayoutModeEntry {
	    key: string;
	    icon: string;
	    iconType?: 'regular' | 'solid';
	    label: string;
	    description: string;
	}
	/**
	 * `UIImpactSourcePicker` is a button UI element.
	 *
	 * On click, a modal is opened, which allows to select multiple Fact Sheets with associated impacts, to be used in the report.
	 * The associated `value` of the {@link UIImpactSourcePicker} is an object of type {@link UIImpactSourcePickerValue | ImpactSourcePickerValues}, describing an array of Fact Sheets with id and type or an object with filters used.
	 * If no entry is selected, omit the value entry in the {@link UIElementValues}.
	 * @beta
	 */
	export interface UIImpactSourcePicker extends UIBaseElement {
	    type: 'impactSourcePicker';
	}
	/**
	 * Object, describing value of {@link UIImpactSourcePicker | UIImpactSourcePicker}
	 * @beta
	 */
	export type UIImpactSourcePickerValue = UIImpactSourcePickerFilterValue | UIImpactSourcePickerFactSheet[];
	/**
	 * Object, describing filter value from impact source picker modal. The fact sheets array are the corresponding
	 * fact sheets of the filters defined, that are returned from Pathfinder.
	 * @beta
	 */
	export interface UIImpactSourcePickerFilterValue {
	    filter: UIImpactSourcePickerFilter;
	    factSheets?: UIImpactSourcePickerFactSheet[];
	}
	/**
	 * Object, describing facet filters and text search term
	 * @beta
	 */
	export interface UIImpactSourcePickerFilter {
	    facetFilters: FacetFilter[];
	    fullTextSearchTerm?: string;
	}
	/**
	 * Object, describing a selected impact containing Fact Sheet by its ID and Type {@link UIImpactSourcePickerValue | ImpactSourcePickerValues}
	 * @beta
	 */
	export interface UIImpactSourcePickerFactSheet {
	    id: string;
	    type: string;
	}
	/**
	 * `UIDropdown` is a dropdown UI element.
	 *
	 * The associated `value` of the {@link UIDropdown} is the `id` of the selected entry. If no entry
	 * is selected, use `undefined` or omit the value entry in the {@link UIElementValues}.
	 */
	export interface UIDropdown extends UIBaseElement {
	    type: 'dropdown';
	    /**
	     * `label` defines the dropdown label to be shown aside the dropdown element.
	     */
	    label: string;
	    /**
	     * `entries` define the possible options that the dropdown makes available.
	     */
	    entries: DropdownEntry[];
	    /**
	     * `disabled` passes down a boolean to disable the dropdown options.
	     */
	    disabled?: boolean;
	    /**
	     * `tooltip` defines the text a user sees on hovering a disabled dropdown element.
	     */
	    tooltip?: string;
	}
	/**
	 * `UIGroupDropdown` is a dropdown UI element, which allows to specify inner sections.
	 *
	 * The associated `value` of the {@link UIGroupDropdown} is the `id` of the selected entry. If no entry
	 * is selected, use `undefined` or omit the value entry in the {@link UIElementValues}.
	 */
	export interface UIGroupDropdown extends UIBaseElement {
	    type: 'groupDropdown';
	    /**
	     * `label` defines the group dropdown label to be shown aside the dropdown element.
	     */
	    label: string;
	    /**
	     * `sections` define the possible sections that the group dropdown makes available.
	     */
	    sections: GroupDropdownSection[];
	}
	/**
	 * `GroupDropdownSection` defines the properties of a section.
	 */
	export interface GroupDropdownSection {
	    /**
	     * `id` defines an identificator for the group dropdown's section.
	     */
	    id: string;
	    /**
	     * `label` defines the group dropdown section's label.
	     */
	    label: string;
	    /**
	     * `entries` define the possible entries that a group dropdown section makes available.
	     */
	    entries: DropdownEntry[];
	}
	/**
	 * `UISuggestionDropdown` is a dropdown UI element for multi-selection suggestions.
	 *
	 * Unlike {@link UIDropdown} which handles single selection, this allows users to
	 * select multiple suggestions from a predefined list.
	 *
	 * The associated `value` is an array of strings representing the IDs of selected entries.
	 * If no entries are selected, use an empty array `[]` or omit the value entry.
	 */
	export interface UISuggestionDropdown extends UIBaseElement {
	    type: 'suggestionDropdown';
	    label: string;
	    entries: DropdownEntry[];
	    disabled?: boolean;
	    tooltip?: string;
	}
	/**
	 * `DropdownFactSheetEntryLabel` defines the alternative structure needed for an UI dropdown entry to be used for {@link UIDropdown}.
	 *  It provides the necessayr information for a query to display a factsheet type and its name
	 */
	export interface DropdownFactSheetEntryLabel {
	    /**
	     * `factSheetType` is the current factSheetType, f.ex. 'Application'.
	     */
	    factSheetType: string;
	    /**
	     * `factSheetId` represents the unique ID of a factSheet.
	     */
	    factSheetId: string;
	    /**
	     * `factSheetDisplayName` shows the factSheetDisplayName, which is a string in the dropdown.
	     */
	    factSheetDisplayName: string;
	}
	/**
	 * `DropdownEntry` defines the structure needed for a UI dropdown entry to be used for {@link UIDropdown} or a section of a {@link UIGroupDropdown}.
	 */
	export interface DropdownEntry {
	    /**
	     * `activeLabel` is displayed in the dropdown's button, when the entry is selected.
	     * In case `activeLabel` is not defined, it fall backs to `label`.
	     */
	    activeLabel?: DropdownEntryLabel;
	    /**
	     * `label` defines the entry's label to be used in the options dropdown. It can contain different
	     * data types, depending on what information we would like to show in the dropdown
	     */
	    label: DropdownEntryLabel | DropdownFactSheetEntryLabel;
	    /**
	     * `id` declares an identificator for the dropdown entry.
	     */
	    id: string;
	    /**
	     * `hidden` represents an optional parameter to hide an entry in the dropdown. It will then not render at all.
	     */
	    hidden?: boolean;
	}
	/**
	 * `DropdownEntryLabel` is either a plain text attribute, a {@link DropdownEntryIconLabel}, or a {@link DropdownFactSheetEntryLabel}.
	 */
	export type DropdownEntryLabel = string | DropdownEntryIconLabel | DropdownFactSheetEntryLabel;
	/**
	 * `DropdownEntryIconLabel` defines an icon to be used as label for a dropdown entry.
	 */
	export interface DropdownEntryIconLabel {
	    icon: string;
	}
	/**
	 * `UIFactSheetDropdown` defines the configuration for a {@link UIElement}, which allows to search for Fact Sheets.
	 *
	 * The associated `value` of the {@link UIFactSheetDropdown} is the `id` of the selected Fact Sheet. If no Fact Sheet
	 * is selected, use `undefined` or omit the value entry in the {@link UIElementValues}.
	 */
	export interface UIFactSheetDropdown extends UIBaseElement {
	    type: 'factSheetDropdown';
	    /**
	     * `label` defines the dropdown's label.
	     */
	    label: string;
	    /**
	     * `facetFilters` allows to define a certain amount of filters to be used while searching for the Fact Sheets
	     * in the dropdown.
	     */
	    facetFilters: FacetFilter[];
	    /**
	     * `autoFocus` is an optional parameter that allows the user to fine-tune the behavior on initially
	     * creating the factSheetDropdown.
	     * If it is set to true, the dropdown opens with the selection of queried factsheets on rendering
	     * and is in focus.
	     */
	    autoFocus?: boolean;
	}
	/**
	 * `UIZoom` defines the configuration for a zoom {@link UIElement}, which allows setting a zoom level.
	 *
	 * The associated `value` of the `UIZoom` element is the selected zoom level. A `value` of `1` represents 100%,
	 * `0.5` means 50% and so on. The min value is `0.1`, the max value is `2`, and the value can be adjusted in steps
	 * of `0.1`.
	 */
	export interface UIZoom extends UIBaseElement {
	    type: 'zoom';
	}
	/**
	 * `UIHierarchyDepth` defines the configuration for {@link UIElement} that allows to choose a hierarchy depth level.
	 *
	 * The associated value of the {@link UIHierarchyDepth} control is the selected hierarchy depth level, starting from `1` up
	 * to the given `maxDepth`. Setting the `maxDepth` value to `0` is considered as a loading state, and therefore
	 * a spinner is shown.
	 */
	export interface UIHierarchyDepth extends UIBaseElement {
	    type: 'hierarchyDepth';
	    /**
	     * `label` defines the controls's label.
	     */
	    label: string;
	    /**
	     * `maxDepth` defines the highest hierarchy depth level that can be chosen.
	     */
	    maxDepth: number;
	}
	/**
	 * `UIButtonGroup` defines the configuration for a {@link UIElement} that displays a collection of interactive buttons.
	 *
	 * This element has no associated `value` in {@link UIElementValues}.
	 */
	export interface UIButtonGroup extends UIBaseElement {
	    type: 'buttonGroup';
	    /**
	     * `label` defines a label for the button group.
	     */
	    label?: string;
	    /**
	     * `buttons` define the collection of buttons to be displayed.
	     */
	    buttons: UIButton[];
	}
	/**
	 * `UIButton` defines the configuration for a button {@link UIElement}.
	 *
	 * This element has no associated `value` in {@link UIElementValues}.
	 */
	export interface UIButton extends UIBaseElement {
	    type: 'button';
	    /**
	     * `label` defines the button's label.
	     * @deprecated string type is deprecated. Use UIButtonLabel instead.
	     */
	    label: string | UIButtonLabel;
	    /**
	     * `disabled` defines, if the button is currently disabled.
	     * @defaultValue false
	     */
	    disabled?: boolean;
	    /**
	     * `selected` defines, if the button is currently selected or not.
	     * @defaultValue false
	     */
	    selected?: boolean;
	    /**
	     * `tooltip` defines the text that will be displayed in the tooltip.
	     */
	    tooltip?: string;
	    /**
	     * `click` allows to react to click events for an specific button.
	     */
	    click?: () => void;
	}
	/**
	 * `UIStyle` allows a certain amount of template styling for the collection of `UIElements`.
	 */
	export interface UIStyle {
	    /**
	     * `justifyContent` specifies element justification to the `start` (items at the left), `end` (items at the right) or `space-between` (items at the sides).
	     */
	    justifyContent?: 'start' | 'end' | 'space-between';
	}
	/**
	 * `UIButtonLabel` defines the label for a `UIButton`. It can have text and an icon.
	 */
	export type UIButtonLabel = {
	    icon?: string;
	    text?: string;
	};
	/**
	 * `UITimeline` defines the configuration of a timeline element, displayed on top of the report toolbar. The timeline can be defined without any scope,
	 * and display simply a plain date timeline ({@link UIDefaultTimeline}), or in the scope of a BTM Fact Sheet {@link UIImpactTimeline}.
	 */
	export type UITimeline = UIDefaultTimeline | UIImpactTimeline;
	/**
	 * `UIDefaultTimeline` defines the configuration of plain date timeline.
	 */
	export interface UIDefaultTimeline {
	    type: 'default';
	    /**
	     * Allow selection of multiple points in the timeline by holding the Shift key.
	     */
	    multiSelection?: boolean;
	    /**
	     * Optional range for the timeline using dates in ISO format (e.g. "2020-01-01"). If left empty, the
	     * default range of the timeline is used. The default start date is 3 years previous to the current date.
	     * The default end date is 7 years after the current date.
	     */
	    range?: {
	        start: string;
	        end: string;
	    };
	    /**
	     * The value of the default timeline.
	     */
	    value: UIDefaultTimelineValue | undefined;
	}
	/**
	 * `UIDefaultTimelineValue` defines the current value of the {@link UIDefaultTimeline | `UIDefaultTimeline`}.
	 */
	export interface UIDefaultTimelineValue {
	    /**
	     * `dates` defines a tuple of dates of size 2 to be used as value in the timeline.
	     *
	     * @example
	     * ```
	     * const singlePoint: lxr.UIDefaultTimelineDate[] = ["2020-01-01"]; // select a single point.
	     * const multiplePoints: lxr.UIDefaultTimelineDate[] = ["2020-01-01", "2020-03-01"] // select the time span between two dates.
	     * ```
	     */
	    dates: UIDefaultTimelineDate[];
	}
	/**
	 * `UIDefaultTimelineDate` defines the possible values used in the {@link UIDefaultTimeline | `UIDefaultTimeline`}. For the current
	 * point in time, use "today". Otherwise, use a date string using the ISO format ("YYYY-MM-DD").
	 */
	export type UIDefaultTimelineDate = 'today' | string;
	/**
	 * `UIImpactTimeline` defines the configuration of a timeline element to be displayed on top of the report's toolbar. The {@link UIImpactTimeline}
	 * describes a timeline in scope of a specific BTM Fact Sheet. Fact Sheets used in this timeline configuration, which are no valid
	 * BTM fact sheets can't be displayed in the timeline.
	 */
	export interface UIImpactTimeline {
	    type: 'impact';
	    /**
	     * Allow selection of multiple points in the timeline by holding the Shift key.
	     */
	    multiSelection?: boolean;
	    /**
	     * The value of the impact timeline.
	     */
	    value: UIImpactTimelineValue;
	}
	/**
	 * `UIImpactTimelineValue` defines the current value of a  {@link UIImpactTimeline | `UIImpactTimeline`}.
	 */
	export interface UIImpactTimelineValue {
	    /**
	     * Filters used from Impact Source Picker to create the timeline.
	     */
	    filter?: UIImpactSourcePickerFilterValue;
	    /**
	     * Source Fact Sheets where the timeline dates is read from.
	     */
	    factSheets: UIImpactTimelineFactSheetValue[];
	    /**
	     * Selected timeline points.
	     */
	    selectedPoints: TimelineStep[];
	}
	/**
	 * `UIImpactTimelineFactSheetValue` defines the structure of the BTM Fact Sheet to be used for the {@link UIImpactTimeline | `UIImpactTimeline`} selection value.
	 */
	export interface UIImpactTimelineFactSheetValue {
	    /**
	     * Fact Sheet ID of the BTM Fact Sheet containing a collection of impacts.
	     */
	    id: string;
	    /**
	     * Fact Sheet type.
	     */
	    type: string;
	}
	/**
	 * Contains the configurations required
	 * to filter on a specific portion of the reports data.
	 */
	export interface ReportFacetsConfig {
	    key: string;
	    callback?: (data: any[]) => void;
	    label?: string;
	    /**
	     * If defined the facet will have a fixed filter on the fact sheet type with this value. Important to mention is that updating this value won't work.
	     * Therefore, we recommend creating a new facet if you want to change the fixed fact sheet type. Another recommendation is to always reflect the fact sheet type in the `key` value of the facet.
	     */
	    fixedFactSheetType?: string;
	    /**
	     * The Fact Sheet attributes that should be queried from the backend.
	     * Example: `attributes: ['type', 'displayName']`
	     *
	     * Complex attributes need a subquery: `attributes: ['tags \{ \}']
	     */
	    attributes?: string[];
	    sortings?: Sorting[];
	    /**
	     * @deprecated this parameter has no effect on the page size anymore.
	     */
	    defaultPageSize?: number;
	    /**
	     * If defined these filters will be applied as initial default
	     * when the user enters the report.
	     */
	    defaultFilters?: FacetFilter[];
	    /**
	     * If defined these direct hits will be applied in initial report loading
	     */
	    factSheetIds?: string[];
	    /**
	     * If defined this full text search term is applied in initial report loading
	     */
	    fullTextSearchTerm?: string;
	    /** Called whenever a facet has changed
	     * @deprecated use facetFiltersChangedCallback() instead which is triggered on every facet change.
	     */
	    facetChangedCallback?: (facet: FacetFilter) => void;
	    facetFiltersChangedCallback?: (data: ReportFacetsSelection) => void;
	}
	export interface DirectHit {
	    id: string;
	    displayName: string;
	}
	export type ViewConstraintType = 'MAPPING_PER_YEAR';
	export interface ViewOption {
	    constraint?: ViewConstraintType;
	    constrainingRelation?: string[];
	    startDate?: string;
	    endDate?: string;
	}
	export interface ViewLegendItem {
	    id: number;
	    value: string;
	    bgColor: string;
	    color: string;
	    inLegend: boolean;
	    transparency: number;
	    label?: string;
	    description?: string;
	}
	export interface ViewMapping {
	    fsId: string;
	    legendId: number;
	    constraints: {
	        key: string;
	        value: string;
	    }[];
	    infos: string;
	}
	export type ViewInfoType = 'TAG' | 'FIELD' | 'FIELD_RELATION' | 'FIELD_TARGET_FS' | 'BUILT_IN';
	export interface ViewInfo {
	    key: string;
	    label: string;
	    type: ViewInfoType;
	    viewOptionSupport?: {
	        optionalConstraint?: string;
	        usesRangeLegend?: boolean;
	    };
	}
	export interface ViewResult extends ViewInfo {
	    legendItems: ViewLegendItem[];
	    mapping: ViewMapping[];
	}
	export type EnvironmentName = 'prod' | 'dev' | 'test';
	export interface Environment {
	    readonly name: EnvironmentName;
	    wasToggledTo: EnvironmentName;
	    production: boolean;
	    devTools: boolean;
	    storeUrl: string;
	}
	/** Interface for enriched data model */
	export interface EnrichedDataModel extends BaseDataModel {
	    factSheets: {
	        [key: string]: EnrichedFactSheetDataModel;
	    };
	    relationMapping: {
	        [key: string]: RelationMappingDataModel;
	    };
	}
	export interface ExternalIdBase {
	    quickSearch: boolean;
	    fullTextSearch: boolean;
	    urlTemplate: string;
	    uniqueFactSheet: boolean;
	    autoIncrement: boolean;
	    readOnly: boolean;
	    forFactSheets: string[];
	}
	export interface BaseDataModel {
	    factSheets: {
	        [key: string]: FactSheetDataModel | EnrichedFactSheetDataModel;
	    };
	    relations: {
	        [key: string]: RelationDataModel;
	    };
	    externalIdFields: {
	        [key: string]: ExternalIdBase;
	    };
	    rules: any;
	    validators: any;
	}
	export interface BaseFieldDefinition {
	    type: DataModelFieldType;
	    mandatory?: boolean;
	    quickSearch?: boolean;
	    fullTextSearch?: boolean;
	    inFacet?: boolean;
	    inView?: boolean;
	    viewAggregation?: 'OFF' | 'MIN' | 'MAX' | 'AVG';
	}
	export interface DoubleFieldDefinition extends BaseFieldDefinition {
	    type: 'DOUBLE';
	    range?: NumberRange;
	}
	export interface ExternalIdFieldDefinition extends BaseFieldDefinition {
	    type: 'EXTERNAL_ID';
	    urlTemplate?: string;
	    uniqueFactSheet?: boolean;
	    autoIncrement?: boolean;
	    readOnly?: boolean;
	    validators?: string[];
	    inFacet?: undefined;
	    inView?: undefined;
	}
	export interface IntegerFieldDefinition extends BaseFieldDefinition {
	    type: 'INTEGER';
	    range?: NumberRange;
	}
	export interface LifecycleFieldDefinition extends BaseFieldDefinition {
	    type: 'LIFECYCLE';
	    values: string[];
	}
	export interface LocationFieldDefinition extends BaseFieldDefinition {
	    type: 'LOCATION';
	}
	export interface MultipleSelectFieldDefinition extends BaseFieldDefinition {
	    type: 'MULTIPLE_SELECT';
	    values: string[];
	    activatedBy?: ActivatedByDefinition;
	}
	export interface ProjectStatusFieldDefinition extends BaseFieldDefinition {
	    type: 'PROJECT_STATUS';
	    values: string[];
	}
	export interface SingleSelectFieldDefinition extends BaseFieldDefinition {
	    type: 'SINGLE_SELECT';
	    values: string[];
	    activatedBy?: ActivatedByDefinition;
	}
	export interface StringFieldDefinition extends BaseFieldDefinition {
	    type: 'STRING';
	    validators?: string[];
	}
	export interface AggegatedFieldDefinition extends BaseFieldDefinition {
	    type: 'AGGREGATED';
	    mandatory?: undefined;
	    quickSearch?: undefined;
	    fullTextSearch?: undefined;
	    inFacet?: undefined;
	    inView?: undefined;
	    paths?: [
	        {
	            path: string;
	        }
	    ];
	    function?: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT' | 'ITC_CRITICAL_COUNT' | 'ITC_ABS_COUNT' | 'ITC_CRITICAL_RATIO';
	}
	export interface FrontEndBaseFieldDefinition extends BaseFieldDefinition {
	    mandatory?: undefined;
	    quickSearch?: undefined;
	    fullTextSearch?: undefined;
	    inFacet?: undefined;
	    inView?: undefined;
	}
	export interface RelationFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'RELATION';
	    relationDefinition: RelationDataModel;
	}
	export interface TagsFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'TAGS';
	}
	export interface SubscriptionsFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'SUBSCRIPTIONS';
	}
	export interface DateTimeFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'DATE_TIME';
	}
	export interface CompletionFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'COMPLETION';
	}
	export interface QualitySealStatusFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'QUALITYSEALSTATUS';
	}
	export interface ReadAccessControlListFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'READ_ACCESS_CONTROL_LIST';
	}
	export interface WriteAccessControlListFieldDefinition extends FrontEndBaseFieldDefinition {
	    type: 'WRITE_ACCESS_CONTROL_LIST';
	}
	export type DataModelFieldDefinition = DoubleFieldDefinition | ExternalIdFieldDefinition | IntegerFieldDefinition | LifecycleFieldDefinition | LocationFieldDefinition | MultipleSelectFieldDefinition | ProjectStatusFieldDefinition | SingleSelectFieldDefinition | StringFieldDefinition | AggegatedFieldDefinition | RelationFieldDefinition | TagsFieldDefinition | SubscriptionsFieldDefinition | DateTimeFieldDefinition | CompletionFieldDefinition | QualitySealStatusFieldDefinition | ReadAccessControlListFieldDefinition | WriteAccessControlListFieldDefinition;
	export interface DataModelFieldsDefinition {
	    [fieldName: string]: DataModelFieldDefinition;
	}
	export type TimeUnit = 'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS';
	export interface QualitySealConfig {
	    enabled: boolean;
	    value: number;
	    unit: TimeUnit;
	}
	export interface FactSheetConfiguration {
	    excludeDefiningSubtypes: string[];
	    excludeDisplayingSubtypes: string[];
	    duration: FieldConfiguration;
	    timescale: FieldConfiguration;
	    offset: FieldConfiguration;
	    startDate: FieldConfiguration;
	}
	export interface FieldConfiguration {
	    field?: string;
	    path?: string;
	    defaultValue: string;
	}
	export interface ImpactManagementConfig {
	    enabled: boolean;
	    impactDisplayingSubtypes: string[];
	    impactDefiningSubtypes: string[];
	}
	export interface FactSheetConfig {
	    qualitySeal?: QualitySealConfig;
	    maxHierarchyLevel?: number;
	    defaultACL?: ACLVisibility;
	    impactManagement?: ImpactManagementConfig;
	    milestonesActive?: boolean;
	}
	/** Fact Sheet definition in basic (non-enriched) data model */
	export interface FactSheetDataModel {
	    fields: DataModelFieldsDefinition;
	    config: FactSheetConfig;
	    namingRule: any;
	    subtypes?: string[];
	}
	/** Fact Sheet definition in enriched data model */
	export interface EnrichedFactSheetDataModel {
	    fields: DataModelFieldsDefinition;
	    relations: string[];
	    config: FactSheetConfig;
	    namingRule?: any;
	}
	export interface NumberRange {
	    min?: number;
	    max?: number;
	}
	export enum ACLVisibility {
	    GLOBAL = "GLOBAL",
	    READ_WRITE_RESTRICTED = "READ_RESTRICTED",
	    WRITE_RESTRICTED = "WRITE_RESTRICTED"
	}
	export interface ActivatedByDefinition {
	    [fsFieldName: string]: string[];
	}
	export interface DirectionalRelationDataModel {
	    name: string;
	    activatedBy?: ActivatedByDefinition;
	    factSheetType: string;
	    multiplicity: string;
	    groupByTargetField?: string;
	    mandatory?: boolean;
	}
	export interface RelationDataModel {
	    from: DirectionalRelationDataModel;
	    to: DirectionalRelationDataModel;
	    constraints: RelationConstraint[];
	    fields: DataModelFieldsDefinition;
	    constrainingRelations?: string[];
	}
	export type RelationConstraint = 'TYPE_EQUAL' | 'CYCLES_ALLOWED' | 'FACT_SHEET_UNIQUE_LAX';
	export interface RelationMappingDataModel {
	    direction: string;
	    inverseName: string;
	    inverseMultiplicity: '*' | '1';
	    persistedName: string;
	}
	export interface ViewModel {
	    layouts: any;
	    factSheets: FactSheetViewModel[];
	}
	export type ViewModelFieldType = 'text' | 'number' | 'externalId' | 'textarea' | 'multipleSelect' | 'status' | 'costs' | 'lifecycle' | 'location' | 'date' | 'percentage' | 'acl';
	export interface StatusIcon {
	    type: string;
	    color?: string;
	    reverse?: boolean;
	    order?: 'ASC' | 'DESC';
	}
	export interface Field<T = ViewModelFieldType> {
	    name: string;
	    type: T;
	    size?: number;
	    options?: any;
	}
	export interface Layout<T = ViewModelFieldType> {
	    fields: Field<T>[];
	}
	export interface TemplateOptionsBase<T = ViewModelFieldType> {
	    layout?: Layout<T>;
	}
	export interface TemplateOptionsRelation extends TemplateOptionsBase {
	    relationName: string;
	    /**
	     * Optional list of tags for filtering which new & existing Fact Sheets are permitted for this relation.
	     * For now only implemented on front-end for Survey.
	     */
	    tagFilter?: string[];
	}
	export type TemplateOptions<T = ViewModelFieldType> = TemplateOptionsBase<T> | TemplateOptionsRelation;
	export type FactSheetViewModelTemplateType = 'fields' | 'relation' | 'projectStatus' | 'properties' | 'relationDiagram';
	export interface FactSheetViewModelSubsection<T = ViewModelFieldType> {
	    label: string;
	    helpText?: string;
	    template: FactSheetViewModelTemplateType;
	    templateOptions?: TemplateOptions<T>;
	    weight?: number;
	    disabled?: boolean;
	}
	export interface ViewModelSingleFieldValueMetaData {
	    bgColor?: string;
	    color?: string;
	    /** icons, e.g: ['fa-star', 'fa-star'] */
	    icon?: string;
	}
	export interface ViewModelSingleFieldMetaData {
	    icon?: StatusIcon;
	    values: {
	        [value: string]: ViewModelSingleFieldValueMetaData;
	    };
	}
	export interface ViewModelRangeFieldMetaData {
	    min?: ViewModelRangeFieldValueMetaData;
	    max?: ViewModelRangeFieldValueMetaData;
	    unit?: NumericUnit;
	}
	export interface ViewModelRangeFieldValueMetaData {
	    bgColor: string;
	}
	export type NumericUnit = 'percentage';
	export type FieldViewMetaData = ViewModelSingleFieldMetaData | ViewModelRangeFieldMetaData;
	export type FactSheetViewMetaData = Record<string, FieldViewMetaData>;
	export type FieldMetaData = Record<string, FieldViewMetaData | FactSheetViewMetaData>;
	export type FactSheetViewModelSectionTabs = 'default' | 'subscriptions';
	export interface FactSheetViewModelSection {
	    label: string;
	    subsections: FactSheetViewModelSubsection<ViewModelFieldType>[];
	    weight?: number;
	    disabled?: boolean;
	    tabs?: FactSheetViewModelSectionTabs[];
	}
	export interface HoverConfigViewField {
	    name: string;
	    type: string;
	}
	export interface HoverConfigViewModel {
	    fields: HoverConfigViewField[];
	}
	export interface FactSheetTabRestriction {
	    [factSheetTabName: string]: string[];
	}
	export interface FactSheetViewModel {
	    type: string;
	    bgColor: string;
	    color: string;
	    fieldMetaData?: FieldMetaData;
	    sections: FactSheetViewModelSection[];
	    weight?: number;
	    onTheFlyCreation?: boolean;
	    hoverConfig?: HoverConfigViewModel;
	    factSheetTabRestriction?: FactSheetTabRestriction;
	}
	export type DefaultFactSheetType = 'Default';
	export interface FactSheetSelectionConfig {
	    /**
	     * Should it be possible to select one Fact Sheet or several Fact Sheets?
	     */
	    mode: 'SINGLE' | 'MULTIPLE';
	    /**
	     * Attributes of each Fact Sheet to be returned
	     *
	     * @type {string[]}
	     */
	    attributes: string[];
	    /**
	     * Restrict selection possibilities to this Fact Sheet type.
	     */
	    factSheetType?: string;
	}
	export interface LegendItem {
	    label: string;
	    description?: string;
	    bgColor: string;
	}
	/**
	 * ReportRequirements are sent from the custom report via report-lib
	 * to the reporting container. They specify which requirements
	 * the report has regarding the reporting environment. These are
	 * things like: requires facets, or requires a view.
	 */
	export interface ReportRequirements extends ReportConfiguration {
	    showView: boolean;
	}
	export interface FormModalSingleSelectFieldOption {
	    value: string;
	    label: string;
	    description?: string;
	}
	export interface FormModalSingleSelectField {
	    type: 'SingleSelect';
	    label: string;
	    options: FormModalSingleSelectFieldOption[];
	    description?: string;
	    disabled?: boolean;
	    tooltip?: string;
	    allowClear?: boolean;
	}
	export interface FormModalGroupSingleSelectField {
	    type: 'GroupSingleSelect';
	    label: string;
	    options: FormModalSingleSelectOptionGroup[];
	    description?: string;
	    disabled?: boolean;
	    tooltip?: string;
	    allowClear?: boolean;
	}
	export interface FormModalMultiSelectField {
	    type: 'MultiSelect';
	    label: string;
	    options: FormModalSingleSelectFieldOption[];
	    description?: string;
	    disabled?: boolean;
	}
	export interface FormModalSingleSelectOptionGroup {
	    label: string;
	    options: FormModalSingleSelectFieldOption[];
	}
	export interface FormModalCheckboxField {
	    type: 'Checkbox';
	    label: string;
	    disabled?: boolean;
	    tooltip?: string;
	}
	export interface FormModalDateField {
	    type: 'Date';
	    label: string;
	    disabled?: boolean;
	}
	export interface FormModalContainerField {
	    type: 'Container';
	    label?: string;
	    direction?: FormModalContainerDirection;
	    noMargin?: boolean;
	    items: FormModalFields;
	}
	export type FormModalContainerDirection = 'vertical' | 'horizontal';
	export type FormModalField = FormModalSingleSelectField | FormModalMultiSelectField | FormModalCheckboxField | FormModalDateField | FormModalContainerField | FormModalGroupSingleSelectField;
	export type FormModalFields = Record<string, FormModalField>;
	export interface FormModal {
	    fields: FormModalFields;
	    values: FormModalValues;
	    messages?: FormModalMessages;
	    valid?: boolean;
	}
	export interface FormModalMessages {
	    [key: string]: FormModalMessage;
	}
	export type FormModalMessage = FormModalInfoMessage | FormModalErrorMessage;
	export interface FormModalInfoMessage {
	    type: 'info';
	    message: string;
	}
	export interface FormModalErrorMessage {
	    type: 'error';
	    message: string;
	}
	export interface FormModalConfiguration {
	    fields: FormModalFields;
	    values: FormModalValues;
	    update?: (form: FormModal) => FormModal;
	}
	export interface FormModalValues {
	    [key: string]: FormModalValue;
	}
	export type FormModalValue = null | boolean | string | string[] | FormModalValues;
	/**
	 * Interface for messages received from the report
	 * @prop {String} action   Action to be executed by the parent
	 * @prop {Object} [params] Parameters for the action
	 * @prop {String} [id]     Unique identifier
	 */
	export interface MessageFromReport<T> {
	    action: string;
	    params?: T;
	    id?: string;
	}
	/**
	 * Interface for messages sent to the report
	 * @prop {Object}  data    Data received from Parent
	 * @prop {String}  id      Unique identifier of preceding outbound call
	 * @prop {Boolean} success Signifies whether a requested action succeeded
	 */
	export interface MessageToReport<T = any> {
	    id?: string;
	    data?: T;
	    success?: boolean;
	}
	/**
	 * Describes the structure of a FactSheet response from the API.
	 */
	export interface FactSheet extends BaseFactSheet {
	    [key: string]: any;
	}
	export type FactSheetQualityState = 'APPROVED' | 'BROKEN' | 'DISABLED';
	export type FactSheetStatusState = 'ACTIVE' | 'ARCHIVED';
	export interface Completion {
	    /** Rounded to integer; floating `completion` also available here and below */
	    percentage: number;
	    sectionCompletions?: {
	        name: string;
	        percentage: number;
	        subsectionCompletions?: {
	            name: string;
	            percentage: number;
	        }[];
	    }[];
	}
	/**
	 * A minimal Fact Sheet object used in several places in the front-end for display
	 */
	export interface MinimalFactSheet {
	    id?: string;
	    type?: string;
	    category?: string | null;
	    displayName?: string;
	    disabled?: boolean;
	    diff?: FactSheetDiff;
	}
	export interface FactSheetDiff {
	    previous: FactSheetDiffCircle;
	    current: FactSheetDiffCircle;
	    toolTip?: string;
	}
	export interface FactSheetDiffCircle {
	    backgroundColor: string;
	    borderStyle: 'dotted' | 'dashed' | 'solid';
	    borderColor: string;
	}
	/**
	 * Describes the structure of a Base FactSheet response from the API.
	 */
	export interface BaseFactSheet extends MinimalFactSheet {
	    id?: string;
	    rev?: number;
	    type?: string;
	    category?: string | null;
	    name?: string;
	    fullName?: string;
	    displayName?: string;
	    description?: string;
	    updatedAt?: string;
	    tags?: Tag[];
	    qualitySeal?: FactSheetQualityState;
	    naFields?: string[];
	    status?: FactSheetStatusState;
	    permissions?: PermissionList;
	    completion?: Completion;
	    subscriptions?: GraphqlConnection<FactSheetSubscription>;
	    permittedReadACL?: AccessControlEntityReference[];
	    permittedWriteACL?: AccessControlEntityReference[];
	}
	export interface FactSheetSubscription extends MyFactSheetSubscription {
	    id?: string;
	    user: User;
	    type: SubscriptionType;
	    roles: SubscriptionRole[];
	    createdAt?: string;
	    factSheet?: BaseFactSheet;
	}
	export interface MyFactSheetSubscription {
	    id?: string;
	    type: SubscriptionType;
	    roles: {
	        id: string;
	    }[];
	}
	export interface User {
	    id?: string;
	    firstName?: string;
	    lastName?: string;
	    displayName?: string;
	    email?: string;
	    technicalUser?: boolean;
	    permission?: {
	        role?: MtmPermissionRole;
	        status?: MtmPermissionStatus;
	    };
	}
	export type MtmPermissionRole = 'MEMBER' | 'ADMIN' | 'VIEWER' | 'CONTACT' | 'TRANSIENT';
	export type MtmPermissionStatus = 'ACTIVE' | 'INVITED' | 'NOTINVITED' | 'ARCHIVED' | 'REQUESTED' | 'ANONYMIZED' | '!ACTIVE' | '!INVITED' | '!NOTINVITED' | '!ARCHIVED' | '!REQUESTED';
	export interface AccessControlEntityReference {
	    id: string;
	    name: string;
	}
	export interface PageInfo {
	    hasNextPage: boolean;
	    hasPreviousPage: boolean;
	    startCursor?: string;
	    endCursor?: string;
	}
	export interface GenericGraphqlConnection<T, E extends GraphqlConnectionEdge<T>> {
	    edges?: E[];
	    pageInfo?: PageInfo;
	    totalCount?: number;
	    permissions?: any;
	    t?: T;
	}
	export type GraphqlConnection<T> = GenericGraphqlConnection<T, GraphqlConnectionEdge<T>>;
	export interface GraphqlConnectionEdge<T> {
	    node: T;
	    cursor?: string;
	}
	export interface PermissionList {
	    self?: PermissibleAction[];
	    read?: string[];
	    create?: string[];
	    update?: string[];
	    delete?: string[];
	}
	export type PermissibleAction = 'READ' | 'UPDATE' | 'CREATE' | 'DELETE' | 'ARCHIVE' | 'IMPORT' | 'EXPORT' | 'INLINE_EDIT' | 'UNLOCK' | 'CHANGE_OWNER' | 'MANAGE_PREDEFINED';
	export type TagStatus = 'ACTIVE' | 'ARCHIVED';
	/**
	 * Represents a tag as it is provided by the GraphQL API.
	 *
	 * @export
	 * @interface Tag
	 */
	export interface Tag {
	    id: string;
	    name: string;
	    description?: string;
	    color?: string;
	    tagGroup?: TagGroup;
	    status?: TagStatus;
	    factSheetCount?: number;
	    deletable?: boolean;
	}
	export type TagGroupMode = 'SINGLE' | 'MULTIPLE';
	/**
	 * Represents a tag group as it is provided by the GraphQL API.
	 *
	 * @export
	 * @interface TagGroup
	 */
	export interface TagGroup {
	    id?: string;
	    name?: string;
	    shortName?: string;
	    description?: string;
	    mode?: TagGroupMode;
	    restrictToFactSheetTypes?: string[];
	    tagCount?: number;
	    mandatory?: boolean;
	}
	export interface PersistedLifecyclePhase {
	    phase: string;
	    startDate: string;
	}
	export interface UISelection {
	    elements: UIElements | null;
	    facets: ContextFacetsSelectionState[] | null;
	    timeline: UITimeline | null;
	    dropdowns: DropdownSelection[] | null;
	}
	export interface ContextFacetsSelectionState {
	    context: string;
	    state: ReportFacetsSelection;
	}
	export interface DropdownSelection {
	    field: DropdownSelectionField;
	    value: string | null;
	}
	export interface DropdownSelectionField {
	    id: string;
	    name: string;
	    entries: DropdownSelectionEntry[];
	}
	export interface DropdownSelectionEntry {
	    id: string;
	    name: string;
	}
	export interface ReportFacetsSelection {
	    facets: FacetFilter[];
	    compositeFacets?: CompositeFactSheetFilter;
	    directHits: DirectHit[];
	    fullTextSearchTerm?: string;
	}
	export interface PointOfViewInput {
	    id: string;
	    changeSet?: ChangeSet;
	}
	export interface ProjectionsQueryParams {
	    attributes: ProjectionAttribute[];
	    filters: ProjectionFilter[];
	    pointsOfView: PointOfViewInput[];
	}
	export type ChangeSet = PlanChangeSet | DateOnlyChangeSet | MultiplePlanChangeSet;
	export interface PlanChangeSet {
	    type: 'plan';
	    planId: string;
	    intervalStep?: number;
	    date?: string;
	    milestoneId?: string;
	}
	export interface DateOnlyChangeSet {
	    type: 'dateOnly';
	    date: string;
	}
	export interface MultiplePlanChangeSet {
	    type: 'multiplePlan';
	    factSheetIds: string[];
	    date?: string;
	    milestoneId?: string;
	}
	export type ProjectionAttribute = FactSheetFieldAttribute | RelationFieldAttribute | TargetFactSheetFieldAttribute | PathFieldAttribute | TimingAttribute;
	export type ProjectionAttributeType = 'field' | 'relationField' | 'targetField' | 'path' | 'timing';
	export interface TimingAttribute {
	    type: 'timing';
	}
	export interface FactSheetFieldAttribute {
	    type: 'field';
	    name: string;
	    field: string;
	}
	export interface RelationFieldAttribute {
	    type: 'relationField';
	    name: string;
	    relation: string;
	    field: string;
	}
	export interface TargetFactSheetFieldAttribute {
	    type: 'targetField';
	    name: string;
	    relation: string;
	    field: string;
	}
	export interface PathFieldAttribute {
	    name: string;
	    type: 'path';
	    path: Path;
	}
	export type Path = FieldPath | RelationPath | FactSheetPath | ConstrainingRelationPath | PathsPath;
	export interface FieldPath {
	    type: 'field';
	    field: string;
	}
	export interface RelationPath {
	    type: 'relation';
	    relation: string;
	    path: Path;
	}
	export interface FactSheetPath {
	    type: 'factSheet';
	    path: Path;
	}
	export interface ConstrainingRelationPath {
	    type: 'constrainingRelation';
	    path: Path;
	}
	export interface PathsPath {
	    type: 'paths';
	    paths: Record<string, Path>;
	}
	export type ProjectionFilter = ProjectionEqualsFilter | ProjectionLessThanFilter | ProjectionLessOrEqualFilter | ProjectionGreaterThanFilter | ProjectionGreaterOrEqualFilter | ProjectionContainsFilter | ProjectionInFilter | ProjectionFullTextFilter | ProjectionFactSheetTypeFilter | ProjectionForAnyRelationFilter | ProjectionForFactSheetFilter | ProjectionAll | ProjectionAny | ProjectionNone;
	export type ProjectionFilterType = ProjectionFilter['type'];
	export interface ProjectionEqualsFilter {
	    type: 'equals';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionLessThanFilter {
	    type: 'less';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionLessOrEqualFilter {
	    type: 'lessEqual';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionGreaterThanFilter {
	    type: 'greater';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionGreaterOrEqualFilter {
	    type: 'greaterEqual';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionContainsFilter {
	    type: 'contains';
	    fieldValue: unknown;
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionInFilter {
	    type: 'in';
	    fieldValue: unknown[];
	    fieldName: string;
	    path?: string;
	}
	export interface ProjectionFullTextFilter {
	    type: 'fullText';
	    text: string;
	}
	export interface ProjectionFactSheetTypeFilter {
	    type: 'factSheetType';
	    types: string[];
	}
	export interface ProjectionForAnyRelationFilter {
	    type: 'forAnyRelation';
	    relation: string;
	    filters: ProjectionFilter[];
	}
	export interface ProjectionForFactSheetFilter {
	    type: 'forFactSheet';
	    direction: ProjectionFilterDirection;
	    filters: ProjectionFilter[];
	}
	type ProjectionFilterDirection = 'FROM' | 'TO';
	export interface ProjectionAll {
	    type: 'all';
	    filters: ProjectionFilter[];
	}
	export interface ProjectionAny {
	    type: 'any';
	    filters: ProjectionFilter[];
	}
	export interface ProjectionNone {
	    type: 'none';
	    filters: ProjectionFilter[];
	}
	export interface ProjectionsResponse {
	    data: PointOfViewResponse[];
	}
	export interface PointOfViewResponse {
	    id: string;
	    items: ProjectionItem[];
	}
	export interface ProjectionItem {
	    [attributeKey: string]: ProjectionItemValue | ProjectionItemValueMap;
	}
	export type ProjectionItemValue = ProjectionItemExternalId | ProjectionItemLifecycle | ProjectionItemTags | ProjectionItemProjectStatus | ProjectionItemLocation | ProjectionItemPermittedAcl[] | ProjectionItemSubscription[] | ProjectionItemRelation | string | number | null;
	export type ProjectionItemValueMap<T extends ProjectionItemValue = ProjectionItemValue> = Record<string, T>;
	export interface ProjectionItemExternalId {
	    externalId: string | null;
	    externalUrl: string | null;
	    externalVersion: string | null;
	    comment: string | null;
	    status: string | null;
	}
	export interface ProjectionItemPermittedAcl {
	    id: string;
	    name: string;
	}
	export type ProjectionItemTags = string[];
	export interface ProjectionItemLifecycle {
	    currentPhase: string;
	    /** Map of phase name to date */
	    phases: Record<string, string>;
	}
	export interface ProjectionItemSubscription {
	    id: string;
	    linkedRoles: ProjectionItemSubscriptionRole[];
	    type: SubscriptionType;
	    userId: string;
	}
	export interface ProjectionItemSubscriptionRole {
	    roleId: string;
	    name: string;
	    comment: string | null;
	    description: string | null;
	}
	export interface ProjectionItemProjectStatus {
	    current: ProjectionItemProjectStatusEntry | null;
	    values: Record<string, ProjectionItemProjectStatusEntry>;
	}
	export interface ProjectionItemProjectStatusEntry {
	    date: string;
	    status: string | null;
	    progress: number | null;
	    description?: string | null;
	}
	export interface ProjectionItemLocation {
	    rawAddress: string | null;
	    latitude: number;
	    longitude: number;
	    geoCity: string | null;
	    geoCountryCode: string | null;
	    geoCountry: string | null;
	    geoAddress: string | null;
	    geoStreet: string | null;
	    geoHouseNumber: string | null;
	    geoPostalCode: string | null;
	}
	export interface ProjectionItemRelation {
	    id: string;
	    constrainedBy: Record<string, string>;
	}
	export interface MetricsMeasurement {
	    name?: string;
	    fields?: string[];
	    tags?: string[];
	}
	export interface TagDefinition {
	    id: string;
	    name: string;
	    color?: string;
	    status?: TagStatus;
	}
	export interface TagGroupDefinition {
	    id: string;
	    name: string;
	    shortName?: string;
	    mode: TagGroupMode;
	    tags: TagDefinition[];
	}
	export type TagModel = Record<string, TagGroupDefinition[]>;
	/**
	 * `TimelineStep` defines a selection in the {@link UIImpactTimeline} element.
	 * The `TimelineStep` value can be of different types.
	 *
	 * The numeric value defines a single interval step in the timeline, used for relative timelines.
	 * The 'today' value defines the current point in time.
	 * {@link DateStep} value defines a single date.
	 * {@link MilestoneStep} defines a point referenced by a Milestone of the BTM Fact Sheet.
	 */
	export type TimelineStep = number | 'today' | DateStep | MilestoneStep;
	/**
	 * `MilestoneStep` describes a timeline selection using a defined milestone in the scope of the timeline's
	 * BTM Fact Sheet.
	 */
	export interface MilestoneStep {
	    milestoneId: string;
	}
	/**
	 * `DateStep` describes a timeline selection using a given date (in ISO format).
	 */
	export interface DateStep {
	    date: string;
	}
	export interface ImpactSelection {
	    factSheet: {
	        id: string;
	        type: string;
	    };
	    selectedPoints: TimelineStep[];
	}
	export type TimelineBookmarkSelection = ImpactSelection | DateSelection;
	export interface DateSelection {
	    dates: string[];
	}
	export type SidePaneElements = Record<string, SidePaneElement>;
	/**
	 * Element which can be placed on the SidePane.
	 * @beta
	 */
	export type SidePaneElement = SidePaneContainerElement | SidePaneTableElement | SidePaneTableBadgeElement | SidePaneShowInInventoryElement | SidePaneFactSheetElement | SidePaneDescriptionElement | SidePaneCategoryHeaderElement | SidePaneContextMenuElement | SidePaneFactSheetTableElement;
	/**
	 * Direction how elements are placed next to each other within a container.
	 * Defaults to: 'vertical'
	 * @beta
	 */
	export type SidePaneContainerDirection = 'vertical' | 'horizontal';
	export type SidePaneAlignment = 'left' | 'center' | 'right';
	/**
	 * Container Element which can contain other {@link SidePaneElements} such as {@link SidePaneContainerElement} or {@link SidePaneTableElement}.
	 * Type: Defines it to 'Container'
	 * label: Text to be displayed as label above the container.
	 * Direction: Defines how the elements are placed next to each other.
	 * elements: Record<string, {@link SidePaneElement}> of elements to display.
	 * @beta
	 */
	export interface SidePaneContainerElement {
	    type: 'Container';
	    label?: string;
	    maxHeight?: string;
	    autoScroll?: string;
	    direction?: SidePaneContainerDirection;
	    elements: SidePaneElements;
	}
	/**
	 * Element to display a badge sign with a number value and a specific label e.g. 666 Total results.
	 * @beta
	 */
	export interface SidePaneTableBadgeElement {
	    type: 'Badge';
	    label: string;
	    value: number;
	    align?: SidePaneAlignment;
	}
	/**
	 * Element to display a description for example a subheader in the sidepane.
	 * If `clickId` is set, the label becomes clickable.
	 * @beta
	 */
	export interface SidePaneDescriptionElement {
	    type: 'Description';
	    text: string;
	    align?: SidePaneAlignment;
	    clickId?: string;
	}
	/**
	 * Element to display a link to inventory with prepared facet filters for the inventory.
	 * @beta
	 */
	export interface SidePaneShowInInventoryElement {
	    type: 'ShowInventory';
	    label: string;
	    factSheetType: string;
	    factSheetIds: string[];
	    tableColumns: TableColumn[];
	    facetFilters: FacetFilter[];
	    align?: SidePaneAlignment;
	    sorting?: {
	        key: string;
	        order: 'asc' | 'desc';
	    }[];
	}
	/**
	 * Table element to be shown on the SidePane.
	 * @beta
	 */
	export interface SidePaneTableElement {
	    type: 'Table';
	    label?: string;
	    headerRow?: SidePaneTableHeaderRow;
	    rows: SidePaneTableRow[];
	}
	/**
	 * Table Header row which is displayed differently
	 * @beta
	 */
	export interface SidePaneTableHeaderRow {
	    labels: SidePaneTableCell[];
	}
	/**
	 * Table row
	 * link?: link e.g to the specific Fact Sheet
	 * columns: columns with different values to be shown.
	 * @beta
	 */
	export interface SidePaneTableRow {
	    link?: string;
	    cells: SidePaneTableCell[];
	}
	/**
	 * @beta
	 */
	export type SidePaneTableCell = string | number | Icon;
	/**
	 * @beta
	 */
	export interface Icon {
	    name: string;
	    color: string;
	    label?: string;
	    quantity: number;
	}
	/**
	 * Fact Sheet element to be shown on the SidePane.
	 * @beta
	 */
	export interface SidePaneFactSheetElement {
	    type: 'FactSheet';
	    factSheetId: string;
	    factSheetType?: string;
	    detailFields: string[];
	    relations: SidePaneFactSheetRelation[];
	    pointOfView: PointOfViewInput;
	}
	/**
	 * Relation to be shown on the {@link SidePaneFactSheetElement}.
	 * @beta
	 */
	export interface SidePaneFactSheetRelation {
	    name: string;
	}
	/**
	 * Sidepane Fact Sheet Field Update
	 * @beta
	 */
	export interface FieldUpdateData {
	    name: string;
	    value: string | string[] | ProjectionItemLifecycle | null;
	}
	/**
	 * Sidepane Fact Sheet Field Update
	 * @beta
	 */
	export interface FactSheetUpdate {
	    id: string;
	    field?: FieldUpdateData;
	    relation?: RelationUpdate;
	}
	/**
	 * Sidepane click event
	 * @beta
	 */
	export interface SidePaneClick {
	    id: string;
	}
	/**
	 * Sidepane Fact Sheet Relation Update
	 * @beta
	 */
	export interface RelationUpdate {
	    name: string;
	    value: {
	        old: {
	            id: string;
	            toFsId: string;
	        } | undefined;
	        new: {
	            id: string;
	            toFsId: string;
	        } | undefined;
	    };
	}
	/**
	 * Fact Sheet Table element to be shown on the __SidePane__.
	 * @beta
	 */
	export interface SidePaneFactSheetTableElement {
	    type: 'FactSheetTable';
	    label?: string;
	    items?: SidePaneFactSheetTableItem[];
	}
	/**
	 * Sidepane Fact Sheet Item to be shown on the {@link SidePaneFactSheetTableElement}
	 * @prop {MinimalFactSheet} factSheet  Optional first Fact Sheet to be shown on the first column
	 * @prop {String} icon  Optional icon to be shown on the second column
	 * @prop {MinimalFactSheet} secondFactSheet  Optional second Fact Sheet to be shown on the second column
	 * @prop {SidePaneFactSheetTableItemStatus} status  Optional status to be shown in a row
	 * @beta
	 */
	export interface SidePaneFactSheetTableItem {
	    factSheet?: MinimalFactSheet;
	    icon?: SidePaneFactSheetTableItemIcon;
	    secondFactSheet?: MinimalFactSheet;
	    status?: SidePaneFactSheetTableItemStatus;
	}
	/**
	 * Sidepane Fact Sheet Item status to be shown on the {@link SidePaneFactSheetTableElement}
	 * @prop {String} label icon to be shown on the second column
	 * @prop {String} color Optional color to be shown on the second column
	 */
	export interface SidePaneFactSheetTableItemStatus {
	    label: string;
	    color?: string;
	}
	/**
	 * Sidepane Fact Sheet Item Icon to be shown on the {@link SidePaneFactSheetTableItem}.
	 * @prop {String} name  icon name that will be rendered as a regular font awesome icon
	 * @prop {String} tooltip optional tooltip text that will show on icon hover
	 * @example { name: 'level-up' }
	 * @beta
	 */
	export interface SidePaneFactSheetTableItemIcon {
	    name: string;
	    tooltip?: string;
	}
	/**
	 * Category Header element to be shown on the SidePane.
	 * @beta
	 */
	export interface SidePaneCategoryHeaderElement {
	    type: 'CategoryHeader';
	    label?: string;
	    color?: string;
	}
	/**
	 * Context menu element to be shown on the {@link Sidepane}.
	 * The position of this element is always on top of the {@link Sidepane}, on the left side of the cancel button.
	 * Only one instance of the {@link SidePaneContextMenuElement} is displayed in the {@link Sidepane}
	 * If one option is provided, a button is rendered with the concatenated label of {@link SidePaneContextMenuElement} and the single option {@link SidepaneContextMenuEntry} label
	 * If more than one option is provided, a dropdown is rendered with the options provided
	 * @beta
	 */
	export interface SidePaneContextMenuElement {
	    type: 'ContextMenu';
	    label: string;
	    options: SidepaneContextMenuEntry[];
	    align?: SidePaneAlignment;
	}
	export type SidepaneContextMenuEntry = SidepaneContextMenuInventoryLink | SidepaneContextMenuDataFlowLink | SidepaneOpenReportInNewTabLink | SidepaneContextMenuClickEntry;
	interface SidepaneContextMenuBaseItem {
	    label: string;
	}
	export interface SidepaneContextMenuInventoryLink extends SidepaneContextMenuBaseItem {
	    type: 'InventoryLink';
	    tableColumns: TableColumn[];
	    factSheetIds: string[];
	    facetFilter: FacetFilter[];
	    factSheetType: string;
	    sorting?: {
	        key: string;
	        order: 'asc' | 'desc';
	    }[];
	}
	export interface SidepaneContextMenuDataFlowLink extends SidepaneContextMenuBaseItem {
	    type: 'DataFlowLink';
	    factSheetId: string;
	}
	export interface SidepaneOpenReportInNewTabLink extends SidepaneContextMenuBaseItem {
	    type: 'OpenReportInNewTab';
	    state: any;
	    contextFacets?: ContextFacetsSelectionState[];
	    name?: string;
	}
	export interface SidepaneContextMenuClickEntry extends SidepaneContextMenuBaseItem {
	    type: 'Click';
	    clickId: string;
	}
	export type ToastrType = 'warning' | 'info' | 'success' | 'error';
	export interface NavigateToInventoryFilters {
	    facetFilters: FacetFilter[];
	    fullTextSearchTerm?: string;
	    factSheetIds?: string[];
	    sorting?: {
	        key: string;
	        order: 'asc' | 'desc';
	    }[];
	}
	export type PageContext = ReportPageContext | WidgetPageContext | DashboardPageContext;
	export type PageContextType = PageContext['type'];
	export interface ReportPageContext {
	    type: 'report';
	}
	export interface WidgetPageContext {
	    type: 'widget';
	}
	export interface DashboardPageContext {
	    type: 'dashboard';
	}
	export interface GraphQLPointOfViewInput {
	    factSheetIds: string[];
	    pointInTime: {
	        date: string | null;
	        milestoneId: string | null;
	    };
	}
	export interface GraphQLOptions {
	    includeInvalidRelations?: boolean;
	    excludeConstrainingRelations?: string[];
	    trackingKey?: string;
	}
	export type ReportAllFactSheetsResponse = Record<string, ReportPointOfViewFactSheets>;
	export interface ReportPointOfViewFactSheets {
	    totalCount: number;
	    edges: ReportPointOfViewFactSheetEdge[];
	}
	export interface ReportPointOfViewFactSheetEdge {
	    node: ReportPointOfViewFactSheetNode;
	}
	export interface ReportPointOfViewFactSheetNode {
	    id: string;
	    type: string;
	    category: string;
	    description: string;
	    [key: string]: any;
	}
	export type AttributeDescription = FieldDescription | RelationFieldDescription | TargetFieldDescription;
	export interface FieldDescription {
	    type: 'field';
	    name: string;
	    field: string;
	    fieldType: FieldType;
	}
	export interface RelationFieldDescription {
	    type: 'relationField';
	    name: string;
	    field: string;
	    fieldType: FieldType;
	    relation: string;
	    targetFactSheetType: string;
	    activeOnly: boolean;
	}
	export interface TargetFieldDescription {
	    type: 'targetField';
	    name: string;
	    field: string;
	    fieldType: FieldType;
	    relation: string;
	    activeOnly: boolean;
	    /** The Fact Sheet type of the target Fact Sheet. A '*' means that any Fact Sheet type is possible. */
	    targetFactSheetType: string;
	    constrainedBy?: string[];
	}
	export type ReportEvent = DataChangeEvent | SuggestionsDisplayedEvent;
	export interface DataChangeEvent {
	    type: 'DataChange';
	    reportType: string;
	    baseFactSheetType?: string;
	    view?: string;
	    cluster: string[];
	    drilldown: string[];
	    suggestions: Record<string, unknown>;
	}
	export interface SuggestionsDisplayedEvent {
	    type: 'SuggestionsDisplayed';
	    reportType: string;
	    hasSuggestions: boolean;
	    baseFactSheetType?: string;
	}
	export type FieldType = 'AGGREGATED' | 'COMPLETION' | 'DATE_TIME' | 'DOUBLE' | 'EXTERNAL_ID' | 'INTEGER' | 'LIFECYCLE' | 'LOCATION' | 'LX_MILESTONES' | 'LX_STATE' | 'MULTIPLE_SELECT' | 'PROJECT_STATUS' | 'QUALITYSEALSTATUS' | 'READ_ACCESS_CONTROL_LIST' | 'RELATION' | 'SEARCH_BASED' | 'SINGLE_SELECT' | 'STATUS' | 'STRING' | 'SUBSCRIPTIONS' | 'TAGS' | 'WRITE_ACCESS_CONTROL_LIST';
	export {};

	export interface Listener {
	    (data: any, isError?: boolean): void;
	}
	export class ReportLibMessenger {
	    private parentWindow;
	    private parentOrigin;
	    private listeners;
	    constructor();
	    /**
	     * Send a message to the parent
	     * @param {OutboundMessage} message
	     */
	    sendToParent<S, T>(_message: MessageFromReport<S>): void;
	    sendToParent<S, T>(_message: MessageFromReport<S>, _returnPromise: true): Promise<T>;
	    /**
	     * Call listener whenever a message with the given `id` (or otherwise any message)
	     * is received from the parent
	     */
	    registerListener(id: string | undefined, listener: Listener, callOnError?: boolean): void;
	    deRegisterListener(id?: string, listener?: Listener): void;
	    deRegisterAllListeners(): void;
	    listenOnce<T = any>(id?: string): Promise<T>;
	    /**
	     * Handler for window message events
	     */
	    private messageListener;
	    private callListeners;
	    private invokeCallback;
	    private showError;
	}

	export class ReportTablePopoverStyles {
	    top?: number | string;
	    width?: number;
	    arrowLeft?: number | string;
	}
	export class ReportTablePopoverParams {
	    factSheets: FactSheet[];
	    title?: string;
	    styles?: ReportTablePopoverStyles;
	    factSheetType?: string;
	    columns?: ReportTableConfigAttribute[];
	    maxRows?: number;
	}
	export class ReportLibTable {
	    private messenger;
	    private facetsConfigs;
	    showPopover(params: ReportTablePopoverParams): void;
	    hidePopover(): void;
	    setFacetsConfig(facetsConfig: ReportFacetsConfig, index: number): void;
	    private attributesPresentInConfig;
	}

	export function get<T = any>(obj: Object, path: string, defaultValue?: null): T | undefined;
	/**
	 * based on
	 * https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type
	 * adding safety boolean casting
	 */
	export function isFunction(functionToCheck: any): boolean;
	/**
	 * Based on the lodash own description
	 * https://lodash.com/docs/4.17.11#isObjectLike
	 */
	export function isObjectLike(objectToCheck: any): boolean;
	/**
	 * Check if value is undefined
	 */
	export function isUndefined(valueToCheck: any): boolean;
	/**
	 * Based on
	 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_pickby
	 */
	export function pickBy(object?: object, callback?: (value: any) => boolean): object;
	export function unset(obj: any, path: string): void;
	export function cloneDeep(obj: object): object;
	export function difference<T>(from: Array<T>, to: Array<T>): Array<T>;
	export function flatten<T>(input: Array<any>): Array<T>;

	type Primitive = string | number | boolean | null | undefined;
	/**
	 * Initialize Sentry error tracking for reports. Enables reports to leverage sentry tracking for error monitoring.
	 * @param sentryConfig Sentry configuration
	 * @param reportId Unique identifier for the report
	 * @param reportSetupSettings Settings specific to the report setup
	 */
	export const initSentry: (sentryConfig: SentryConfig, reportId: string, reportSetupSettings: ReportSetupSettings) => void;
	/**
	 * Capture a report error with context
	 * @param error Error to capture
	 * @param context Contextual information about the error
	 * @returns string - The event ID of the captured error
	 */
	export const captureReportError: (error: unknown, context?: Record<string, Primitive>) => string;
	export {};

	/**
	 * Recursively masks sensitive data in any object structure.
	 * This is a simplified version of the original maskDataInEvent function.
	 *
	 * @param data - The data object to mask (can be any type)
	 * @param currentUser - User data to identify what should be masked
	 * @returns The data with sensitive information masked
	 */
	export function maskSensitiveData(data: unknown, currentUser: ReportUser): unknown;

}