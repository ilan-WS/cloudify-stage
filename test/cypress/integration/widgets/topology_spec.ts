// @ts-nocheck File not migrated fully to TS
import _ from 'lodash';
import { secondsToMs, waitUntilEmpty, waitUntilNotEmpty } from '../../support/resource_commons';

describe('Topology', () => {
    const pollingTimeSeconds = 5;
    const resourcePrefix = 'topology_test_';
    const getNodeTopologyButton = (index: number) => cy.get(`.nodeTopologyButton:eq(${index})`);

    const waitForDeploymentToBeInstalled = (deploymentId: string) => {
        cy.log(`Waiting for deployment ${deploymentId} to be installed.`);
        const startedInstallWorkflowsOnDeploymentUrl = `executions?_include=id,workflow_id,status&deployment_id=${deploymentId}&workflow_id=install&status=started`;

        // NOTE: First, wait for execution to start as it can happen not to start immediately.
        // Then, wait for install workflow to change the status not to be `started`.
        waitUntilNotEmpty(startedInstallWorkflowsOnDeploymentUrl);
        waitUntilEmpty(startedInstallWorkflowsOnDeploymentUrl);
    };

    before(() => {
        cy.activate('valid_trial_license').usePageMock('topology', { pollingTime: pollingTimeSeconds });
    });

    describe('presents data for selected', () => {
        const blueprintId = `${resourcePrefix}bp`;
        const deploymentId = `${resourcePrefix}dep`;
        const blueprintFile = 'blueprints/topology.zip';

        before(() => {
            cy.mockLogin()
                .deletePlugins()
                .uploadPluginFromCatalog('Terraform')
                .deleteDeployments(resourcePrefix, true)
                .deleteBlueprints(resourcePrefix, true)
                .uploadBlueprint(blueprintFile, blueprintId)
                .deployBlueprint(blueprintId, deploymentId)
                .executeWorkflow(deploymentId, 'install');
        });

        beforeEach(() => {
            cy.interceptSp('GET', '/summary').as('getSummary');
        });

        it('blueprint', () => {
            cy.setBlueprintContext(blueprintId);

            cy.log('Check Topology widget');
            cy.get('.widgetItem > div > .widgetContent > div > .scrollGlass').click();
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'terraform');
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'cloud_resources');
        });

        it('deployment', () => {
            const getTerraformDetailsButton = () => getNodeTopologyButton(0);
            const getTerraformNodeExpandButton = () => getNodeTopologyButton(1);
            cy.setDeploymentContext(deploymentId);

            cy.log('Check Topology widget');
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'terraform');
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'cloud_resources');

            cy.log('Check terraform module details');
            waitForDeploymentToBeInstalled(deploymentId);
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'terraform');
            cy.contains('#gridContainer > #gridSvg > #gridContent > .nodeContainer > .title', 'cloud_resources');
            getTerraformDetailsButton().should('not.have.css', 'visibility', 'hidden').click({ force: true });
            cy.get('.modal td:eq(0)').should('have.text', 'null_resource');
            cy.get('.modal td:eq(2)').should('have.text', 'provider["registry.terraform.io/hashicorp/null"]');
            cy.get('.modal tr:eq(1) td:eq(1)').should('have.text', 'foo1');
            cy.get('.modal tr:eq(2) td:eq(1)').should('have.text', 'foo2');
            cy.get('.modal tr:eq(1) td:eq(3)')
                .invoke('text')
                .then(rawData => {
                    const parsedData = JSON.parse(rawData);
                    expect(_.omit(parsedData, 'instances')).to.deep.equal({
                        provider: 'provider["registry.terraform.io/hashicorp/null"]',
                        type: 'null_resource',
                        mode: 'managed',
                        name: 'foo1'
                    });
                    expect(parsedData.instances.length).to.equal(2);
                    parsedData.instances.forEach((instance, i) => {
                        expect(_.omit(instance, 'attributes')).to.deep.equal({
                            schema_version: 0,
                            dependencies: ['null_resource.foo2'],
                            index_key: i
                        });
                        expect(_.size(instance.attributes)).to.equal(2);
                        expect(instance.attributes.id).to.match(/^\d+$/);
                        expect(instance.attributes.triggers).to.deep.equal({ cluster_instance_ids: 'dummy_id' });
                    });
                });
            cy.get('.modal tr:eq(2) td:eq(3)')
                .invoke('text')
                .then(rawData => {
                    const parsedData = JSON.parse(rawData);
                    expect(_.omit(parsedData, 'instances')).to.deep.equal({
                        provider: 'provider["registry.terraform.io/hashicorp/null"]',
                        type: 'null_resource',
                        mode: 'managed',
                        name: 'foo2'
                    });
                    expect(parsedData.instances.length).to.equal(1);
                    expect(_.omit(parsedData.instances[0], 'attributes')).to.deep.equal({
                        schema_version: 0
                    });
                    expect(_.size(parsedData.instances[0].attributes)).to.equal(2);
                    expect(parsedData.instances[0].attributes.id).to.match(/^\d+$/);
                    expect(parsedData.instances[0].attributes.triggers).to.be.null;
                });
            cy.contains('Close').click();

            getTerraformNodeExpandButton().click({ force: true });
            cy.contains('.nodeContainer', 'foo1').contains('.plannedInstances', 2);
            cy.contains('.nodeContainer', 'foo2').contains('.plannedInstances', 1);
            cy.get('.connectorContainer').should('have.length', 2);

            getTerraformNodeExpandButton().click({ force: true });
            cy.contains('foo1').should('not.exist');
            cy.contains('foo2').should('not.exist');
            cy.get('.connectorContainer').should('have.length', 1);
        });
    });

    describe('provides support for component nodes', () => {
        const appDeploymentId = 'app';
        const componentDeploymentId = 'component';
        const getGoToDeploymentPageButton = () => getNodeTopologyButton(0);
        const getComponentNodeExpandButton = () => getNodeTopologyButton(1);
        const waitForTopologyWidgetToBeReadyAfterFetch = () => {
            cy.intercept(`/console/bud/layout/${appDeploymentId}`).as('fetchLayout');

            cy.log('Waiting for topology data to be fetched');
            cy.wait('@fetchLayout', { requestTimeout: secondsToMs(2 * pollingTimeSeconds) });
            cy.waitUntilPageLoaded();

            cy.log('Waiting until animation in topology canvas is finished');
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2000);

            cy.log('Unlocking topology canvas to be interactive');
            cy.get('.scrollGlass').click();
        };

        before(() => {
            const blueprintFile = 'blueprints/component_app.zip';
            const componentBlueprintId = 'component';
            const componentBlueprintYamlFile = 'component.yaml';
            const appBlueprintId = 'app';
            const appBlueprintYamlFile = 'app.yaml';

            // NOTE: Do not mock login to load all currently available pages and test drill-down to site
            cy.login()
                .deleteBlueprint(componentBlueprintId, true)
                .deleteBlueprint(appBlueprintId, true)
                .uploadBlueprint(blueprintFile, componentBlueprintId, componentBlueprintYamlFile)
                .uploadBlueprint(blueprintFile, appBlueprintId, appBlueprintYamlFile)
                .deployBlueprint(appBlueprintId, appDeploymentId)
                .executeWorkflow(appDeploymentId, 'install');
            waitForDeploymentToBeInstalled(appDeploymentId);
        });

        beforeEach(() => {
            cy.visitPage('Test Page');
            cy.setDeploymentContext(appDeploymentId);
            waitForTopologyWidgetToBeReadyAfterFetch();
        });

        it('allows to open component deployment page', () => {
            getGoToDeploymentPageButton().click();

            cy.verifyLocation(
                `/console/page/test_page_deployment/${componentDeploymentId}`,
                { deploymentId: componentDeploymentId },
                componentDeploymentId
            );
        });

        it('allows to expand component node', () => {
            getComponentNodeExpandButton().click();

            cy.contains(`host(${componentDeploymentId}`).should('be.visible');
        });
    });
});
