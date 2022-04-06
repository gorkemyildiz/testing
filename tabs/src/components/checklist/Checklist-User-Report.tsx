import * as React from 'react';
import { ApprovalsAppbarIcon, BookmarkIcon, Button, CallVideoIcon, Divider, EditIcon, ExcelIcon, FilesVideoIcon, Flex, gridCellMultipleFocusableBehavior, gridCellWithFocusableElementBehavior, mergeStyles, MoreIcon, Segment, Table, TeamCreateIcon, TrashCanIcon, VideomailIcon, WindowRestoreIcon } from '@fluentui/react-northstar';
import { useHistory, useLocation } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from '../../firebase-config'; 
import { useState } from 'react';
import { CheckList } from '../../models/checklist';
// @ts-ignore
import * as FileSaver from "file-saver";
// @ts-ignore
import * as XLSX from "xlsx";

import {
    Calendar,
    FocusTrapZone,
    Callout,
    DirectionalHint,
    defaultCalendarStrings,
    DefaultButton,
    TagPicker,
    IBasePickerSuggestionsProps,
    ITag,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { Providers } from '@microsoft/mgt-element';
import { BackIcon } from '@fluentui/react-icons-mdl2';

import './Checklist-User-Report.css';


export default function ChecklistUserReport() {

    const header = {
        key: 'header',
        items: [
            { content: 'User Name', key: 'name', },
            { content: 'Check Status', key: 'check-status', },
            { content: 'Date', key: 'date', },
            { content: 'Actions', key: 'pic' },
        ],

    };

    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [showCalendar, { toggle: toggleShowCalendar, setFalse: hideCalendar }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const [selectedUsers, setSelectedUsers] = useState<ITag[]>([])

    const [userTags, setUserTags] = useState<ITag[]>([])



    const rootClass = mergeStyles({
        maxWidth: 500,
    });

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested users',
        noResultsFoundText: 'No user tags found',
    };
    const onSelectDate = React.useCallback(
        (date: Date, dateRangeArray: Date[]): void => {
            setSelectedDate(date);
            hideCalendar();
            var selectDate = selectedDate;

            getChecklist(date)
        },
        [hideCalendar],
    );

    const history = useHistory();

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("id");
    console.log(id);



    async function navigateDailyChecklist(id?: string) {

        if (id) {
            history.push('/daily-checklist?id=' + id);
        }
    }

    async function navigatehecklist() {

        history.push('/list-check');
    }

    function actionCell(id?: string) {
        return {
            content: (
                <Flex gap="gap.small">

                    <Button icon={<ApprovalsAppbarIcon />} text iconOnly title="Daily Check List" onClick={() => navigateDailyChecklist(id)} />



                    {/* table layout not support now more content in the cell */}
                    {/* <Button tabIndex={-1} icon="edit" circular text iconOnly title="edit tags" /> */}
                </Flex>
            ),
            accessibility: gridCellMultipleFocusableBehavior
        };
    }



    const [users, setUsers] = React.useState(Array<any>());

    let checklistSubscriber: any = null;

    const getChecklist = async (date?: Date) => {
        const docRef = doc(db, "checklist", id!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());

            var checklist = docSnap.data();
            var selectedUsers = checklist.selectedUsers as any[];

            if (!selectedDate) {
                setSelectedDate(new Date())
            }

            if (!date && !selectedDate) {
                date = new Date();
            } else if (!date) {
                date = selectedDate;
            }


            var dateString = date?.getDate() + "/" + date?.getMonth() + "/" + date?.getFullYear();

            const quizResultsCollections = collection(db, "checklist-user");

            const q = query(quizResultsCollections, where("checklistId", "==", id), where("date", "==", dateString));



            checklistSubscriber = onSnapshot(q, async (data) => {
                var lessArray = Array<any>();


                if (!data.empty) {
                    var checklistUsers = data.docs;

                    selectedUsers.forEach(item => {


                        var checklistDoc = checklistUsers.find(v => v.data().userId = item.key);

                        if (checklistDoc?.exists) {

                            var checkedItems = checklistDoc.data().checkedItems as any[];

                            var totalLength = checkedItems.length;

                            var filteredCheckedItems = checkedItems.filter(v => v.isChecked == true);

                            var checkedItemsCount = filteredCheckedItems.length;

                            var checkString = checkedItemsCount + "/" + totalLength;

                            var dateString = checklistDoc.data().date;

                            var obj = {
                                userId: item.id,
                                userName: item.name,
                                checkString: checkString,
                                dateString: dateString
                            }

                            lessArray.push(obj);

                        } else {

                            var obj = {
                                userId: item.id,
                                userName: item.name,
                                checkString: "-",
                                dateString: dateString
                            }

                            lessArray.push(obj);

                        }

                    })

                    setUsers(lessArray);

                } else {


                    selectedUsers.forEach(item => {

                        var obj = {
                            userId: item.id,
                            userName: item.name,
                            checkString: "no records",
                            dateString: dateString
                        }

                        lessArray.push(obj);

                    })

                    setUsers(lessArray);

                }



            });




        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }

    }

    React.useEffect(() => {

        getPeoples();

        getChecklist();

    }, [])

    const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }
        return tagList.some(compareTag => compareTag.key === tag.key);
    };

    const filterSuggestedUserTags = (filterText: string, tagList: ITag[]): ITag[] => {

        return filterText
            ? userTags.filter(
                tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, tagList),
            )
            : [];
    };


    var rows = users.map((item, index) => {
        var plan = {
            key: index,
            items: [
                { key: 'name', content: item.userName },
                { key: 'check-status', content: item.checkString },
                { key: 'date', content: item.dateString },
                { key: 'actions', ...actionCell(item.id) }
            ]
        }

        return plan;
    })

    const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const exportToCSV = (apiData: any, fileName: any) => {
        const ws = XLSX.utils.json_to_sheet(apiData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    function exportExcel() {
        exportToCSV(users, "checklist-report");
    }
    const userPickerId = useId('userId')

    let provider = Providers.globalProvider

    function getPeoples() {
        provider.graph.client.api('/users').version('beta').get().then(response => {

            var users = response.value as any[];

            var mapped = users.map(item => ({ key: item.id, name: item.displayName })) as ITag[];

            console.log(response.value)

            setUserTags(mapped);


            return mapped;

        })
    }

    const onUserChange = (users: ITag[]) => {

        setSelectedUsers(users);
    }

    const getTextFromItem = (item: ITag) => item.name;

    return (

        <div className='container'>

            <Flex gap="gap.small">
                <Segment style={{ width: '100%', backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <Button onClick={navigatehecklist} className="backBtn" style={{ marginRight: '2rem', marginTop : '0'}}><BackIcon /></Button> 
                    <Button onClick={exportExcel} className="excelExportBtn" style={{ marginRight: '2rem' }}>
                         <ExcelIcon size="large" /> <span> Excel Export </span>  
                    </Button>  
                </Segment >
                <Segment style={{ width: '100%', backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <div ref={buttonContainerRef}>
                        <div style={{ display: 'inline-block' }}><span>Pick A Date : </span></div>
                        <div style={{ display: 'inline-block' }}>
                            <DefaultButton
                                onClick={toggleShowCalendar}
                                text={!selectedDate ? 'Click for Calendar' : selectedDate.toLocaleDateString()}
                                className='pickDateBtn'
                            />
                            {showCalendar && (
                                <Callout
                                    isBeakVisible={false}
                                    gapSpace={0}
                                    doNotLayer={false}
                                    target={buttonContainerRef}
                                    directionalHint={DirectionalHint.bottomLeftEdge}
                                    onDismiss={hideCalendar}
                                    setInitialFocus
                                >
                                    <FocusTrapZone isClickableOutsideFocusTrap>
                                        <Calendar
                                            /*
                                            // @ts-ignore */
                                            onSelectDate={onSelectDate}
                                            onDismiss={hideCalendar}
                                            isMonthPickerVisible
                                            value={selectedDate}
                                            highlightCurrentMonth
                                            isDayPickerVisible
                                            showGoToToday
                                            // Calendar uses English strings by default. For localized apps, you must override this prop.
                                            strings={defaultCalendarStrings}
                                        />
                                    </FocusTrapZone>
                                </Callout>
                            )}

                        </div>

                    </div>
                </Segment>
                <Segment style={{ width: '100%', backgroundColor: 'transparent', boxShadow: 'none', paddingTop: '0px' }}>
                    <label htmlFor={userPickerId}>Choose users</label>

                    <TagPicker
                        removeButtonAriaLabel="Remove"
                        selectionAriaLabel="Selected users"
                        /*
                                        // @ts-ignore */
                        onResolveSuggestions={filterSuggestedUserTags}
                        getTextFromItem={getTextFromItem}
                        pickerSuggestionsProps={pickerSuggestionsProps}
                        itemLimit={4}
                        // this option tells the picker's callout to render inline instead of in a new layer
                        pickerCalloutProps={{ doNotLayer: true }}
                        inputProps={{
                            id: userPickerId,
                        }}

                        /*
                                        // @ts-ignore */
                        onChange={onUserChange}
                    />
                </Segment>
            </Flex >
            <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={rows} aria-label="Static table" />
        </div >
    )
};

