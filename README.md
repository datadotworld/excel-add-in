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

This client is setup to redirect back to localhost:3000 after successful authentication.

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

# Useful Links

1. https://dev.office.com/reference/add-ins/excel/application
1. https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview?product=excel
1. https://dev.office.com/docs/add-ins/overview/add-in-manifests