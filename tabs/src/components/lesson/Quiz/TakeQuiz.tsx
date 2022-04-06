import { BackIcon } from "@fluentui/react-icons-mdl2";
import {
    Avatar,
    Box,
    Breadcrumb,
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    CloseIcon,
    Divider,
    Flex,
    Form,
    FormButton,
    FormCheckbox,
    FormInput,
    Grid,
    Input,
    List,
    TextArea,
    Segment
} from "@fluentui/react-northstar";
import { navigateBack } from "@microsoft/teams-js";
import { TeamsUserCredential } from "@microsoft/teamsfx";
import { collection, doc, getDoc, Timestamp, setDoc, onSnapshot, query, where, getDocs, orderBy, addDoc } from "firebase/firestore";
import { Component, FC, Props, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useHistory } from "react-router-dom";
import { db } from "../../../firebase-config";
import { QuizQuestion, Quiz } from "../../../models/learning";
import { useData } from "../../sample/lib/useData";
import { useTeamsFx } from "../../sample/lib/useTeamsFx";


export default function TakeQuiz() {

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("lessonId");
    console.log(id);

    const [lesson, setLesson] = useState({} as any);
    const [questions, setQuestions] = useState<Array<QuizQuestion>>(() => ([]))
    const [originQuestions, setOriginQuestions] = useState<Array<QuizQuestion>>(() => ([]))
    const [mappedQuestions, setMappedQuestions] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>(false); // flag to re-render the questions after any change
    const quizCollection = collection(db, "quizes");

    const { isInTeams } = useTeamsFx();
    const userProfile = useData(async () => {
        const credential = new TeamsUserCredential();
        return isInTeams ? await credential.getUserInfo() : undefined;
    })?.data;
    const userName = userProfile ? userProfile.displayName : "";
    const userId = userProfile ? userProfile.objectId : "";


    const getQuiz = async () => {

        const coll = collection(db, "quizes");

        const q = query(coll, where("lessonId", "==", id), orderBy("timestamp", 'desc'));

        const data = await getDocs(q);

        // var lessonsArray = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        var quizArray: Array<any> = [];

        data.docs.forEach(doc => {
            // if (doc.data().questions.length > 0)
            //{

            quizArray.push({
                id: doc.id,
                questions: doc.data().questions
            })
            //}
        })


        var quiz = quizArray[0];
        var tempQuestions: Array<any> = quiz.questions;

        var copyArray = JSON.parse(JSON.stringify(tempQuestions));

        setOriginQuestions(copyArray);


        return new Promise<Array<QuizQuestion>>((resolve, reject) => {
            if (tempQuestions !== null && tempQuestions.length > 0) {
                resolve(tempQuestions)
            }
            else {
                reject(Error('Returned questions array from firebase either empty or not valid'))
            }
        })

    }



    //    const getQuiz = async () => {
    //
    //        const coll = collection(db, "quizes");
    //
    //        const q = query(coll, where("lessonId", "==", id));
    //
    //        const data = await getDocs(coll);
    //        // var lessonsArray = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    //
    //        var quizArray = Array<any>();
    //
    //        data.docs.forEach(doc => {
    //
    //            quizArray.push({
    //                id: doc.id,
    //                questions: doc.data().questions
    //            })
    //
    //        })
    //        var quiz = quizArray[quizArray.length - 1];
    //
    //        var questions = quiz.questions;
    //
    //        setQuestions(questions);
    //
    //        console.log(quizArray);
    //
    //
    //    }

    // Gets the Lesson Name
    // Not needed for surveys
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

    useEffect(() => {
        getLesson();
        getQuiz().then(res => {
            setQuestions(res)
            setRerenderQuestions(true)
        }).catch(err => console.log(err)
        )


    }, [])

    useEffect(() => {
        console.log(questions)
    }, [questions]);

    const navigateTo = () => history.push('/lessons');

    function navigateVideo(id: string) {
        history.push('/watch-video?id=' + id);
    }

    const notify = () => toast('Created successfully');

    async function createQuizForm() {
        console.log(questions);

        var correctCount = 0;
        var emptyCount = 0;
        var wrongCount = 0;

        originQuestions.forEach(q => {

            var correctAnswer = q.questionAnswers?.filter(f => f.isCorrect == true)[0];

            var tempQuestion = questions.filter(f => f.text == q.text)[0];

            var userSelectedAnswer = tempQuestion.questionAnswers?.filter(f => f.isCorrect == true);

            if (userSelectedAnswer && userSelectedAnswer.length > 0) {

                var firstSelected = userSelectedAnswer[0];

                if (correctAnswer?.text === firstSelected.text) {
                    correctCount++;
                } else {
                    wrongCount++;
                }

            } else {
                emptyCount++;
            }

        })

        var point = Math.round((correctCount / originQuestions.length) * 100);

        var result = {
            lessonId: id,
            lessonName: lesson.lessonName,
            correctCount: correctCount,
            emptyCount: emptyCount,
            wrongCount: wrongCount,
            userName: userName,
            userId: userId,
            point: point,
            timestamp: Timestamp.fromDate(new Date())
        }

        const collectionRef = doc(collection(db, "quiz-results"));

        await setDoc(collectionRef, result);


    }

    function handleButtonClick() {
        createQuizForm().then(() => {
            notify();

            setTimeout(() => {
                navigateVideo(id!);
            }, 1500)
        })
    }

    const history = useHistory();
    const [clickedButton, setClickedButton] = useState('');




    useEffect(() => {

        if (rerenderQuestions) {

            let tempQuestions = questions.map((item, questionIndex) => {

                // Su anda butun cevaplar bu gecici array icerisinde. Bunlari kaydetmemiz gerekiyor
                const answers = Array<any>();
                item.questionAnswers?.forEach((answerItem, answerIndex) => {

                    var answer = {
                        key: answerItem.id,
                        media: (
                            <>
                            <div> 
                                <Flex> 
                                        <Checkbox key={`AnswerCheckbox-${questionIndex}-${answerIndex}`} label={answerItem.text}
                                            onChange={(e, data) => {
                                                answerItem.isCorrect = data?.checked
                                            }} />     
                                </Flex>
                            </div>
                            </>
                        )

                    };

                    console.log(item)
                    answers.push(answer);
                })

                return (
                    <>
                        <TextArea defaultValue={item.text} key={`QuestionLabel-${questionIndex}-${item.id}`}
                            placeholder="Type here something about your question..." name="lessonName" readOnly
                            id="first-name-inline" onChange={(e, data) => {
                                item.text = data?.value
                            }} />

                        <Box>
                            <div>
                                <List defaultSelectedIndex={0} items={answers} />
                            </div>

                            <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />


                        </Box></>
                )
            })
            setMappedQuestions(tempQuestions);
        }

        return () => setRerenderQuestions(false)
    }, [rerenderQuestions]);


    return (

        <div className="container">

            <Button onClick={navigateTo} className="backBtn" style={{ marginRight: '2rem' }}><BackIcon /></Button>

            <Divider></Divider>

            <Grid
                styles={({ theme: { siteVariables } }) => ({
                    width: '100%',
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >


                <Form style={{ width: 1000 }}>
                    <Toaster />
                    <Input fluid label="Lesson Name" value={lesson.lessonName} readOnly name="lessonName"
                        id="first-name-inline" inline required />
                    {mappedQuestions}
                    <Flex>
                        <Button fluid onClick={handleButtonClick} content="Send" style={{ marginRight: '1rem' }} />
                        <br></br>
                        <Button fluid onClick={() => {
                            history.push('/lessons');
                        }} type="button" content="Cancel" />
                    </Flex>
                </Form>


            </Grid>


        </div>


    );
}