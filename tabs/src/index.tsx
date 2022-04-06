import { TeamsUserCredential } from "@microsoft/teamsfx";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "./index.css";
import {TeamsMsal2Provider, Providers} from "@microsoft/mgt";
import * as MSTeamsLibrary from "@microsoft/teams-js";
import {ProviderState} from "@microsoft/mgt";

TeamsMsal2Provider.microsoftTeamsLib = MSTeamsLibrary;

Providers.globalProvider = new TeamsMsal2Provider({
    clientId: '51378850-c982-4b05-a196-7e9f10b0494f',
    authPopupUrl: '#/auth',
    scopes: ['User.Read','User.ReadWrite.All','Team.ReadBasic.All'],
    msalOptions: {
        auth: {
            clientId: '51378850-c982-4b05-a196-7e9f10b0494f',
            redirectUri: "https://localhost:53000/auth-end.html?clientId=51378850-c982-4b05-a196-7e9f10b0494f"
        }
    }
})


ReactDOM.render(
    <App />, document.getElementById("root")
);



