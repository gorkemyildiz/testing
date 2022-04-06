import {BookmarkIcon, Button, EditIcon, Flex, gridCellMultipleFocusableBehavior, Table} from "@fluentui/react-northstar";
import {collection, onSnapshot} from "firebase/firestore";
import {FC, useEffect, useState} from "react"
import {useHistory} from "react-router-dom";
import {db} from "../../firebase-config";
import {FeedbackForm} from "../../models";

import '../lesson/Lesson-List.css'

type Props = {}

const SurveyList: FC<Props> = ({}) => {
    const header = {
        key: 'header',
        items: [
            {content: 'Survey Name', key: 'surveyName'},
            {content: 'actions', key: 'pic'}
        ]
    }

    const history = useHistory();
    const surveyColletion = collection(db, "surveys")
    const [surveys, setSurveys] = useState<Array<FeedbackForm>>(() => []);
    const [refreshSurveys, setRefreshSurveys] = useState<boolean>(false);

    // Bu fonksiyonu da olusturdugum ve calistigini bildigim sayfalara yonlendirecek sekilde duzenledim.
    function actionCell(id: string) {
        return {
            content: (
                <Flex gap='gap.small' vAlign='center'>
                    <Button icon={<EditIcon/>} text iconOnly title='Edit Survey'
                            onClick={() => history.push(`/edit-survey?id=${id}`)}/>
                    <Button icon={<BookmarkIcon/>} text iconOnly title='Join Survey'
                            onClick={() => history.push(`/join-survey?id=${id}`)}/>
                </Flex>
            ),
            accessibility: gridCellMultipleFocusableBehavior
        }
    }

    useEffect(() => {
        return () => {
            setRefreshSurveys(true)
        };
    }, []);


    useEffect(() => {
        if (refreshSurveys) {

            const unsub = onSnapshot(surveyColletion, (data) => {

                let surveyArray: Array<FeedbackForm> = []

                data.docs.forEach(doc => {
                    surveyArray.push({
                        id: doc.id,
                        name: doc.data().name
                    })
                })
                setSurveys(surveyArray)
                setRefreshSurveys(false)
            })
        }
    }, [refreshSurveys]);

    let rows = surveys.map((item, index) => {
        let plan = {
            key: index,
            items: [
                {key: 'surveyName', content: item.name},
                {key: 'actions', ...actionCell(item.id!)}
            ]
        }

        return plan;

    })

    return (
        <Table variables={{cellContentOverflow: 'none'}} header={header} rows={rows} aria-label='Static Table'/>
    )
}

export { SurveyList }