import {Box, Button, Checkbox, CloseIcon, Flex, FlexItem, Form, Input, List, TextArea} from "@fluentui/react-northstar";
import {navigateBack} from "@microsoft/teams-js";
import {doc, getDoc} from "firebase/firestore";
import {FC, useEffect, useState} from "react"
import toast, {Toaster} from "react-hot-toast";
import {useHistory, useLocation} from "react-router-dom";
import {db} from "../../firebase-config";
import {AnswerBase, FeedbackForm, FormQuestion, MultipleOptionsAnswer} from '../../models'

import '../lesson/Create-Lesson-Form.css'


const CreateForm: FC = () => {

    // the data in the state should be added to FeedbackForm typed state ( survey )'s feedbackQuestions attribute
    // and FeedbackFrom should be send
    const [questions, setQuestions] = useState<Array<FormQuestion>>(() => {
        return []
    });
    const [mappedQuestionsElements, setMappedQuestionsElements] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>();
    const history = useHistory()

    // TODO: Functions and states to be uncommented and finished if getting the survey from firebase is necessary
    //  when creating a new survey

    // const [survey, setSurvey] = useState<FeedbackForm>();
    // const search = useLocation().search
    // const id = new URLSearchParams(search).get('id')
    // console.log(id)

    const AddNewMultiOption = (answers: MultipleOptionsAnswer, questionId: string) => {

        {/* @ts-ignore */}
        answers.answerOptions.push({
            id: '',
            text: '',
            questionId: questionId
        })
        setRerenderQuestions(true)

    }

    function removeOption(answers: Array<any>, item: any) {
        let index = answers.indexOf(item)
        delete answers[index]
        setRerenderQuestions(true)
    }

    function removeQuestion(item: any) {
        let index = questions.indexOf(item)
        delete questions[index]
        setRerenderQuestions(true)
    }

    //TODO I only added the functions below. Not sure if they are working or not
    // const getSurvey = async () => {
    //     const docRef = doc(db, 'surveys', id!)
    //     const docSnap = await getDoc(docRef)
    //
    //     if(docSnap.exists())
    //     {
    //         console.log('Document data:', docSnap.data())
    //     }
    //     else
    //     {
    //         console.log('No Such Document!')
    //     }
    //
    //     let obj = {
    //         id: docSnap.id,
    //         name: docSnap.data()!.name
    //     }
    //
    //     setSurvey(obj)
    // }

    useEffect(() => {
        // TODO: Do we really need to get the available survey when creating a new survey?
        //getSurvey()

        addNewTextInputQuestion()
        addNewMultiOptionQuestion()
    }, []);


    useEffect(() => {
        if (rerenderQuestions) {
            let questionElements = questions.map((questionItem, questionIndex) => {
                    let answers: Array<any> = []
                    if (questionItem.isMultipleOption) {
                        let multipleAnswerQuestion: MultipleOptionsAnswer = questionItem.multipleOptionAnswer;
                        {/* @ts-ignore */}
                        multipleAnswerQuestion.answerOptions.forEach((answerItem, answerIndex) => {

                            let isDefaultSelected: boolean = multipleAnswerQuestion.selectedOptionIndex === answerIndex;
                            let answer = {
                                key: questionItem.questionBase.id,
                                media: (
                                    <Box>
                                        <Flex gap='gap.smaller'>
                                            <Checkbox
                                                style={{maxWidth: '25px'}}
                                                key={`AnswerCheckbox-${questionItem.questionBase.id}-${answerItem.id}`}
                                                defaultChecked={isDefaultSelected} onChange={(e, data) => {
                                                if (data?.checked) multipleAnswerQuestion.selectedOptionIndex = answerIndex
                                            }}/>
                                            <Input
                                                key={`AnswerCheckboxText-${questionItem.questionBase.id}-${answerItem.id}`}
                                                placeholder='Type option...'
                                                defaultValue={answerItem.text !== '' ? answerItem.text : ''}
                                                onChange={(e, data) => {
                                                    answerItem.text = data?.value
                                                }}/>
                                            <Button key={`AnswerDeleteOption-${questionItem.questionBase.id}-${answerIndex}`} icon={<CloseIcon />} text title="Close" onClick={() => {removeOption(multipleAnswerQuestion.answerOptions!, answerItem)}}
                                                style={{justifyContent: "start"}}
                                            />
                                        </Flex>
                                    </Box>
                                )
                            }
                            answers.push(answer);
                        })
                    } else {
                        let textInputAnswer: AnswerBase = questionItem.textInputAnswer;
                        let answer = {
                            key: questionItem.questionBase.id,
                            media: (
                                <div>
                                    <Flex gap='gap.smaller' vAlign='center'>
                                        <Input key={`AnswerInput-${questionItem}-${questionItem.questionBase.id}`}/>
                                    </Flex>
                                </div>
                            )
                        }
                        answers.push(answer)
                    }

                    return (
                        <Box style={{paddingTop: "20px"}}>
                            <Input
                                key={`QuestionLabel-${questionIndex}-${questionItem.questionBase.id}`}
                                placeholder={questionItem.questionBase.question !== "" ? questionItem.questionBase.question : "Type here the form question..."}
                                name='form-question'
                                id={`form-name-inline-${questionItem.questionBase.id}`}
                                onChange={(e, data) => {
                                    questionItem.questionBase.question = data?.value
                                }}
                            />

                            <Box>
                                {
                                    questionItem.isMultipleOption ? (
                                        <>
                                            <List defaultSelectedIndex={0} items={answers}/>
                                            <Flex space='between'>
                                                <Button fluid
                                                        onClick={() => AddNewMultiOption(questionItem.multipleOptionAnswer, questionItem.questionBase.id!)}
                                                        content='Add new option' style={{marginRight: '1rem'}}/>
                                                <br/>
                                                <Button fluid type='button' onClick={() => removeQuestion(questionItem)}
                                                        content='Remove'/>
                                            </Flex>
                                        </>
                                    ) : (
                                        <Box style={{paddingTop: '5px'}}>
                                            <Flex style={{flexDirection: 'column'}} gap='gap.smaller'>

                                                    <TextArea
                                                        key={`QuestionLabel-${questionIndex}-${questionItem.questionBase.id}`}
                                                        placeholder={questionItem.questionBase.question !== "" ? questionItem.questionBase.question : "Type here your answer... "}
                                                        name='form-question'
                                                        id={`form-name-inline-${questionItem.questionBase.id}`}
                                                        onChange={(e, data) => {
                                                            questionItem.textInputAnswer.text = data?.value
                                                        }}

                                                    />
                                                    <Button type='button'
                                                            onClick={() => removeQuestion(questionItem)} content='Remove'/>
                                            </Flex>
                                        </Box>
                                    )
                                }
                            </Box>
                        </Box>
                    )

                }
            )


            setMappedQuestionsElements(questionElements)
        }

        return () => setRerenderQuestions(false)


    }, [rerenderQuestions])


    const addNewTextInputQuestion = () => {
        let question: FormQuestion = {
            isMultipleOption: false,
            questionBase: {
                id: '',
                question: ''
            },
            textInputAnswer: {
                id: '',
                text: '',
                questionId: ''
            },
            multipleOptionAnswer: {}
        }

        questions.push(question)
        setRerenderQuestions(true)

        console.log(`TextInputQuestion:\n ${questions}`)
    }

    const addNewMultiOptionQuestion = () => {
        let question: FormQuestion = {
            isMultipleOption: true,
            questionBase: {
                id: '',
                question: ''
            },
            textInputAnswer: {
                id: ''
            },
            multipleOptionAnswer: {
                answerOptions: [
                    {
                        id: '',
                        text: '',
                        questionId: ''
                    },
                    {
                        id: '',
                        text: '',
                        questionId: ''
                    }
                ]
            }
        }

        questions.push(question)
        setRerenderQuestions(true)

        console.log(`MultipleOptionQuestion:\n ${questions}`)
    }

    const notify = () => toast('Created successfully')

    async function createSurveyForm() {

        // TODO: Implement the function
        console.error("createSurveyForm in CreateForm.tsx: ln: 220 is not implemented yet!")
    }

    function handleButtonClick() {
        createSurveyForm().then(() => {
            navigateBack()
        })
    }

    return (
        <Form>
            <Toaster/>
            {/* TODO: Change the value to fetched data*/}
            <Input
                label='Form'
                defaultValue='Customer Satisfaction'
                name='formName'
                id='first-name-inline'
                fluid
                readOnly
                inline
                required/>
            {mappedQuestionsElements}

            <Flex>
                <Button fluid onClick={addNewMultiOptionQuestion} content='New Multi Option Question'/>
                <Button fluid onClick={addNewTextInputQuestion} content='New Text Input Question'/>
            </Flex>
            <Flex>
                <Button
                    onClick={handleButtonClick}
                    content='Create Form'
                    style={{marginRight: '1rem'}}
                    fluid
                />

                <br/>

                <Button
                    onClick={() => history.push('/surveys')}
                    type='button'
                    content='Cancel'
                    fluid
                />
            </Flex>

        </Form>
    )
}

export {CreateForm}