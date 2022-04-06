import React, { useEffect, useState } from 'react'
import "./Create-Lesson-Form.css";
import {
    Form,
    FormInput,
    FormDropdown,
    FormRadioGroup,
    FormSlider,
    FormCheckbox,
    FormDatepicker,
    FormButton,
    FormTextArea,
    Grid,
    Button,
    Breadcrumb,
    Divider,
    Flex
} from '@fluentui/react-northstar'

import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { useHistory, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { createMicrosoftGraphClient, TeamsUserCredential } from "@microsoft/teamsfx";

interface Lesson {
    id: string;
    lessonName: string;
}




export default function EditLesson() {

    const [isLoading, setIsLoading] = useState(false);

    const navigateTo = () => history.push('/lessons');

    const lessonCollection = collection(db, "lessons");

    const [lesson, setLesson] = useState({} as any);

    const history = useHistory();

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);



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

            const lessonNameInput = document.querySelector('#lessonName') as any;
            lessonNameInput.value = obj.lessonName;

        }

        getLesson();

    }, [])

    function cancel() {
        history.push('/lessons');
    }

    const notify = () => toast('Edited successfully');


    const createLesson = async (lessonName: any) => {
        const docRef = doc(db, "lessons", id!);
        await setDoc(docRef, { lessonName: lessonName })
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();

        const data = new FormData(event.target);

        const lessonName = data.get('lessonName');

        console.log(data.get('lessonName'));

        setIsLoading(true);

        createLesson(lessonName).then(res => {

            notify();

            setTimeout(() => {

                setIsLoading(false);

                navigateTo();
            }, 1500);

        })

    }

    function handleChange(event: any) {
        lesson.lessonName = event.target.value;
        setLesson(lesson);
    }



    return (

        <div className="container">

            <Toaster />

            <Breadcrumb aria-label="breadcrumb">
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Divider />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/#/lessons">Lessons</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="">Edit Lesson</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Divider></Divider>

            <Grid
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >



                <Form
                    onSubmit={handleSubmit}
                >

                        <FormInput onChange={handleChange} label="Lesson Name" name="lessonName" id="lessonName" inline required style={{ marginTop : '2rem'}} />


                    <Grid>

                        <FormButton loading={isLoading} type='submit' content="Save" />

                        <br></br>

                        <Button onClick={cancel} type='button' content="Cancel" />
                    </Grid>



                </Form>



            </Grid>


        </div>


    )



}

