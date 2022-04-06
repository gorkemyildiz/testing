import {FC} from "react";
import microsoftTeams from "@microsoft/teams-js";
type Props = {}
export default function SetLocationWithMap () {

    let locationProps= {"allowChooseLocation":true,"showMap":true};
    microsoftTeams.location.getLocation(locationProps, (err: microsoftTeams.SdkError, location: microsoftTeams.location.Location) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(location + "konum bu")
        return location
    });
    return ""

}
