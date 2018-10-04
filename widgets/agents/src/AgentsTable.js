import CreateModal from '../../userManagement/src/CreateModal';

/**
 * Created by jakub.niezgoda on 04/10/2018.
 */

export default class AgentsTable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            error: null
        };
    }

    static MenuAction = {
        INSTALL_AGENT: 'install_agent',
        VALIDATE_AGENT: 'validate_agent',
        STOP_AGENT: 'stop_agent'
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.configuration, nextProps.configuration)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('agents:refresh', this._refreshData, this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('agents:refresh', this._refreshData);
    }

    _selectAgent(item) {
        let oldSelectedAgentId = this.props.toolbox.getContext().getValue('agentId');
        this.props.toolbox.getContext().setValue('agentId', item.id === oldSelectedAgentId ? null : item.id);
        if (item.id === oldSelectedAgentId) {
            this.props.toolbox.getContext().setValue('agentId', null);
        } else {
            this.props.toolbox.getContext().setValue('agentId', item.id);
        }
    }

    _actionClick(agent, proxy, {name}) {
        const MenuAction = AgentsTable.MenuAction;

        switch(name) {
            case MenuAction.INSTALL_AGENT:
                break;
            case MenuAction.VALIDATE_AGENT:
                break;
            case MenuAction.STOP_AGENT:
                break;
        }
    }

    render() {
        const NO_DATA_MESSAGE = 'There are no Agents available.';
        const configuration = this.props.configuration;
        const fieldsToShow = configuration.fieldsToShow;
        const totalSize = this.props.data.total > 0 ? undefined : 0;

        let {Button, DataTable, ErrorMessage, Menu, PopupMenu} = Stage.Basic;

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true} />

                <DataTable selectable={true} className="agentsTable" noDataMessage={NO_DATA_MESSAGE} totalSize={totalSize}>

                    <DataTable.Column label="Id"
                                      show={fieldsToShow.indexOf('Id') >= 0}/>
                    <DataTable.Column label="IP"
                                      show={fieldsToShow.indexOf('IP') >= 0}/>
                    <DataTable.Column label="Deployment"
                                      show={fieldsToShow.indexOf('Deployment') >= 0 &&
                                      !this.props.data.deploymentId && !this.props.data.nodeId && !this.props.data.nodeInstanceId}/>
                    <DataTable.Column label="Node"
                                      show={fieldsToShow.indexOf('Node') >= 0 &&
                                      !this.props.data.nodeId && !this.props.data.nodeInstanceId}/>
                    <DataTable.Column label="System"
                                      show={fieldsToShow.indexOf('System') >= 0}/>
                    <DataTable.Column label="Version"
                                      show={fieldsToShow.indexOf('Version') >= 0}/>
                    <DataTable.Column label="Install Method"
                                      show={fieldsToShow.indexOf('Install Method') >= 0}/>
                    <DataTable.Column show={fieldsToShow.indexOf('Actions') >= 0}/>

                    {
                        _.map(this.props.data.items, (item) =>
                            <DataTable.Row key={item.id} selected={item.isSelected} onClick={this._selectAgent.bind(this, item)}>
                                <DataTable.Data>{item.id}</DataTable.Data>
                                <DataTable.Data>{item.ip}</DataTable.Data>
                                <DataTable.Data>{item.deployment}</DataTable.Data>
                                <DataTable.Data>{item.node}</DataTable.Data>
                                <DataTable.Data>{item.system}</DataTable.Data>
                                <DataTable.Data>{item.version}</DataTable.Data>
                                <DataTable.Data>{item.install_method}</DataTable.Data>
                                <DataTable.Data className="center aligned">
                                    <PopupMenu className="menuAction">
                                        <Menu pointing vertical>
                                            <Menu.Item content='Install'
                                                       icon='download'
                                                       name={AgentsTable.MenuAction.INSTALL_AGENT}
                                                       onClick={this._actionClick.bind(this, item)} />
                                            <Menu.Item content='Validate'
                                                       icon='checkmark box'
                                                       name={AgentsTable.MenuAction.VALIDATE_AGENT}
                                                       onClick={this._actionClick.bind(this, item)} />
                                            <Menu.Item content='Stop'
                                                       icon='cancel'
                                                       name={AgentsTable.MenuAction.STOP_AGENT}
                                                       onClick={this._actionClick.bind(this, item)} />
                                        </Menu>
                                    </PopupMenu>
                                </DataTable.Data>
                            </DataTable.Row>
                        )
                    }

                    <DataTable.Action>
                        <Button content='Install' icon='download' labelPosition='left' onClick={_.noop}/>
                        <Button content='Validate' icon='checkmark' labelPosition='left' onClick={_.noop}/>
                    </DataTable.Action>

                </DataTable>

            </div>
        );
    }
}
