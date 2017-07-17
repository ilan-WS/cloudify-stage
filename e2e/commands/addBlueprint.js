/**
 * Created by pawelposel on 2017-05-31.
 */

exports.command = function(blueprintName, blueprintYamlFile = 'blueprint.yaml') {
    if (!blueprintName) {
        blueprintName = this.page.blueprints().props.testBlueprint;
    }

    return this.isBlueprintExist(blueprintName, result => {
        if (!result.value) {
            var blueprints = this.page.blueprints();

            this.isWidgetPresent(blueprints.props.widgetId, result => {
                this.log("adding", blueprintName, "blueprint - upload blueprint");

                if (!result.value) {
                    this.moveToEditMode()
                        .addWidget(blueprints.props.widgetId)
                        .moveOutOfEditMode();
                }

                blueprints.clickElement('@uploadButton');

                let blueprintYamlFileOptionElement = `select[name="blueprintFileName"] option[value="${blueprintYamlFile}"]`;
                let blueprintYamlFileDropdownSelector = blueprints.section.uploadModal.elements.blueprintYamlFile.selector;
                blueprints.section.uploadModal
                    .waitForElementVisible('@okButton')
                    .setValue('@blueprintName', blueprintName)
                    .setValue('@blueprintFile', this.page.resources().props.blueprint(blueprintName))
                    .waitForElementPresent(blueprintYamlFileOptionElement)
                    .selectOptionInDropdown(blueprintYamlFileDropdownSelector, blueprintYamlFile)
                    .clickElement('@okButton');

                blueprints.waitForElementNotPresent('@uploadModal', 10000);

                this.page.filter()
                    .waitForBlueprintPresent(blueprintName);
            });
        } else {
            this.log("not adding", blueprintName, "blueprint, it already exists");
        }
    });
};