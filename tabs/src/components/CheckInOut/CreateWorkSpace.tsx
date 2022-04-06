import {FC, useState} from "react";
import {Flex, Segment, Button,TextArea,Input} from "@fluentui/react-northstar";
import {addDoc,setDoc, collection,doc} from "firebase/firestore";
import {db} from "../../firebase-config";
import GenarateQrCode from "./GenerateQrCode";
import {useHistory} from "react-router-dom";
import {WorkSpace} from "../../models";
import SetLocationWithMap from "./SetLocationWithMap";
import {GoogleMapLocation} from "./GoogleMapLocation";
type Props = {
    setOpen:Function
    newWorkSpaceCaller:Function
}


const CreateWorkSpace : FC<Props>= ({
    setOpen = () => console.log("empty"),
                                        newWorkSpaceCaller = (workSpace:WorkSpace) => console.log("empty")
                                    }) => {

    const history = useHistory();
    const [gpsLocation, setGpsLocation] = useState<string>(() => '');
    const [workSpaceName, setWorkSpaceName] = useState<string>(() => '');
    const [exceptedOffsetLocation, setExceptedOffsetLocation] = useState<number>(() => 0);
    const [exceptedOffsetTime, setExceptedOffsetTime] = useState<number>(() => 0);
    const setLocation = () => {
        setGpsLocation(SetLocationWithMap)
    }
    const  createNewWorkSpace = async() => {

        const path = "CheckInOut/" + "companyName/" +"WorkSpaces/" ;
        const qrCodeCollection = doc(db,path,workSpaceName)
        const newWorkSpace:WorkSpace = {
            workSpace:workSpaceName,
            qrCodeCheckIn:await GenarateQrCode(`${workSpaceName}%in`),
            qrCodeCheckOut:await GenarateQrCode(`${workSpaceName}%out`),
            gpsLocation: "",
            exceptedOffsetLocation:exceptedOffsetLocation,
            exceptedOffsetTime:exceptedOffsetTime
        }
        await setDoc(qrCodeCollection,newWorkSpace);
        newWorkSpaceCaller(newWorkSpace)
        setOpen()
     //   history.push('/check-in-out'
           }
    return (
        <div className="container">
             <Flex gap="gap.small" column> 
                 <h4>Work Space name :</h4>
                 <Input className= 'divInput' placeholder="Name  " onChange={(e, data) => { setWorkSpaceName(data?.value!) }} />
                 <h4>Excepted Offset location</h4>
                 <Input className= 'divInput' placeholder="Type Number " onChange={(e, data) => { setExceptedOffsetLocation(parseInt(data?.value!,10)) }} />
                 <h4>Write your excepted offset time if any</h4>
                 <Input className= 'divInput' placeholder="Type Number" onChange={(e, data) => { setExceptedOffsetTime(parseInt(data?.value!,10)) }} /> 

                <div style={{ marginTop : '1rem', marginBottom : '1rem'}}> <GoogleMapLocation /> </div>
            </Flex>    
            <Flex gap="gap.small" padding="padding.medium" style={{ backgroundColor: '#fff' }}>
                <Flex.Item size="size.half">
                    <Segment className='divSegment' style={{ boxShadow: 'none' }}>  
                            <Button onClick={setLocation} content='Set location' style={{ width : '100%', height : '3rem', boxShadow : 'none'}}/>          
                    </Segment>  
                </Flex.Item> 
                <Flex.Item size="size.half">
                    <Segment className='divSegment' style={{ boxShadow: 'none' }}>  
                        <Button onClick={createNewWorkSpace} content='Create ' style={{ width : '100%', height : '3rem', boxShadow : 'none'}}/>    
                    </Segment>  
                </Flex.Item> 
            </Flex>
           
        </div>
        )
}

export {CreateWorkSpace}