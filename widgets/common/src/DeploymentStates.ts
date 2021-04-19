import _ from 'lodash';

export default class DeploymentStates {
    static GOOD_STATE = 'good';

    static IN_PROGRESS_STATE = 'inProgress';

    static PENDING_STATE = 'pending';

    static FAILED_STATE = 'failed';

    static groupStates = {
        [DeploymentStates.GOOD_STATE]: {
            name: 'good',
            icon: 'checkmark',
            colorSUI: 'green',
            severity: 1,
            description: 'deployments with all nodes successfully started'
        },
        [DeploymentStates.IN_PROGRESS_STATE]: {
            name: 'in progress',
            icon: 'spinner',
            colorSUI: 'yellow',
            severity: 2,
            description: 'deployments in which active workflow execution is performed'
        },
        [DeploymentStates.PENDING_STATE]: {
            name: 'pending',
            icon: 'pause',
            colorSUI: 'blue',
            severity: 3,
            description: 'deployments with non-started nodes'
        },
        [DeploymentStates.FAILED_STATE]: {
            name: 'failed',
            icon: 'close',
            colorSUI: 'red',
            severity: 4,
            description: 'deployments with failed workflow execution'
        }
    };

    static getDeploymentState(
        deploymentId: string,
        nodeInstanceData: Record<string, { states?: any; count?: number } | undefined>,
        lastExecution?: { status: string }
    ) {
        const nodeStates = _.get(nodeInstanceData[deploymentId], 'states', {});
        const nodeInstanceCount = _.get(nodeInstanceData[deploymentId], 'count', 0);

        if (Stage.Utils.Execution.isActiveExecution(lastExecution)) {
            return DeploymentStates.IN_PROGRESS_STATE;
        }
        if (Stage.Utils.Execution.isFailedExecution(lastExecution)) {
            return DeploymentStates.FAILED_STATE;
        }
        if (nodeStates.started === nodeInstanceCount) {
            return DeploymentStates.GOOD_STATE;
        }
        return DeploymentStates.PENDING_STATE;
    }
}

// NOTE: alias name to avoid name shadowing inside the namespace
const DeploymentsStatesAlias = DeploymentStates;
declare global {
    namespace Stage.Common {
        const DeploymentStates: typeof DeploymentsStatesAlias;
    }
}

Stage.defineCommon({
    name: 'DeploymentStates',
    common: DeploymentStates
});
