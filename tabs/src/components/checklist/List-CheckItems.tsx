import * as React from 'react';
import { ApprovalsAppbarIcon, BookmarkIcon, Button, CallVideoIcon, ClipboardCopiedToIcon, Divider, EditIcon, ExcelColorIcon, FilesVideoIcon, Flex, gridCellMultipleFocusableBehavior, gridCellWithFocusableElementBehavior, MoreIcon, Table, TeamCreateIcon, TrashCanIcon, VideomailIcon, WindowRestoreIcon, Segment } from '@fluentui/react-northstar';

import { useHistory } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase-config';
import "./List-CheckItems.css";
import { useState } from 'react';
import { CheckList } from '../../models/checklist';
import { DetailsList, DetailsListLayoutMode, Selection, IColumn } from '@fluentui/react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection'; 

export interface IChecklistItem {
    key: number;
    name: string;
    value: number;
}

export default function ListCheckItems() {

    const header = {
        key: 'header',
        items: [
            { content: 'Checklist Name', key: 'name', },
            { content: 'Items Count', key: 'count', },
            { content: 'Actions', key: 'pic' },
        ],

    };

    const history = useHistory();

    const [clickedButton, setClickedButton] = useState('');

    const navigateTo = () => history.push('/create-check');//eg.history.push('/login');

    const moreOptionCell = {
        content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
        truncateContent: true,
        accessibility: gridCellWithFocusableElementBehavior,
        onClick: function (e: { stopPropagation: () => void; }) {
            alert('more option button clicked');
            e.stopPropagation();
        },
    };

    async function deleteLesson(id?: string) {

        if (id) {
            await deleteDoc(doc(db, "checklist", id));
        }
    }

    async function navigateDailyChecklist(id?: string) {

        if (id) {
            history.push('/daily-checklist?id=' + id);
        }
    }

    function actionCell(id?: string) {
        return (
            <Flex gap="gap.small">

                <Button icon={<ClipboardCopiedToIcon />} text iconOnly title="User Report" onClick={() => navigateChecklistUserReport(id!)} />

                <Button icon={<ApprovalsAppbarIcon />} text iconOnly title="Daily Check List" onClick={() => navigateDailyChecklist(id)} />

                <Button icon={<TrashCanIcon />} text iconOnly title="Delete Video" onClick={() => deleteLesson(id)} />

                {/* table layout not support now more content in the cell */}
                {/* <Button tabIndex={-1} icon="edit" circular text iconOnly title="edit tags" /> */}
            </Flex>

        );
    }

    const checklistCollection = collection(db, "checklist");

    const [checklist, setChecklist] = React.useState(Array<CheckList>());

    function navigateToEditLessons(id: string) {
        history.push('/edit-lesson?id=' + id)
    }

    function navigateQuiz(id: string) {
        history.push('/create-lesson-quiz?id=' + id)
    }

    function navigateNewVideo(id: string) {
        history.push('/add-video?id=' + id)
    }

    function navigateChecklistUserReport(id: string) {
        history.push('/checklist-user-report?id=' + id);
    }

    function navigateQuizReport(id: string) {
        history.push('/quiz-reports?lessonId=' + id);
    }

    function navigateChecklistReportDayBased(){
        history.push('/checklist-user-report-selected-days');
    }

    function RefreshLessons() {
        React.useEffect(() => {

            const q = query(checklistCollection, orderBy('timestamp', 'desc'));

            const unsub = onSnapshot(checklistCollection, (data) => {
                var lessArray = Array<CheckList>();

                data.docs.forEach(doc => {

                    lessArray.push({
                        id: doc.id,
                        name: doc.data().name,
                        items: doc.data().items,
                        timestamp: doc.data().timestamp
                    })

                })

                setChecklist(lessArray);
            });

        }, [])
    }

    RefreshLessons();


    var rows = checklist.map((item, index) => {
        return {
            key: index,
            name: item.name,
            count: item.items?.length,
            actions: { ...actionCell(item.id) }
        }
    })

    const [selection, setSelection] = useState<Selection>();
    const columns = [
        { key: 'column1', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Count', fieldName: 'count', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'Actions', fieldName: 'actions', minWidth: 100, maxWidth: 200, isResizable: true }
    ];

    const onItemInvoked = () => {

    }
    return (
        <>
            <div className='container'>
                <Flex gap="gap.small">
                    <Segment style={{ width: '100%', backgroundColor: 'transparent', boxShadow: 'none' }}> 
                        <Button className="createCheckListBtn" onClick={navigateTo}>Create Check List</Button>
                        <Button className="reportsBtn" style={{ float: 'right', display: 'inline-block' }} onClick={() => navigateChecklistReportDayBased()}>Reports</Button>
                    </Segment>
                </Flex>
                <Divider />
                <MarqueeSelection selection={selection!} style={{ textAlign: 'center', justifyContent: 'center' }}>
                    <DetailsList
                        items={rows}
                        columns={columns}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.justified}
                        selection={selection}
                        selectionPreservedOnEmptyClick={true}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        checkButtonAriaLabel="select row"
                        onItemInvoked={onItemInvoked}
                    />
                </MarqueeSelection>
                {/* <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={rows} aria-label="Static table" /> */}
            </div>


        </>

    )
};

