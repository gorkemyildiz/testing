import "./Create-Lesson-Form.css";

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
    Flex
} from '@fluentui/react-northstar'
import NewQuestionObject from './Quiz/New-Question-Object';
import { Quiz, QuizQuestion, QuizQuestionAnswer } from "../../models/learning";
import { FC, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from '../../firebase-config';
import { navigateBack } from "@microsoft/teams-js";
import { connectStorageEmulator } from "firebase/storage";
import toast, { Toaster } from 'react-hot-toast';


export function CreateQuizForm() {


    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);

    const [lesson, setLesson] = useState({} as any);
    const [questions, setQuestions] = useState<Array<QuizQuestion>>([])
    const [mappedQuestions, setMappedQuestions] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>(false); // flag to re-render the questions after any change
    const quizCollection = collection(db, "quizes");

    const getQuiz = async () => {

        questions.forEach(q => {
            questions.pop();
        })

        setRerenderQuestions(true);


        const coll = collection(db, "quizes");

        const q = query(coll, where("lessonId", "==", id), orderBy("timestamp", 'desc'));

        const data = await getDocs(q);

        if (data.empty) {
            addNewQuestion();
        } else {
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

            setRerenderQuestions(true)



            tempQuestions.forEach(item => {

                questions.push(item);

            })

            // var lessonsArray = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));



        }
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

        getQuiz();


    }, [])




    // Boş bir soru oluşturuyor
    function addNewQuestion() {
        setRerenderQuestions(true)
        var question: QuizQuestion = {
            questionAnswers: [
                {
                    text: '',
                    isCorrect: false
                },
                {
                    text: '',
                    isCorrect: false
                }
            ],
            text: ''
        }

        questions.push(question);
        console.log(`${questions}`)
    }

    function removeQuestion(item: any) {
        setRerenderQuestions(true)
        var index = questions.indexOf(item); // Let's say it's Bob.
        delete questions[index];

    }

    function addNewAnswer(question: QuizQuestion) {
        setRerenderQuestions(true)
        question.questionAnswers?.push({
            text: '',
            isCorrect: false
        });
    }

    function removeAnswer(question: QuizQuestion, answer: any) {
        setRerenderQuestions(true)
        var index = question.questionAnswers?.indexOf(answer) as number;

        if (question && question.questionAnswers) {
            delete question.questionAnswers[index];
        }
    }

    const navigateTo = () => history.push('/lessons');

    const notify = () => toast('Created successfully');

    async function createQuizForm() {
        console.log(questions);

        var quiz: Quiz = {
            lessonId: id!,
            questions: questions,
            timestamp: Timestamp.fromDate(new Date())
        }


        const newCityRef = doc(collection(db, "quizes"));

        console.log(quiz);

        await setDoc(newCityRef, quiz);

        notify();

        setTimeout(() => {
            navigateTo();
        }, 1500)
    }

    function handleButtonClick() {
        createQuizForm().then(() => {
            navigateTo();
        })
    }

    const history = useHistory();

    useEffect(() => {

        if (rerenderQuestions) {
            console.log(`Questions re-rendered`)
            let tempQuestions = questions.map((item, questionIndex) => {

                // Su anda butun cevaplar bu gecici array icerisinde. Bunlari kaydetmemiz gerekiyor
                const answers = Array<any>();
                item.questionAnswers?.forEach((answerItem, answerIndex) => {

                    var answer = {
                        key: answerItem.id,
                        media: (
                            <div>
                                <Flex gap="gap.smaller">
                                    <Input key={`AnswerInput-${questionIndex}-${answerIndex}`} label="Answer" inline defaultValue={answerItem.text} onChange={(e, data) => { answerItem.text = data?.value }} />
                                </Flex>
                                <Flex gap="gap.large" vAlign="center">
                                    <Checkbox key={`AnswerCheckbox-${questionIndex}-${answerIndex}`} label="Correct Answer" defaultChecked={answerItem.isCorrect} onChange={(e, data) => { answerItem.isCorrect = data?.checked }} />

                                    <Button key={`AddAnswerButton-${questionIndex}-${answerIndex}`} onClick={() => { removeAnswer(item, answerItem) }} icon={<CloseIcon />} text iconOnly title="Close" />
                                </Flex>
                            </div>
                        )

                    };

                    console.log(item)
                    answers.push(answer);
                })

                return (
                    <>
                        <TextArea defaultValue={item.text} key={`QuestionLabel-${questionIndex}-${item.id}`} placeholder="Type here something about your question..." name="lessonName" id="first-name-inline" onChange={(e, data) => { item.text = data?.value }} />

                        <Box>
                            <div>
                                <List defaultSelectedIndex={0} items={answers} horizontal />
                            </div>

                            <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />

                            <Grid columns={3} style={{ marginTop: '1rem', marginBottom: '1rem' }}>

                                <Button onClick={() => addNewAnswer(item)} type="button" content="New Answer"></Button>

                                <br></br>

                                <Button type="button" onClick={() => removeQuestion(item)} content="Remove" />
                            </Grid>

                            <Divider></Divider>
                        </Box></>
                )
            })
            setMappedQuestions(tempQuestions);
        }

        return () => setRerenderQuestions(false)
    }, [rerenderQuestions]);

    return (
        <Form>
            <Toaster />
            <Input fluid label="Lesson Name" value={lesson.lessonName} readOnly name="lessonName" id="first-name-inline" inline required />
            {mappedQuestions}
            <Button fluid onClick={addNewQuestion} content="New Question"></Button>
            <Flex>
                <Button fluid onClick={handleButtonClick} content="Create" style={{ marginRight: '1rem' }} />
                <br></br>
                <Button fluid onClick={() => {
                    history.push('/lessons');
                }} type="button" content="Cancel" />
            </Flex>
        </Form>
    )

}

export default CreateQuizForm;

