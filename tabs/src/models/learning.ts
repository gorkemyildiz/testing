import { Timestamp } from "firebase/firestore";

export interface CreateLessonCategoryRequest {
    document?: LessonCategory;
}

export interface LessonCategory {
    id?: string;
    name?: string;
    description?: string;

    version: any;
    firm: any;
    createDate: any;
    copyId: any;
}

export interface Lesson {
    id?: string;
    name?: string;
    categoryId?: number;
    description?: string;
    logoUrl?: string;

    questions?: QuizQuestion[];

    timestamp: Timestamp
}

export interface CreateLessonRequest {
    document?: Lesson;
}

export interface LessonVideo {
    id?: string;

    lessonId?: string;
    videoUrl?: string;
    isComplated?: boolean;
    currentTime?: number;
    extension?: string;
    videoDuration?: number;
    groupTag?: string;
    name?: string;
    timestamp?: Timestamp

    videoUserState?: LessonVideoUserState;
}

export interface CreateLessonVideoRequest {
    document?: LessonVideo;
}

export interface LessonVideoUserState {

    id?: string;
    userId?: number;
    videoId?: number;
    lessonId?: number;
    state?: string;
    progressPercentage?: number;
    currentTimeData?: number;

}

export interface Quiz {

    id?: string;
    questions: QuizQuestion[];
    lessonId: string;
    timestamp: Timestamp;

}


export interface QuizQuestion {

    id?: string;
    text?: string;

    questionAnswers?: QuizQuestionAnswer[];

    selectedAnswer?: QuizQuestionAnswer;

}

export interface QuizQuestionAnswer {

    id?: string;
    text?: string;
    questionId?: string;
    isCorrect?: boolean;

}

export interface CreateLessonQuizRequest {
    token?: string;
    sessionId?: string;
    lessonId?: number;
    quizQuestions?: QuizQuestion[];
}

export interface QuizUserResult {
    id?: string;
    userId?: number;
    lessonId?: number;

    totalCorrectAnswers?: number;
    totalWrongAnwers?: number;
    totalEmptyAnswers?: number;
    score?: number;
}
