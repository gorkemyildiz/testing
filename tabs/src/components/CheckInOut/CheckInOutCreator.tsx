import {
    BookmarkIcon,
    Button,
    EditIcon,
    Flex,
    Segment,
    gridCellMultipleFocusableBehavior,
    Input,
    Table,
} from "@fluentui/react-northstar"; 
import { BackIcon } from '@fluentui/react-icons-mdl2';
import React, {FC, useEffect, useState} from "react"
import {useHistory} from "react-router-dom";
import { collection, doc, getDoc,addDoc, onSnapshot, orderBy, query, where,updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import {CheckInOut, user, WorkSpace} from "../../models";
import GenarateQrCode from "./GenerateQrCode";
import {CreateWorkSpace} from "./CreateWorkSpace";
import TimePicker from 'react-time-picker'
import {Login} from "@microsoft/mgt-react";
import {ChooseUsers} from "./ChooseUsers";
import {addNewWorkSpace, WorkSpacePicker} from "./WorkSpacePicker";
import {ITag} from "@fluentui/react";
import './CheckInOutCreator.css';
type Props = {}

const CheckInOutCreator: FC<Props> = ({}) => {
    const [selectedUsers, setSelectedUsers] = useState<ITag[]>([])
    function setUsers(users:any) {
        setSelectedUsers(users)
    }
    const history = useHistory();
    const [clickedButton, setClickedButton] = useState<string>(() => '');
    const [checkInOut, setCheckInOut]  = useState();
    const [checkInTime, setCheckInTime] = useState(new Date());
    const [checkOutTime, setCheckOutTime] = useState(new Date());
    const [openCreateWorkSpace, setOpenCreateWorkSpace] = useState<boolean>(() => false);

    const navigateTo = () => history.push('/check-in-out')
    function openWorkspace(): void {
        if(openCreateWorkSpace===false)
        {
            setOpenCreateWorkSpace(true)
        }
        else {
            setOpenCreateWorkSpace(false)
        }
    }
    function newWorkSpace(workspace:WorkSpace): void {
        addNewWorkSpace(workspace)
    }
    function createCheckInOut () {
        const newCheckInOut = {
            assigned_users:selectedUsers,
            creator:"",
            work_space:[],
            create_date:new Date(),
            check_out_time:checkOutTime,
            check_in_time:checkInTime,
        }
    }
    return (
        <div className="container">
            <Flex gap="gap.small"> 
                 <Button className="backBtn" style={{  marginTop: '1.2rem'}} onClick={navigateTo}><BackIcon /></Button> 
             
                <h2>Create New Workspace</h2>
            </Flex> 

            <Flex gap="gap.small">    
                <Flex style={{ width: '50%', border: '1px solid rgb(91 95 199 / 37%)', backgroundColor: '#fff' }}>
                        <Flex gap="gap.small" style={{ justifyContent: 'center', width: '100%', backgroundColor: '#fff' }}> 
                            <Flex.Item>
                                <Segment className='divSegment' style={{ boxShadow: 'none', margin : 'auto' }}> 
                                {openCreateWorkSpace ? <CreateWorkSpace setOpen={openWorkspace} newWorkSpaceCaller={newWorkSpace}/>:  <Button onClick={openWorkspace} content='Create new Workspace'/>}
                                </Segment>
                            </Flex.Item>
                        </Flex>
                        <br></br>
                </Flex>
                <Flex style={{ width: '50%', border: '1px solid rgb(91 95 199 / 37%)', backgroundColor: '#fff' }} column>
                        <Flex gap="gap.small" style={{ justifyContent: 'center', width: '100%', backgroundColor: '#fff',  margin : 'auto'   }}> 
                            <Flex.Item>
                                <Segment className='divSegment' style={{ boxShadow: 'none' }}>  
                                     <WorkSpacePicker/> 
                                      <div style={{ marginTop : '1rem'}}> <Login /> </div>
                                     <ChooseUsers setUsers={setUsers}/>
                                </Segment> 
                            </Flex.Item>  
                        </Flex>  
                        <Flex gap="gap.small" padding="padding.medium" style={{ backgroundColor: '#fff',  margin : 'auto', width : '100%'  }}>
                            <Flex.Item size="size.half">
                                <Segment className='divSegment' style={{ boxShadow: 'none' }}> 
                                <h4>Choose Check in time</h4> 
                                    <TimePicker value ={checkInTime}
                                            
                                            onChange = {(onChangeInput:any) => setCheckInTime(onChangeInput)}
                                            amPmAriaLabel="Select AM/PM"
                                            clearAriaLabel="Clear value"
                                            clockAriaLabel="Toggle clock"
                                            hourAriaLabel="Hour"
                                            maxDetail="second"
                                            minuteAriaLabel="Minute"
                                            nativeInputAriaLabel="Time"
                                            />
                                </Segment>  
                            </Flex.Item> 
                            <Flex.Item size="size.half">
                                <Segment className='divSegment' style={{ boxShadow: 'none' }}> 
                                    <h4>Choose Check out time </h4> 
                                    <TimePicker value ={checkInTime}
                                            onChange = {(onChangeInput:any) => setCheckInTime(onChangeInput)}
                                            amPmAriaLabel="Select AM/PM"
                                            clearAriaLabel="Clear value"
                                            clockAriaLabel="Toggle clock"
                                            hourAriaLabel="Hour"
                                            maxDetail="second"
                                            minuteAriaLabel="Minute"
                                            nativeInputAriaLabel="Time"/>
                                </Segment>  
                            </Flex.Item> 
                            <Flex.Item size="size.half">
                                <Segment className='divSegment' style={{ boxShadow: 'none' }}>  
                                    <h4>Choose repeatation time </h4>
                                    <TimePicker value ={checkInTime}
                                            onChange = {(onChangeInput:any) => setCheckInTime(onChangeInput)}
                                            amPmAriaLabel="Select AM/PM"
                                            clearAriaLabel="Clear value"
                                            clockAriaLabel="Toggle clock"
                                            hourAriaLabel="Hour"
                                            maxDetail="second"
                                            minuteAriaLabel="Minute"
                                            nativeInputAriaLabel="Time"/>
                                </Segment>  
                            </Flex.Item> 
                        </Flex> 
                </Flex>
            </Flex> 
            <Flex gap="gap.small" padding="padding.medium" style={{ marginTop : '2rem' }}>
                <Flex.Item size="size.half">
                    <Segment style={{ backgroundColor : 'transparent', boxShadow : 'none', textAlign : 'right'}}>   
                            <Button style={{ width : '100%', height : '3rem', boxShadow : 'none', fontWeight : '600'}}  onClick={navigateTo}><BackIcon style={{ marginRight :'1rem'}} />Back</Button>    
                    </Segment>  
                </Flex.Item> 
                <Flex.Item size="size.half">
                    <Segment style={{ backgroundColor : 'transparent', boxShadow : 'none', textAlign : 'left'}}>  
                        <Button content='Create ' style={{ width : '100%', height : '3rem', boxShadow : 'none'}}/>    
                    </Segment>  
                </Flex.Item> 
            </Flex>
        </div>

    )
}

export { CheckInOutCreator }