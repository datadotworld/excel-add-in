# data.world Excel Add-In

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the react app and server component in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view the front end UI in the browser.
The server will be launched at http://localhost:3001 by default.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

React Front End Required Environment Variables:

`REACT_APP_OAUTH_URI`: Endpoint for the OAuth authorization endpoint.  In production this should be `/authorize`

Server Side Required Environment Variables

`OAUTH_REDIRECT_URI`: Must match exactly the redirect setup on the data.world client  
`OAUTH_CLIENT_ID`: Client id for the data.world OAuth Client  
`OAUTH_CLIENT_SECRET`: Client secret for the data.world OAuth Client  

Server Side Optional Environment Variables
`OAUTH_AUTHORIZATION_ENDPOINT`: Allows for overriding the authorization endpoint.  Defaults to `https://data.world`

When testing locally `HTTPS=true` must be set as the Office online site will not load an add-in via http.

`HTTPS=true REACT_APP_OAUTH_URI=https://localhost:3001/authorize OAUTH_REDIRECT_URI=https://localhost:3001/callback OAUTH_CLIENT_ID=excel-add-in-local OAUTH_CLIENT_SECRET=XXXX yarn start`

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

# Useful Links

1. https://dev.office.com/reference/add-ins/excel/application
1. https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview?product=excel
1. https://dev.office.com/docs/add-ins/overview/add-in-manifests
