import React from "react";
import {collection, getDoc,getDocs, onSnapshot, orderBy, query, where} from "firebase/firestore";
import {db} from "../../firebase-config";
import {gridCellWithFocusableElementBehavior} from "@fluentui/react-northstar";
import {WorkSpace} from "../../models";

export  async function GetWorkSpaces () {
            const path =  "CheckInOut/" + "companyName/"+"WorkSpaces/"
            const workspaceCollection = collection(db, path);
            const data = await getDocs(workspaceCollection)
    var workSpacesArray = Array<WorkSpace>();
    data.docs.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
        workSpacesArray.push({
            workSpace:doc.data().workSpace,
            qrCodeCheckIn:doc.data().qrCodeCheckIn,
            qrCodeCheckOut:doc.data().qrCodeCheckOut,
            gpsLocation: doc.data().gpsLocation,
            exceptedOffsetLocation:doc.data().exceptedOffsetLocation,
            exceptedOffsetTime:doc.data().exceptedOffsetTime
        })
    })
    console.log(workSpacesArray)
    return workSpacesArray
}