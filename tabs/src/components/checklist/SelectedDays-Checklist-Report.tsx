import * as React from 'react';
import { Table, Divider, Flex, Segment, Text } from '@fluentui/react-northstar';
import {
    Calendar,
    FocusTrapZone,
    Callout,
    DirectionalHint,
    defaultCalendarStrings,
    DefaultButton,
    ITag,
    IBasePickerSuggestionsProps,
    TagPicker,
    Label,
    Pivot,
    PivotItem
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from '../../firebase-config';
import { useState, useEffect } from 'react';
import { Providers } from '@microsoft/mgt-element';
import PieChart from "../charts/PieChart";
import BarChart from "../charts/BarChart";
import "./SelectedDays-Checklist-Report.css";


export default function SelectedDaysCheckListReport() {

    const header = {
        key: 'header',
        items: [
            { content: 'Days', key: 'days', },
            { content: 'Checklist done', key: 'check-list-done', },
            { content: 'Checklist undone', key: 'check-list-undone', },
            { content: 'Progress', key: 'progress' },
        ],
    };


    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const [showCalendar, { toggle: toggleShowCalendar, setFalse: hideCalendar }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const [selectedDateTwo, setSelectedDateTwo] = React.useState<Date>(new Date());
    const [showCalendarTwo, { toggle: toggleShowCalendarTwo, setFalse: hideCalendarTwo }] = useBoolean(false);
    const buttonContainerRefTwo = React.useRef<HTMLDivElement>(null);

    const onSelectDate = React.useCallback(
        (date: Date, dateRangeArray: Date[]): void => {
            setSelectedDate(date);
            hideCalendar();
        },
        [hideCalendar],
    );

    const onSelectDateTwo = React.useCallback(
        (date: Date, dateRangeArray: Date[]): void => {
            setSelectedDateTwo(date);
            hideCalendarTwo();
        },
        [hideCalendarTwo],
    );

    /*---*/

    const [selectedUsers, setSelectedUsers] = useState<ITag[]>([])

    const [userTags, setUserTags] = useState<ITag[]>([])

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested users',
        noResultsFoundText: 'No user tags found',
    };

    useEffect(() => {

        getPeoples();

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

    var userPickerId = useId('userId')

    let provider = Providers.globalProvider

    function getPeoples() {
        provider.graph.client.api('/users').version('beta').get().then(response => {

            var users = response.value as any[];

            var mapped = users.map(item => ({ key: item.id, name: item.displayName })) as ITag[];

            setUserTags(mapped);

            return mapped;

        })
    }

    const onUserChange = (users: ITag[]) => {
        setSelectedUsers(users);
    }

    const getTextFromItem = (item: ITag) => item.name;

    var ClUserId = Object.values(selectedUsers)[0] !== undefined ? String(Object.values(selectedUsers)[0].key) : "";
    var ClUserName = Object.values(selectedUsers)[0] !== undefined ? String(Object.values(selectedUsers)[0].name) : "";


    var [checkListUserDayBased, setCheckListUserDayBased] = React.useState<any[]>([]);

    const checkUserListDb = collection(db, "checklist-user");
    useEffect(() => {

        const q = query(checkUserListDb, where("userId", "==", ClUserId));

        const unsub = onSnapshot(q, (data) => {
            var lessArray = Array<any>();

            data.docs.forEach(doc => {

                lessArray.push({
                    checkedItems: doc.data().checkedItems,
                    checklistId: doc.data().checklistId,
                    timestamp: doc.data().timestamp,
                    userId: doc.data().userId
                })

            })

            setCheckListUserDayBased(lessArray);

        });

    },[ClUserId])

    var [checkListDayBased, setCheckListDayBased] = React.useState<any[]>([]);

    const checkListDb = collection(db, "checklist");
    useEffect(() => {

        const q = query(checkListDb, where('selectedUsers', 'array-contains', { key: ClUserId, name: ClUserName }));

        const unsub = onSnapshot(q, (data) => {
            var lessArray = Array<any>();

            data.docs.forEach(doc => {

                lessArray.push({
                    items: doc.data().items,
                    name: doc.data().name,
                    selectedTeams: doc.data().selectedTeams,
                    selectedUsers: doc.data().selectedUsers,
                    timestamp: doc.data().timestamp
                })

            })

            setCheckListDayBased(lessArray);

        });

    },[ClUserId])

    var chListname = Object.values(checkListDayBased)[0];
    var checkListNamePrint = (chListname === undefined || chListname === null) ? "Checklist name is pending..." : chListname.name;


    var lessArray = Array<any>();
    var totalDone = 0;
    var totalUndone = 0;
    function setRows(checkListDayBased: any[], checkListUserDayBased: any[]) {


        checkListUserDayBased.forEach(item => {
            if (Date.parse(selectedDate.toString()) / 1000 < item["timestamp"]["seconds"] && item["timestamp"]["seconds"] < Date.parse(selectedDateTwo.toString()) / 1000) {
                if (item["checkedItems"]) {
                    var counterDone = 0;
                    var counterUndone = 0;
                    var timeStamp = item["timestamp"]["seconds"];

                    for (var i = 0; i < item["checkedItems"].length; i++) {
                        if (item["checkedItems"][i]["isChecked"] === false) {
                            counterUndone = counterUndone + 1;
                            totalUndone = totalUndone + 1;
                        } else if (item["checkedItems"][i]["isChecked"] === true) {
                            counterDone = counterDone + 1;
                            totalDone = totalDone + 1;
                        }
                    }
                    var obj = {
                        objTimeStamp: timeStamp,
                        objCounterDone: counterDone,
                        objCounterUndone: counterUndone,
                        objProgress: "% ".concat(((counterDone / (counterDone + counterUndone)) * 100).toString())
                    }
                    lessArray.push(obj);
                }
            }
        })
        totalDone = totalDone == 0 && totalUndone == 0 ? 1 : totalDone;
        totalUndone = totalDone == 0 && totalUndone == 0 ? 0 : totalUndone;

        lessArray.sort((a,b) => (a.objTimeStamp < b.objTimeStamp) ? 1 : ((b.objTimeStamp < a.objTimeStamp) ? -1 : 0))

        lessArray.map((obj, i)=>{
            var temp = parseInt(obj.objTimeStamp);
            var date = new Date(temp*1000);
            obj.objTimeStamp = date.toLocaleDateString("tr-TR");
        });
    }

    setRows(checkListDayBased, checkListUserDayBased);


    var rows = lessArray.map((item, index) => {
        var plan = {
            key: index,
            items: [
                { key: 'days', content: item.objTimeStamp },
                { key: 'check-list-done', content: item.objCounterDone },
                { key: 'check-list-undone', content: item.objCounterUndone },
                { key: 'progress', content: item.objProgress }
            ]
        }

        return plan;
    })
    var b = [];
    var array = [
        ['', 'Done', 'Undone'],
    ];
    lessArray.map((obj, i) => {
        b = [obj.objTimeStamp, obj.objCounterDone, obj.objCounterUndone]
        array.push(b);
    });

    return (

        <div className='container'>
            <Text content={checkListNamePrint} color="brand" size="medium" weight="bold" />
            <div>
                <label>Start Date:</label>
                <div ref={buttonContainerRef}>
                    <DefaultButton
                        onClick={toggleShowCalendar}
                        text={!selectedDate ? 'Start Date' : selectedDate.toLocaleDateString()}
                    />
                </div>

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
                                maxDate={new Date()}
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

            <div>
                <label>End Date:</label>
                <div ref={buttonContainerRefTwo}>
                    <DefaultButton
                        onClick={toggleShowCalendarTwo}
                        text={!selectedDateTwo ? 'Start Date' : selectedDateTwo.toLocaleDateString()}
                    />
                </div>

                {showCalendarTwo && (
                    <Callout
                        isBeakVisible={false}
                        gapSpace={0}
                        doNotLayer={false}
                        target={buttonContainerRefTwo}
                        directionalHint={DirectionalHint.bottomLeftEdge}
                        onDismiss={hideCalendarTwo}
                        setInitialFocus
                    >
                        <FocusTrapZone isClickableOutsideFocusTrap>
                            <Calendar
                                /*
                                // @ts-ignore */
                                onSelectDate={onSelectDateTwo}
                                onDismiss={hideCalendarTwo}
                                isMonthPickerVisible
                                maxDate={new Date()}
                                value={selectedDateTwo}
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

            <Divider />
            <Flex gap="gap.small">
                <Segment style={{ width: '100%', backgroundColor: 'transparent', boxShadow: 'none', paddingTop: '0px', paddingLeft: '0px', paddingRight: '0px' }}>
                    <label htmlFor={userPickerId}>Choose users</label>

                    <TagPicker
                        removeButtonAriaLabel="Remove"
                        selectionAriaLabel="Selected users"
                        /*
                                        // @ts-ignore */
                        onResolveSuggestions={filterSuggestedUserTags}
                        getTextFromItem={getTextFromItem}
                        pickerSuggestionsProps={pickerSuggestionsProps}
                        itemLimit={1}
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
            <Divider />

            <Pivot aria-label="Links of Tab Style Pivot Example" linkSize="large">
                <PivotItem headerText="Detail Lists">
                    <Divider />
                    <Label>
                        <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={rows} aria-label="Static table" />
                    </Label>
                </PivotItem>
                <PivotItem headerText="Chart">
                    <Divider />
                    <Label>
                        <div className='rowC'>
                            <PieChart ttlDone = {totalDone} ttlUnDone = {totalUndone}/>
                            <BarChart arr = {array} userId = {ClUserId}/>
                        </div>
                    </Label>
                </PivotItem>
            </Pivot>

        </div>

    )
};
