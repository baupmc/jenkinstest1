# Local HBASE VM Setup

To set up a development HBASE database, we will use a Cloudera QuickStart VM 
image until UPMC-configured HBASE/Hadoop development resources are availablle. 
The Cloudera Distribution Including Apache Hadoop (or CDH) contains many tools 
that we will not be using, but is quick and easy to configure and deploy on your 
local system. 

## Download and Run Cloudera QuickStart VM

You can download the zipped QuickStart VM [here](https://www.cloudera.com/downloads/quickstart_vms/5-10.html).
The version for VirtualBox is recommended as it fits in with the requirements 
for Docker and Minikube developement environments. 

After downloading and extracting the image, add the image to the list of 
available VMs by adding "Appliance" file for the image to VirtualBox 
(**File --> Import Appliance**). When the process completes, ensure that the VM 
is using a "Bridged" or "Host-only" network adapter in the VM's settings. This 
is required to easily acquire the VM's IP address for the host system.

With this completed, start the VM and wait for the Firefox browser with Cloudera 
information to appear. At this point, the VM is ready for use. You can acquire 
the IP address for the machine the same as you normally would on a Linux machine 
(**"ifconfig"** or **"ip addr show"**).

## Install and Start HBASE and HBASE REST

To install both HBASE and the HBASE REST services on the Cloudera VM, run these 
two commands from the terminal:

```
$ sudo yum install hbase-master
...
$ sudo yum install hbase-rest
```

NOTE: "hbase-rest" may already be installed.

Next, start the services with the following two commands:

```
$ sudo service hbase-master start
...
$ sudo service hbase-rest start
```

This will start the HBASE database services in "standalone" mode, meaning that 
the data is actually just saved in a VM-local file store rather than an actual 
Hadoop database. This is more than enough for our development purposes and 
requires nearly no additional configuration.

By default, the HBASE REST endpoints exist on port **8070**. You can change this 
by editing the **hbase-site.xml** file located at **/etc/hbase/conf** at the 
following location:

```xml
<property>
  <name>hbase.rest.port</name>
  <value>8070</value>
</property>
```

You can now access both the Cloudera HUE dashboard and the HBASE REST endpoints 
from your host system via the following addresses:

HUE Dashboard: **my_vm_ip:8888**

HBASE REST: **my_vm_ip:8070**

The default username/password for the HUE dashboard is **cloudera**/**cloudera**.

## Configure GalaxyAPI

Add your own VM's IP and port to GalaxyAPI's configuration file:

```javascript
hbaseTest: {
    hostname: '192.168.56.101',
    port: '8070'
},
```

After configuration is complete, you are free to use the [hbase-client-cli](https://www.npmjs.com/package/hbase-rest-cli) 
library to act on your new HBASE development instance. 

```javascript
const hbase = require('hbase-rest-cli');
const config = require("../config/config");
const GalaxyReturn = require('../models/galaxyreturn');

let client = new hbase({
    host: config.hbaseTest.hostname, 
    port: config.hbaseTest.port
});
client.get('analytics_demo', 'domain.0')
.then(rowResult => {
    response.status(200).json(new GalaxyReturn(rowResult, null));
});
```

You can also make requests directly to the HBASE REST endpoints, which you can 
find additional information on [here](https://www.cloudera.com/documentation/enterprise/5-9-x/topics/admin_hbase_rest_api.html). 
NOTE: All data returned from raw requests to HBASE REST will be Base64 encoded.