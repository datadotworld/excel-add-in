# Contributing Guidelines

## General

* Contributions of all kinds (issues, ideas, proposals), not just code, are highly appreciated.
* Pull requests are welcome with the understanding that major changes will be carefully evaluated 
and discussed, and may not always be accepted. Starting with a discussion is always best!
* All contributions including documentation, filenames and discussions should be written in English language.

## Issues

Our [issue tracker](https://github.com/datadotworld/excel-add-in/issues) can be used to report 
issues and propose changes to the current or next version of the data.world Excel add-in.

## Contribute Code

### Review Relevant Docs

* [data.world API](https://docs.data.world/documentation/api)
* https://dev.office.com/reference/add-ins/excel/application
* https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview?product=excel
* https://dev.office.com/docs/add-ins/overview/add-in-manifests

### Set up machine

Install:

* NodeJS
* npm
* yarn

### Fork the Project

Fork the [project on Github](https://github.com/datadotworld/excel-add-in) and check out your copy.

```
git clone https://github.com/[YOUR_GITHUB_NAME]/excel-add-in.git
cd excel-add-in
git remote add upstream https://github.com/datadotworld/excel-add-in.git
```

### Install and Test

Ensure that you can build the project and run tests.

Install dependencies:
```bash
yarn
```

Run tests:
```bash
yarn test
```

### Create a Feature Branch

Make sure your fork is up-to-date and create a feature branch for your feature or bug fix.

```bash
git checkout master
git pull upstream master
git checkout -b my-feature-branch
```

### Write Tests

Try to write a test that reproduces the problem you're trying to fix or describes a feature that 
you want to build. Add tests to [tests](tests).

We definitely appreciate pull requests that highlight or reproduce a problem, even without a fix.

### Test your changes in Excel Online and Excel Desktop

#### Run locally

##### `yarn start`

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

#### Testing against Office Online

1. Open `https://localhost:3000`, and `https://localhost:3001` in the browser and accept the self-signed certificates
1. Open a spreadsheet in Excel Online
1. Click INSERT > Office Add-ins
1. Click Upload My Add-in
1. Click Browse... and browse to the `excel-add-in_local.xml` file located in this repo
1. Click Upload

#### Testing against Desktop Office for OSX

1. Open `https://localhost:3000`, and `https://localhost:3001` in Safari and accept the self-signed certificates
1. Close Excel if it is open
1. If the `wef` directory here `~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/` does not exist, then create it
1. Open a terminal and from the root of this repo, run `cp ./excel-add-in_local.xml ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/`
1. Open a spreadsheet in Excel
1. Click Insert
1. Click on the dropdown by the My Add-ins.  The add-in will only be available via the dropdown, not via the button which launches a new window to select an add-in.

### Write Code

Implement your feature or bug fix.

Make sure that `yarn test` completes without errors.

### Write Documentation

Document any external behavior in the [README](README.md).

### Commit Changes

Make sure git knows your name and email address:

```bash
git config --global user.name "Your Name"
git config --global user.email "contributor@example.com"
```

Writing good commit logs is important. A commit log should describe what changed and why.

```bash
git add ...
git commit
```

### Push

```bash
git push origin my-feature-branch
```

### Make a Pull Request

Go to <https://github.com/[YOUR_GITHUB_NAME]/excel-add-in> and select your feature branch. 
Click the 'Pull Request' button and fill out the form. Pull requests are usually reviewed within 
a few days.

## Thank you!

Thank you in advance, for contributing to this project!