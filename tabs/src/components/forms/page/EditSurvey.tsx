import { Breadcrumb, Button, Checkbox, Divider, Flex, Form, FormButton, Grid, Input, Box, List, TextArea, FormInput, CloseIcon } from "@fluentui/react-northstar";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import {FC, useEffect, useState} from "react"
import toast, { Toaster } from "react-hot-toast";
import { useHistory, useLocation } from "react-router-dom";
import { db } from "../../../firebase-config";
import {AnswerBase, FeedbackForm, FormQuestion, MultipleOptionsAnswer } from "../../../models";

type Props = {

}

const EditSurvey : FC<Props> = ({

}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>(false);
    const [survey, setSurvey] = useState<FeedbackForm>();
    const [questions, setQuestions] = useState<Array<FormQuestion>>(() => {
        return []
    });
    const [mappedQuestionsElements, setMappedQuestionsElements] = useState<any>();

    const surveyCollection = collection(db,'surveys')
    const history = useHistory()

    const search = useLocation().search;
    const id = new URLSearchParams(search).get('id')
    console.log(`Survey Id: ${id}`)


    const getSurvey = async () => {
        const docRef = doc(db, 'surveys', id!)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists())
        {
            console.log("Document data:", docSnap.data())
        }
        else
        {
            console.log('No such documents!')
        }

        let obj = {
            id: docSnap.id,
            name: docSnap.data()!.name
        }

        setSurvey(obj)

        // Not that necessary since we have the data in survey state
        const surveyNameInput = document.querySelector('#surveyName') as any
        surveyNameInput.value = obj.name;
    }

    useEffect(() => {
        getSurvey()
        addNewMultiOptionQuestion()
        addNewTextInputQuestion()
    }, []);


    const cancel = () => history.push('/surveys')
    const notify = () => toast('Edited Successfully')

    const createSurvey = async (surveyName: any) => {
        const docRef= doc(db, 'surveys', id!)
        await setDoc(docRef, {surveyName: surveyName})

        // TODO: Complete the function ? ? ?
    }

    const handleSubmit = (event: any) => {
        event.preventDefault()

        const data = new FormData(event.target)
        const surveyName = data.get('surveyName')
        console.log(surveyName)

        setIsLoading(true)

        // This function doesn't return a resolve value. It's ok to use this way for demonstration but fix it
        // before realworld use
        createSurvey(surveyName).then(res => {
            notify()

            setTimeout(() => {
                setIsLoading(false)
                history.push('/surveys')
            }, 1500)
        })

    }

    function handleChange(event: any) {
       survey!.name = event.target.value
       setSurvey(survey)
    }


    const AddNewMultiOption = (answers: MultipleOptionsAnswer, questionId: string) => {

        {/* @ts-ignore */}
        answers.answerOptions.push({
            id: '',
            text: '',
            questionId: questionId
        })
        setRerenderQuestions(true)

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

    // I added this to here with the idea of seperating the editing and creating the survey. But without data connection
    // I couldn't finish it
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
                                        <Flex gap="gap.smaller">
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
                                                style={{paddingLeft: '10px'}}
                                            />
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
                                        <Input key={`AnswerInput-${questionItem}-${questionItem.questionBase.id}`}/>
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
                            />

                            <Box>
                                {
                                    questionItem.isMultipleOption ? (
                                        <Box>
                                            <List defaultSelectedIndex={0} items={answers}/>
                                            <Flex space='between'>
                                                <Button fluid
                                                        onClick={() => AddNewMultiOption(questionItem.multipleOptionAnswer, questionItem.questionBase.id!)}
                                                        content='Add new option'/>
                                                <br/>
                                                <Button fluid type='button' onClick={() => removeQuestion(questionItem)}
                                                        content='Remove'/>
                                            </Flex>
                                        </Box>
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


    }, [rerenderQuestions] )


    return(
        <div className='container'>
            <Toaster/>
            <Breadcrumb aria-lable='breadcrumb'>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/'>Home</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider/>

                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/#/surveys'>Surveys</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider/>

                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/#/edit-survey'>Edit Survey</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Divider/>


            <Grid
                styles={({theme: {siteVariables}}) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px'
                })}
                >

                <Form onSubmit={handleSubmit}>

                    <FormInput onChange={handleChange} label={"Survey Name"} name="surveyName" id='surveyName' inline required/>

                    {mappedQuestionsElements}

                    <Flex>
                        <Button fluid onClick={addNewMultiOptionQuestion} content='New Multi Option Question'/>
                        <Button fluid onClick={addNewTextInputQuestion} content='New Text Input Question'/>
                    </Flex>

                    <Grid>
                        <FormButton loading={isLoading} type='submit' content='Save'/>

                        <br/>

                        <Button onClick={cancel} type='button' content='Cancel'/>

                    </Grid>

                </Form>

            </Grid>

        </div>
    )
}

export default EditSurvey