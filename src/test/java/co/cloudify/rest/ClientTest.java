package co.cloudify.rest;

import co.cloudify.rest.client.CloudifyClient;
import co.cloudify.rest.model.Plugin;

public class ClientTest {
	public static void main(String []args) throws Exception {
		String host = args[0];
		String username = args[1];
		String password = args[2];
		String tenant;
		if (args.length > 3) {
			tenant = args[3];
		} else {
			tenant = "default_tenant";
		}
		
		CloudifyClient client = CloudifyClient.create(host, username, password, false, tenant);
		Plugin upload = client.getPluginsClient().upload("/home/isaac/cfy/git/cloudify-terraform-plugin/cloudify_terraform_plugin-0.7-py27-none-linux_x86_64-centos-Core.wgn", "/home/isaac/cfy/git/cloudify-terraform-plugin/plugin.yaml");
		System.err.println(upload);
//		Blueprint upload = client.getBlueprintsClient().upload("mybp", new File("/mnt/cfy/blueprints/simple"), "blueprint.yaml");
//		System.err.println(upload);
//		try {
//			client.getExecutionsClient().start("m", "boo", null);
//		} catch (CloudifyClientException ex) {
//			ex.printStackTrace();
//			System.err.println(CloudifyClientExceptionData.fromCloudifyClientException(ex));
//		} finally {}
//		DeploymentsClient deploymentsClient = client.getDeploymentsClient();
//		try {
//			Deployment deployment = deploymentsClient.get("moeeee");
//			System.out.println(deployment);
//		} catch (CloudifyClientException ex) {
//			System.err.println(CloudifyClientExceptionData.fromCloudifyClientException(ex));
//		} finally {}
		
//		Blueprint bp = client.getBlueprintsClient().get("b");
//		System.out.println(bp.getPlan());
//		client.getBlueprintsClient().delete("b");
//		BlueprintsClient blueprintsClient = client.getBlueprintsClient();
//		Iterable<Blueprint> list = blueprintsClient.list();
//		Blueprint bp = list.iterator().next();
//		System.err.println(bp.getPlan().getInputs());
//		Deployment d = client.getDeploymentsClient().get("d");
//		System.out.println(d.getInputs());
//		Deployment e = client.getDeploymentsClient().create("f", "b", d.getInputs(), false);
//		System.out.println(e);
//		ExecutionsClient execClient = client.getExecutionsClient();
//		Execution execution = execClient.get("86cfdecb-7ee4-417c-aa88-486801148fde");
//		ExecutionsHelper.followExecution(client, execution, null);
//		EventsClient eventsClient = client.getEventsClient();
//		Iterable<Event> events = eventsClient.list(execution, true);
//		for (Event event: events) {
//			System.out.println(EventsHelper.formatEvent(event));
//		}
	}
}
