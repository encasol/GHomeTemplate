# GHomeTemplate

GNome Template is meant to be the starting point for creating a NodeJS Server to manage Google Home Smart devices. You just need to add a device implementing the IDevice interface.  Then add it to the dependency injector (src/utils/inversify.config.ts) and to the Device Provider  (src/devices/device-provider.ts).

## Installation

### Install dependencies
Use the package manager [npm](https://www.npmjs.com/package/npm) to install dependencies.

```bash
npm install
```

### Create the Google Developer Project
- Go to the Actions on [Google Developer Console](http://console.actions.google.com/).
- Click New Project, enter a name for the project, and click CREATE PROJECT.
- On the Overview screen in the Actions console, select Smart home.
- Choose the Smart home experience card, and you will then be directed to your project console.

### Enable HomeGraph API
- The HomeGraph API enables the storage and querying of devices and their states within a user's Home Graph. To use this API, you must first open the Google Cloud console and enable the HomeGraph API.
- In the Google Cloud console, make sure to select the project that matches your Actions <project-id>. Then, in the API Library screen for the HomeGraph API, click Enable.

## Usage

Start the server
```bash
npm start
```
### Test on your local enviroment
Use [ngrok](https://ngrok.com/) to export the local port.
```bash
./ngrok authtoken <your-token>
./ngrok http 3000 #Or your choosed port
```

#### Configure Actions console project
- Under Overview > Build your Action, select Add Action(s). Enter the URL for your cloud function that provides fulfillment for the smart home intents and click Save.
```bash
https://<ngrok-url>/smarthome
```
- On the Develop > Invocation tab, add a Display Name for your Action, and click Save. This name will appear in the Google Home app.
- To enable Account linking, select the Develop > Account linking option in the left navigation. Use these account linking settings:
```bash
Client ID: ABC123
Client secret: DEF456
Authorization URL: https://<ngrok-url>/fakeauth
Token URL: https://<ngrok-url>/faketoken
```
- Click Save to save your account linking configuration, then click Test to enable testing on your project.


#### Link to Google Assistant
In order to test your smart home Action, you need to link your project with a Google account. This enables testing through Google Assistant surfaces and the Google Home app that are signed in to the same account.
- On your phone, open the Google Assistant settings. Note that you should be logged in as the same account as in the console.
- Navigate to Google Assistant > Settings > Home Control (under Assistant).
- Select the plus (+) icon in the bottom right corner
- You should see your test app with the [test] prefix and the display name you set.
- Select that item. The Google Assistant will then authenticate with your service and send a SYNC request, asking your service to provide a list of devices for the user.
- Open the Google Home app and verify that you can see your washer device.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)