import { Card, CardHeader, Flex, Avatar, CardBody, Image, List, Divider, Button, CallVideoIcon, Breadcrumb, Slider, Input, BookmarkIcon, VideomailIcon, TrashCanIcon, gridCellMultipleFocusableBehavior, Table } from "@fluentui/react-northstar";
import React, { useCallback, useRef } from "react";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { db, getDownloadURL, getStorage, ref, uploadBytesResumable } from "../../../firebase-config";
import { LessonVideo, QuizQuestion } from "../../../models/learning";
import "./New-Video.css";
import Dropzone from "react-dropzone";
import { collection, getDocs, addDoc, doc, getDoc, query, where, deleteDoc, onSnapshot, Timestamp } from "firebase/firestore"
import { ProgressBar } from "react-bootstrap";
import { Modal, Overlay, Spinner, SpinnerSize } from '@fluentui/react';
import { BackIcon, UploadIcon } from "@fluentui/react-icons-mdl2";
import { DefaultButton } from '@fluentui/react/lib/Button'; 
import { AcceptIcon, ChromeCloseIcon}  from '@fluentui/react-icons-mdl2';
import { UploadTaskSnapshot } from "firebase/storage";

export default function AddNewVideo() {

    const history = useHistory();

    const videoCollection = collection(db, "videos");

    const [lessonVideos, setLessonVideos] = React.useState(Array<LessonVideo>());
    const [selectedFile, setSelectedFile] = useState<File>();

    const [videoUrl, setVideoUrl] = useState();
    const [uploadText, setUploadText] = useState("Drag and drop some files here, or click to select files");
    const [uploaded, setUploaded] = useState(false)

    const [loading, setLoading] = useState(false)
    const [uploadProgression, setUploadProgression] = useState<number>(0);


    const [lesson, setLesson] = useState({} as any);

    const [videos, setVideos] = React.useState(Array<any>());

    const [lessonName, setLessonName] = useState('')

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);


    const fileInputRef = useRef<any>();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    function resetFileInput() {
        fileInputRef.current.value = "";
    }


    if (id) {
        var lessonVideo: LessonVideo = {};
        lessonVideo.lessonId = id;
    }

    useEffect(() => {
        const getLesson = async () => {
            const docRef = doc(db, "lessons", id!);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }

            var obj = {
                id: docSnap.id,
                lessonName: docSnap.data()!.lessonName
            }

            setLesson(obj);

        }

        getLesson();

    }, [])

    React.useEffect(() => {

        const q = query(videoCollection, where("lessonId", "==", id));

        const unsub = onSnapshot(q, (data) => {
            var lessArray = Array<any>();

            data.docs.forEach(doc => {

                console.log(doc.id, "=>", doc.data());
                lessArray.push({
                    id: doc.id,
                    name: doc.data().name,
                    lessonId: doc.data().lessonId,
                    videoUrl: doc.data().videoUrl != null ? doc.data().videoUrl : null
                })

            })

            setLessonVideos(lessArray);


        });

    }, [])


    // On file select (from the pop up)
    function OnFileChange(event: any) {
        let file = event.target.files[0] as File
        // Update the state
        setSelectedFile(file)

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
                setUploadProgression(progress)
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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
                    lessonVideo.videoUrl = downloadURL;
                    setVideoUrl(downloadURL);
                    console.log('File available at', downloadURL);
                    setUploaded(true)


                });
            }
        );



    };


    const header = {
        key: 'header',
        items: [
            { content: 'Video Name', key: 'name' },
            { content: 'Actions', key: 'pic' },
        ],
    };

    async function deleteVideo(id: any) {
        await deleteDoc(doc(db, "videos", id));

    }

    function onChangeLessonName(event: any) {

        setLessonName(event.target.value);

        event.preventDefault();

    }

    async function onFileUpload() {

        setLoading(true);

        lessonVideo.name = lessonName;

        lessonVideo.videoUrl = videoUrl;

        lessonVideo.timestamp = Timestamp.fromDate(new Date())

        await addDoc(videoCollection, lessonVideo)

        setLoading(false);

        resetFileInput();

        setLessonName('');


    };

    function actionCell(id: any) {
        return {
            content: (
                <Flex gap="gap.small" vAlign="center">

                    <Button icon={<TrashCanIcon />} text iconOnly title="Delete Video" onClick={() => deleteVideo(id)} />
                    {/* table layout not support now more content in the cell */}
                    {/* <Button tabIndex={-1} icon="edit" circular text iconOnly title="edit tags" /> */}
                </Flex>
            ),
            accessibility: gridCellMultipleFocusableBehavior
        };
    }

    var rows = lessonVideos.map((item, index) => {
        var plan = {
            key: item.id,
            items: [
                { key: 'lessonName', content: item.name },
                { key: 'actions', ...actionCell(item.id) }
            ]
        }

        return plan;
    })

    const [showProcessOverlay, setShowProcessOverlay] = useState<boolean>(false); 
    const [processFinished, setProcessFinished] = useState<boolean>(true);

    const showModal = () => setIsModalOpen(true)
    const hideModal = () => setIsModalOpen(false)
    const handleOnDrop = useCallback((acceptedFiles: any) => {
        if (acceptedFiles === null)
            return

        let file = acceptedFiles[0]
        // Update the state
        setSelectedFile(file)

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
                setShowProcessOverlay(true)
                setProcessFinished(false)

                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgression(progress)
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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
                    lessonVideo.videoUrl = downloadURL;
                    setVideoUrl(downloadURL);
                    console.log('File available at', downloadURL);
                    setUploaded(true)


                });
            })
            setProcessFinished(true) 
          

        setUploadText("video uploaded successfully")
    }, [])

    useEffect(() => {
        if (!processFinished) return
        setTimeout(() => { 
            setShowProcessOverlay(false)
            setProcessFinished(false)
        }, 1000)
    }, [processFinished])

    return (

        <div className="container">

            <Flex gap="gap.small">
                <Button className="backBtn" style={{ marginTop: '1.2rem' }} onClick={() => {
                    history.push('/lessons');
                }}><BackIcon /></Button>
                <h2>{lesson.lessonName}</h2>
            </Flex>
            <Card style={{ width: '100%', backgroundColor: "white" }}>
                <DefaultButton className='uploadVideoBtn' onClick={showModal} text="Upload Video" />
                <Modal
                    titleAriaId='videoUpload'
                    isOpen={isModalOpen}
                    onDismiss={hideModal}
                    isBlocking={false}
                    containerClassName={'upload-video-modal-container'}>

                    {showProcessOverlay &&
                
                        <Overlay className="overlayUpload"> 
                            {
                                !processFinished ?
                                    <div className="uploadSpinner">
                                        <Spinner label={`${uploadProgression}%`} size={SpinnerSize.large} /> 
                                    </div> :
                                    <div style={{ textAlign : 'center', marginTop :'14rem', fontSize : '7rem'}}>
                                    <AcceptIcon style={{ border : '4px solid #04a904', padding : '1rem', borderRadius : '1rem', color : '#22c422' }} /> 
                                    </div>
                            }

                        </Overlay>
                    }
                    <Flex gap="gap.small" style={{ justifyContent: 'center', textAlign: 'center' }}>
                        <Flex column style={{ width: '100%' }}>
                            <h4 style={{ paddingTop : '2rem'}}>Upload new content</h4>
                            <Input fluid className='inputVName' onChange={event => onChangeLessonName(event)} style={{ width: '21rem', textAlign: 'center', margin: 'auto' }} placeholder="Video content name" name="lessonName" id="lessonname" />
                        </Flex>
                    </Flex>
                    <br></br>
                    <Flex gap="gap.small" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '2rem' }}>
                        <Flex column>
                            {/*<Input className='onFileChangeInput' icon={<CallVideoIcon />} type={'file'} onChange={OnFileChange}></Input>*/}
                            <Button style={{ margin : '0px auto'}} loading={loading} onClick={onFileUpload} icon={<CallVideoIcon />} text primary content="Upload Video" />
                            <div>
                                <Dropzone
                                    onDropRejected={(fileRejections) => console.log(fileRejections)}

                                    onDrop={handleOnDrop}
                                    onDropAccepted={() => console.log('Drop Accepted')}
                                    noDragEventsBubbling={true} // God sent arcane spell... BEWARE!!!
                                >
                                    {({ getRootProps, getInputProps }) => (
                                        <div className="container">
                                            <div
                                                {...getRootProps()}
                                                className=''
                                                style={{ border : '2px dotted #464eb8', padding : '2rem', color : '#464eb8'}}
                                            >
                                                <input {...getInputProps()} />
                                                <p>{uploadText}</p>
                                            </div>
                                        </div>
                                    )}
                                </Dropzone>
                            </div>      
                            <Button className='modalSaveBtn' onClick={hideModal}>Kapat</Button>
                        </Flex>

                    </Flex>

                    <br></br>
                </Modal>
                <CardBody >
                    <>


                        <Divider></Divider>

                        <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={rows} aria-label="Static table" />

                    </>


                </CardBody>
            </Card>


        </div>



    )

}