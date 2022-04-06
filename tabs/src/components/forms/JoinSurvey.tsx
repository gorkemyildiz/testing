import {Box, Button, Checkbox, Flex, Form, FormButton, Input, List, TextArea} from "@fluentui/react-northstar";
import { navigateBack } from "@microsoft/teams-js";
import { doc, getDoc } from "firebase/firestore";
import {FC, useEffect, useState} from "react"
import toast, {Toaster} from "react-hot-toast";
import { useHistory, useLocation } from "react-router-dom";
import { db } from "../../firebase-config";
import {AnswerBase, FeedbackForm, FormQuestion, MultipleOptionsAnswer} from '../../models'

import '../lesson/Create-Lesson-Form.css'


const JoinSurvey: FC = () => {

    const [questions, setQuestions] = useState<Array<FormQuestion>>(() => {
        return []
    });
    const [mappedQuestionsElements, setMappedQuestionsElements] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>();
    const history = useHistory()

    const [survey, setSurvey] = useState<FeedbackForm>();
    const search = useLocation().search
    const id = new URLSearchParams(search).get('id')
    console.log(id)

    const AddNewMultiOption = (answers: MultipleOptionsAnswer, questionId: string) => {

        {/* @ts-ignore */}
        answers.answerOptions.push({
            id: '',
            text: '',
            questionId: questionId
        })
        setRerenderQuestions(true)

    }

    //TODO I only added the functions below. Not sure if they are working or not
    const getSurvey = async () => {
        const docRef = doc(db, 'surveys', id!)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists())
        {
            console.log('Document data:', docSnap.data())
        }
        else
        {
            console.log('No Such Document!')
        }

        let obj = {
            id: docSnap.id,
            name: docSnap.data()!.name
        }

        setSurvey(obj)
    }

    useEffect(() => {
        getSurvey()
        addNewMultiOptionQuestion()
        addNewTextInputQuestion()
    }, []);


    useEffect(() => {
        console.log('re-rendered')
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
                                        <Flex gap="gap.smaller">
                                            <Checkbox
                                                style={{maxWidth: '25px'}}
                                                key={`AnswerCheckbox-${questionItem.questionBase.id}-${answerItem.id}`}
                                                defaultChecked={isDefaultSelected} onChange={(e, data) => {
                                                if (data?.checked) multipleAnswerQuestion.selectedOptionIndex = answerIndex
                                            }}/>
                                            <Input
                                                readOnly
                                                key={`AnswerCheckboxText-${questionItem.questionBase.id}-${answerItem.id}`}
                                                placeholder='Type option...'
                                                defaultValue={answerItem.text !== '' ? answerItem.text : ''}
                                                onChange={(e, data) => {
                                                    answerItem.text = data?.value
                                                }}/>
                                        </Flex>
                                    </Box>
                                )
                            }
                            answers.push(answer);
                        })
                    }
                    else
                    {
                        let textInputAnswer: AnswerBase = questionItem.textInputAnswer;
                        let answer = {
                            key: questionItem.questionBase.id,
                            media: (
                                <div>
                                    <Flex gap='gap.smaller' vAlign='center'>
                                        <Input key={`AnswerInput-${questionItem}-${questionItem.questionBase.id}`} readOnly/>
                                    </Flex>
                                </div>
                            )
                        }
                        answers.push(answer)
                    }

                    return (
                        <Box style={{paddingTop: '20px'}}>
                            <Input
                                key={`QuestionLabel-${questionIndex}-${questionItem.questionBase.id}`}
                                placeholder={questionItem.questionBase.question !== "" ? questionItem.questionBase.question : "Type here the form question..."}
                                name='form-question'
                                id={`form-name-inline-${questionItem.questionBase.id}`}
                                onChange={(e, data) => {
                                    questionItem.questionBase.question = data?.value
                                }}
                                readOnly
                            />

                            <Box>
                                {
                                    questionItem.isMultipleOption ? (
                                        <div>
                                            <List defaultSelectedIndex={0} items={answers}/>
                                        </div>
                                    ) : (
                                        <Box style={{paddingTop: '5px'}}>
                                            <Flex style={{flexDirection: 'column'}} gap='gap.smaller'>
                                                <TextArea
                                                key={`QuestionLabel-${questionIndex}-${questionItem.questionBase.id}`}
                                                placeholder={questionItem.questionBase.question !== "" ? questionItem.questionBase.question : "Type here the form question..."}
                                                name='form-question'
                                                id={`form-name-inline-${questionItem.questionBase.id}`}
                                                onChange={(e, data) => {
                                                    questionItem.textInputAnswer.text = data?.value
                                                }}
                                            />
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

    }, [rerenderQuestions] )



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


    const notify = () => toast('Created successfully')

    async function submitSurveyForm() {

        // TODO: Implement the function
        console.error("createSurveyForm in CreateForm.tsx: ln: 220 is not implemented yet!")
    }

    function handleButtonClick() {
        submitSurveyForm().then(() => {
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
                <FormButton
                    onClick={handleButtonClick}
                    content='Submit Form'
                    type='submit'
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

export {JoinSurvey}