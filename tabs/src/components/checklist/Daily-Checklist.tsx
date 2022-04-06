
import {
    Form,
    FormInput,
    FormButton,
    Grid,
    Box,
    List,
    Button,
    Divider,
    Input,
    TextArea,
    Checkbox,
    CloseIcon,
    Flex,
    Breadcrumb,
    Label,
    CallVideoIcon,
    FilesPdfIcon
} from '@fluentui/react-northstar'
import { FC, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from '../../firebase-config';
import { navigateBack } from "@microsoft/teams-js";
import { connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import toast, { Toaster } from 'react-hot-toast';

import "./Create-Checklist.css";
import { CheckList, CheckListItem, ChecklistUser } from '../../models/checklist';
import { TeamsUserCredential } from '@microsoft/teamsfx';
import { useData } from '../sample/lib/useData';
import { useTeamsFx } from '../sample/lib/useTeamsFx';
import { async } from '@firebase/util';


export default function DailyChecklist() {

    const [name, setName] = useState<string>('')

    const [totalItemCount, setTotalItemCount] = useState<number>(0);

    const [checkedItemCount, setCheckedItemCount] = useState<number>(0);

    const [checklist, setChecklist] = useState<CheckList>({})
    const [mappedQuestions, setMappedQuestions] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>(false); // flag to re-render the questions after any change
    const checklistCollection = collection(db, "checklist");

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);

    const { isInTeams } = useTeamsFx();
    const userProfile = useData(async () => {
        const credential = new TeamsUserCredential();


        return isInTeams ? await credential.getUserInfo() : undefined;
    })?.data;
    const userName = userProfile ? userProfile.displayName : "";
    const userId = userProfile ? userProfile.objectId : null;

    var checklistUserDocId: string = "";

    useEffect(() => {
        const getChecklist = async () => {
            const docRef = doc(db, "checklist", id!);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }

            var obj: CheckList = {
                id: docSnap.id,
                name: docSnap.data()!.name,
                items: docSnap.data()!.items
            }

            setChecklist(obj);

            setTotalItemCount(obj.items?.length!);

            const quizResultsCollections = collection(db, "checklist-user");

            var now = new Date();

            var dateString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear();

            const q = query(quizResultsCollections, where("userId", "==", userId), where("checklistId", "==", id), where("date", "==", dateString));

            const unsubQuizResults = onSnapshot(q, async (data) => {
                var lessArray = Array<any>();

                if (!data.empty) {
                    data.docs.forEach(doc => {

                        console.log(doc.id, "=>", doc.data());

                        checklistUserDocId = doc.id;

                    })

                    const checklistdocRef = doc(db, "checklist-user", checklistUserDocId);

                    const checklistdocSnap = await getDoc(checklistdocRef);

                    var checklistDocData = checklistdocSnap.data() as any;

                    var checkedItems = checklistDocData.checkedItems as any[];

                    var checkedItemsCount = 0;

                    if (checkedItems) {
                        var filteredCheckedItems = checkedItems.filter(v => v.isChecked == true);

                        checkedItemsCount = filteredCheckedItems.length;
                    }




                    let tempQuestions = obj?.items?.map((item, checkIndex) => {

                        var isChecked = false;

                        var fileUrl = "";

                        if (checkedItems) {



                            checkedItems.forEach(dataItem => {

                                if (dataItem.checklistItemId == item.checklistItemId) {
                                    isChecked = dataItem.isChecked;
                                    fileUrl = dataItem.fileUrl;

                                }

                            })
                        }


                        return (
                            <>
                                <Checkbox checked={isChecked} onChange={async (e, data) => {

                                    if (checklistdocSnap.exists()) {
                                        console.log("Document data:", checklistdocSnap.data());

                                        var docData = checklistdocSnap.data() as any;

                                        var checkedItems = docData.checkedItems as any[];

                                        if (checkedItems) {

                                            var isFind = false;

                                            checkedItems.forEach(checkItem => {

                                                if (checkItem.checklistItemId == item.checklistItemId) {
                                                    checkItem.isChecked = data?.checked;
                                                    isFind = true;
                                                }

                                            })

                                            if (!isFind) {

                                                var checkedItem = {
                                                    isChecked: data?.checked,
                                                    timestamp: Timestamp.fromDate(new Date()),
                                                    checklistItemId: item.checklistItemId!
                                                }

                                                checkedItems.push(checkedItem);

                                            }

                                            docData.checkedItems = checkedItems;
                                            await setDoc(checklistdocRef, docData);

                                        } else {

                                            var checkedItems = [];

                                            var checkedItem = {
                                                isChecked: data?.checked,
                                                timestamp: Timestamp.fromDate(new Date()),
                                                checklistItemId: item.checklistItemId!
                                            }

                                            checkedItems.push(checkedItem);

                                            docData.checkedItems = checkedItems;
                                            await setDoc(checklistdocRef, docData);

                                        }

                                    } else {
                                        // doc.data() will be undefined in this case
                                    }





                                }} label={item.text} key={`CheckLabel-${checkIndex}-${item.id}`} placeholder="Type here something about your new task..." id="first-name-inline" />

                                <Input id={item.checklistItemId} icon={<FilesPdfIcon />} type={'file'} onChange={OnFileChange} ></Input>



                            </>
                        )
                    })
                    setMappedQuestions(tempQuestions);

                    setCheckedItemCount(checkedItemsCount);



                } else {

                    var checklistUser: ChecklistUser = {
                        userId: userId!,
                        date: dateString,
                        checklistId: obj.id!,
                        timestamp: Timestamp.fromDate(new Date())
                    }

                    const newChecklistUserRef = doc(collection(db, "checklist-user"));

                    console.log(checklistUser);

                    setDoc(newChecklistUserRef, checklistUser).then(res => {
                        notifyMessage("Daily record created");
                    })

                }



            });



            const nameInput = document.querySelector('#name') as any;
            nameInput.value = obj.name;



        }

        getChecklist();





    }, [])

    function OnFileChange(event: any) {
        let file = event.target.files[0] as File

        var checklistItemId = event.target.id;
        // Update the state


        var name = file?.name;
        console.log(file)

        const storage = getStorage();
        const storageRef = ref(storage, 'teams/' + name);

        const uploadTask = uploadBytesResumable(storageRef, file);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion

        uploadTask.on('state_changed',
            (snapshot: any) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded

                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                console.log('Upload is ' + progress + '% done');

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error: any) => {
                // Handle unsuccessful uploads
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL: any) => {
                    var videoUrl = downloadURL;

                    console.log('File available at', downloadURL);

                    const checklistdocRef = doc(db, "checklist-user", checklistUserDocId);

                    const checklistdocSnap = await getDoc(checklistdocRef);

                    var checklistDocData = checklistdocSnap.data() as any;

                    var checkedItems = checklistDocData.checkedItems as any[];

                    if (checkedItems) {
                        checkedItems.forEach(dataItem => {

                            if (dataItem.checklistItemId == checklistItemId) {
                                dataItem.fileUrl = videoUrl;

                                setDoc(checklistdocRef, dataItem).then(res => {
                                    notifyMessage('file uploaded');
                                })

                            }

                        })
                    }



                });
            }
        );



    };




    // Boş bir soru oluşturuyor
    function addNewItem() {

        if (!checklist.items) {
            checklist.items = [];
        }

        setRerenderQuestions(true)
        var checkListItems: CheckListItem = {
            text: ''
        }

        checklist?.items?.push(checkListItems);
        console.log(`${checklist}`)
    }


    const navigateTo = () => history.push('/list-check');

    const notify = () => toast('Created successfully');

    const notifyMessage = (message: string) => toast(message);

    async function createQuizForm() {
        console.log(checklist);

        checklist.timestamp = Timestamp.fromDate(new Date());
        checklist.name = name;

        const newCityRef = doc(collection(db, "checklist"));

        console.log(checklist);

        await setDoc(newCityRef, checklist);

        notify();

        setTimeout(() => {
            navigateTo();
        }, 1500)
    }

    function handleButtonClick() {
        createQuizForm().then(() => {
            navigateBack();
        })
    }

    const history = useHistory();


    var color = 'orange';



    return (

        <div className="container">


            <Grid columns={1}
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >




                <Form >
                    <Toaster />
                    <Input fluid label="Check List Name" onChange={(e, data) => { setName(data?.value!) }} placeholder='Please give a name' name="name" id="name" inline required />

                    <span key={'orange'}>
                        <Label color={color} content={checkedItemCount + "/" + totalItemCount} />{' '}
                    </span>

                    <Divider></Divider>

                    {mappedQuestions}

                    <Flex>

                        <br></br>
                        <Button fluid onClick={() => {
                            history.push('/list-check');
                        }} type="button" content="Back" />
                    </Flex>
                </Form>

            </Grid>


        </div>



    )

}

