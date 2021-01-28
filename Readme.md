# GHomeTemplate

GHomeTemplate is meant to be the starting point for creating a NodeJS Server to manage Google Home Smart devices.

## Installation

### Install dependencies
Use the package manager [npm](https://www.npmjs.com/package/npm) to install GHomeTemplate.

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

Use [ngrok](https://ngrok.com/) to export the local port. Just for testing purposes.
```bash
./ngrok authtoken <your-token>
./ngrok http 3000 #Or your choosed port
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)