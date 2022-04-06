import { Avatar, Breadcrumb, Button, Card, CardBody, CardHeader, Divider, Flex, Form, FormButton, FormCheckbox, FormInput, Grid, Input, Layout, List, Slider, Table, Video, Segment } from "@fluentui/react-northstar";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React from "react";
import { Component, FC, Props, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { db } from "../../../firebase-config";
import { Lesson, LessonVideo } from "../../../models/learning";
import LessonVideoList from "./Lesson-Video-List";
import { VideoPlayer } from "./VideoPlayer"
import { BackIcon } from '@fluentui/react-icons-mdl2';
import './Watch-Video-Component.css';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';

export default function WatchVideoComponent() {

    const [lessonName, setLessonName] = useState('')

    const [lesson, setLesson] = useState({} as any);

    const [lessonVideos, setLessonVideos] = React.useState(Array<LessonVideo>());

    const [quizResults, setQuizResults] = useState(Array<any>());
    const [videoOpen, setVideoOpen] = useState<boolean>(false);

    const history = useHistory();

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);

    var selectedIndex: any = 0;

    const [selectedVideo, setSelectedVideo] = useState({} as any);

    if (id) {
        var lessonVideo: LessonVideo = {};
        lessonVideo.lessonId = id;
    }



    function Refresh() {
        React.useEffect(() => {

            const videoCollection = collection(db, "videos");

            const videoQuery = query(videoCollection, where("lessonId", "==", id));

            const unsub = onSnapshot(videoQuery, (data) => {
                var lessArray = Array<any>();
                data.docs.forEach(doc => {

                    console.log(doc.id, "=>", doc.data());
                    lessArray.push({
                        id: doc.id,
                        name: doc.data().name,
                        lessonId: doc.data().lessonId,
                        videoUrl: doc.data().videoUrl != null ? doc.data().videoUrl : null,
                        isComplated: doc.data().isComplated,
                        currentTime: doc.data().currentTime,
                        videoUserState: {
                            progressPercentage: doc.data().currentTimePercentage
                        }
                    })
                })
                console.log(lessArray)
                console.log("less array")
                setLessonVideos(lessArray);

                if (selectedIndex) {
                    var selectedVideo = lessonVideos[selectedIndex];
                    setSelectedVideo(selectedVideo);
                }


            });

            const quizResultsCollections = collection(db, "quiz-results");

            const q = query(quizResultsCollections, where("lessonId", "==", id), orderBy("timestamp", "desc"));

            const unsubQuizResults = onSnapshot(q, (data) => {
                var lessArray = Array<any>();

                data.docs.forEach(doc => {

                    console.log(doc.id, "=>", doc.data());
                    lessArray.push({
                        id: doc.id,
                        correctCount: doc.data().correctCount,
                        emptyCount: doc.data().emptyCount,
                        wrongCount: doc.data().wrongCount,
                        lessonId: doc.data().lessonId,
                        lessonName: doc.data().lessonName,
                        userId: doc.data().userId,
                        userName: doc.data().userName,
                        point: doc.data().point,
                    })

                })

                setQuizResults(lessArray);

            });

        }, [])
    }

    Refresh();

    function navigateTakeQuiz() {

        history.push('/take-quiz?lessonId=' + id);
    }

    useEffect(() => {
        getLesson();

    }, [])
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
            currentTimePercentage: docSnap.data()!.currentTimePercentage,
            currentTime: docSnap.data()!.currentTime,
            lessonName: docSnap.data()!.lessonName
        }

        setLesson(obj);

    }
    var videoTemplate = lessonVideos.map((item => {
        console.log(item.videoUserState?.progressPercentage)
        var vid = {
            key: item.id,
            header: item.name,

            content: (
                <div>
                    <ProgressIndicator percentComplete={item.videoUserState?.progressPercentage} />
                </div>
            ),
        };
        return vid;
    }))

    const header = {
        key: 'header',
        items: [
            { content: 'Correct', key: 'correct' },
            { content: 'Empty', key: 'empty' },
            { content: 'Wrong', key: 'wrong' },
            { content: 'Point', key: 'point' },
        ],
    };

    var quizResultsRows = quizResults.map((item, index) => {
        var plan = {
            key: index,
            items: [
                { key: 'correctCount', content: item.correctCount },
                { key: 'emptyCount', content: item.emptyCount },
                { key: 'wrongCount', content: item.wrongCount },
                { key: 'point', content: item.point },

            ]
        }
        return plan;
    })


    // @ts-ignore
    // @ts-ignore
    return (

        <div className="container">
            <Flex gap="gap.small"> 
                 <Button className="backBtn" style={{  marginTop: '1.2rem'}} onClick={() => {
                    history.push('/lessons');
                }}><BackIcon /></Button> 
             
                <h2>{lesson.lessonName}</h2>
            </Flex>
            <Flex gap="gap.small">
                <Flex style={{ width: '70%', justifyContent: 'center', textAlign: 'center', border: '1px solid rgb(91 95 199 / 37%)', backgroundColor: '#faf9f8' }}>
                    <Flex column gap="gap.small" style={{ justifyContent: 'center', width: '100%' }}>
                        <h3 style={{ marginTop: '1rem', marginBottom: '1rem', borderBottom: '1px solid #464eb8', paddingBottom: '1rem' }}>{selectedVideo.name} <span style={{ fontWeight: '500' }}>Playing</span></h3>
                        <Flex.Item>
                            <Segment style={{ paddingLeft: '1rem', paddingRight: '1rem', backgroundColor: 'rgb(250 249 248)', boxShadow: 'none' }}>
                                {videoOpen ? <VideoPlayer selectedVideoId={selectedVideo.id} selectedVideoUrl={selectedVideo.videoUrl} /> : <div></div>}
                            </Segment>
                        </Flex.Item>
                    </Flex>
                </Flex>
                <br></br>
                <Flex style={{ width: '30%', border: '1px solid rgb(91 95 199 / 37%)', backgroundColor: '#faf9f8' }}>
                    <Flex gap="gap.small" style={{ width: '100%', backgroundColor: '#fff' }} column>
                        <Flex.Item size="size.full">
                            <Segment style={{ width: '100%', boxShadow: 'none', marginBottom: '0px' }}>
                                <h3 >Course Contents</h3>
                            </Segment>
                        </Flex.Item>
                        <Flex.Item>
                            <Segment className='courseContentDiv' style={{ boxShadow: 'none' }}>
                                <List
                                    selectable
                                    selectedIndex={selectedIndex}
                                    onSelectedIndexChange={(e, newProps) => {

                                        if (newProps != null) {
                                            selectedIndex = newProps.selectedIndex;

                                            var selectedVideo = lessonVideos[selectedIndex];
                                            setSelectedVideo(selectedVideo);
                                            setVideoOpen(false)
                                            setTimeout(() => {
                                                setVideoOpen(true)
                                                getLesson()
                                            }, 100)
                                        }

                                    }}
                                    items={videoTemplate} />
                            </Segment>
                        </Flex.Item>
                    </Flex>
                    <br></br>
                </Flex>
            </Flex>
            <Flex style={{ marginTop: '1rem' }}>
                <Card size="large" style={{ width: '70%', border: '1px solid rgb(91 95 199 / 37%)' }} aria-roledescription="card with avatar, image and text">
                    <Card.Header>
                        <Flex gap="gap.small">
                            <Flex column>
                                <h3>Quiz Results</h3>
                            </Flex>
                        </Flex>
                    </Card.Header>
                    <Button onClick={navigateTakeQuiz} content="Quiz" tinted />
                    <br></br>
                    <Card.Body>
                        <Flex column gap="gap.small">
                            <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={quizResultsRows} aria-label="Static table" />
                        </Flex>
                    </Card.Body>
                </Card>
            </Flex>
        </div>
    );
}
