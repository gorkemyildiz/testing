// Conceptually parent class for Form Question
interface FormQuestionBase {
    id: string;
    question?: string;
}

interface AnswerBase {
   id: string;
   text?: string;
   questionId?: string;
}

interface MultipleOptionsAnswer {
    answerOptions?: Array<AnswerBase>
    selectedOptionIndex?: number
}

interface FormQuestion {
    questionBase: FormQuestionBase
    isMultipleOption: boolean
    textInputAnswer: AnswerBase
    multipleOptionAnswer: MultipleOptionsAnswer
}

interface FeedbackForm {
    id: string
    name: string
    feedbackQuestions?: Array<FormQuestion>
}

export type {
    FeedbackForm,
    FormQuestionBase,
    FormQuestion,
    MultipleOptionsAnswer,
    AnswerBase
}