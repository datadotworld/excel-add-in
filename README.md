# data.world Excel Add-In

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

For testing locally, https must be enabled and the OAuth properties must be set in order to allow authentication.  This can be done by setting environment variables at runtime with the following:

`HTTPS=true REACT_APP_OAUTH_CLIENT_ID="datadotworld-excel-addon-test" REACT_APP_OAUTH_REDIRECT_URI="https://excel-addon-oauth.herokuapp.com/callback" yarn start`

This client is setup to redirect back to `https://localhost:3000` after successful authentication.

#### Testing against Office Online

1. Open `https://localhost:3000` in the browser and accept the self-signed cert
1. Open a spreadsheet in Excel Online
1. Click INSERT > Office Add-ins
1. Click Upload My Add-in
1. Click Browse... and browse to the `excel-add-in.xml` file located in this repo
1. Click Upload

#### Testing against Desktop Office for OSX

1. Open `https://localhost:3000` in Safari browser and accept the self-signed cert
1. Close Excel if it is open
1. Open a terminal and from the root of this repo, run `cp ./excel-add-in.xml ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/`
1. Open a spreadsheet in Excel
1. Click Insert
1. Click on the dropdown by the My Add-ins.  The add-in will only be available via the dropdown, not via the button which launches a new window to select an add-in.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.

# Open Questions

1. How to determine if someone has write access to the dataset?  Waiting on changes to public API.
1. It does not appear that icons/text on the ribbon buttons can be dynamic.
1. Can the bound section be highlighted or selected when a user hovers over the file it is linked to?

# Useful Links

1. https://dev.office.com/reference/add-ins/excel/application
1. https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview?product=excel
1. https://dev.office.com/docs/add-ins/overview/add-in-manifests