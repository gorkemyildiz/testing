import * as React from 'react';
import { BookmarkIcon, Button, CallVideoIcon, EditIcon, ExcelColorIcon, FilesVideoIcon, Flex, gridCellMultipleFocusableBehavior, gridCellWithFocusableElementBehavior, MoreIcon, Table, TeamCreateIcon, TrashCanIcon, VideomailIcon, WindowRestoreIcon } from '@fluentui/react-northstar';
import "./Lesson-List.css";
import { useHistory } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase-config';

interface Lesson {
    id: string;
    lessonName: string;
}



export default function LessonList() {

    const header = {
        key: 'header',
        items: [
            { content: 'Lesson Name', key: 'name', },
            { content: 'Actions', key: 'pic' },
        ],

    };

    const moreOptionCell = {
        content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
        truncateContent: true,
        accessibility: gridCellWithFocusableElementBehavior,
        onClick: function (e: { stopPropagation: () => void; }) {
            alert('more option button clicked');
            e.stopPropagation();
        },
    };

    async function deleteLesson(id: string) {
        await deleteDoc(doc(db, "lessons", id));

    }

    function actionCell(id: string) {
        return {
            content: (
                <Flex gap="gap.small">

                    <Button icon={<EditIcon />} text iconOnly title="Edit Lesson" onClick={() => navigateToEditLessons(id)} />

                    <Button icon={<BookmarkIcon />} text iconOnly title="Add Quiz" onClick={() => navigateQuiz(id)} />

                    <Button icon={<VideomailIcon />} text iconOnly title="New Video Add" onClick={() => navigateNewVideo(id)} />

                    <Button icon={<CallVideoIcon />} text iconOnly title="Watch Video" onClick={() => navigateVideo(id)} />

                    <Button icon={<TrashCanIcon />} text iconOnly title="Delete Video" onClick={() => deleteLesson(id)} />
                
                    <Button icon={<ExcelColorIcon />} text iconOnly title="Quiz Reports" onClick={() => navigateQuizReport(id)} />
                    {/* table layout not support now more content in the cell */}
                    {/* <Button tabIndex={-1} icon="edit" circular text iconOnly title="edit tags" /> */}
                </Flex>
            ),
            accessibility: gridCellMultipleFocusableBehavior
        };
    }

    const lessonCollection = collection(db, "lessons");

    const [lessons, setLessons] = React.useState(Array<Lesson>());

    const history = useHistory();

    function navigateToEditLessons(id: string) {
        history.push('/edit-lesson?id=' + id)
    }

    function navigateQuiz(id: string) {
        history.push('/create-lesson-quiz?id=' + id)
    }

    function navigateNewVideo(id: string) {
        history.push('/add-video?id=' + id)
    }

    function navigateVideo(id: string) {
        history.push('/watch-video?id=' + id);
    }

    function navigateQuizReport(id: string) {
        history.push('/quiz-reports?lessonId=' + id);
    }

    function RefreshLessons() {
        React.useEffect(() => {

            const q = query(lessonCollection, orderBy('timestamp', 'desc'));

            const unsub = onSnapshot(q, (data) => {
                var lessArray = Array<Lesson>();

                data.docs.forEach(doc => {

                    lessArray.push({
                        id: doc.id,
                        lessonName: doc.data().lessonName
                    })

                })

                setLessons(lessArray);
            });

        }, [])
    }

    RefreshLessons();



    // const rowsPlain = [
    //     {
    //         key: 1,
    //         items: [
    //             { content: '1', key: '1-1' },
    //             {
    //                 content: 'C# Programming',
    //                 truncateContent: true,
    //                 key: '1-2',
    //             },
    //             { key: '1-5', ...actionCell("123") },
    //         ],
    //     },
    //     {
    //         key: 2,
    //         items: [
    //             { content: '2', key: '1-1' },
    //             {
    //                 content: 'Nodejs Programming',
    //                 truncateContent: true,
    //                 key: '1-2',
    //             },
    //             { key: '1-5', ...moreActionCell },
    //         ],
    //     },
    //     {
    //         key: 3,
    //         items: [
    //             { content: '3', key: '1-1' },
    //             {
    //                 content: 'Java Programming',
    //                 truncateContent: true,
    //                 key: '1-2',
    //             },
    //             { key: '1-5', ...moreActionCell },
    //         ],
    //     },
    // ];

    var rows = lessons.map((item, index) => {
        var plan = {
            key: index,
            items: [
                { key: 'lessonName', content: item.lessonName },
                { key: 'actions', ...actionCell(item.id) }
            ]
        }

        return plan;
    })


    return (

        <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={rows} aria-label="Static table" />

    )
};

