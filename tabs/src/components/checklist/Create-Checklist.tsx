
import {
    Form,
    FormInput,
    FormButton,
    Grid,
    Box,
    List,
    Button,
    Divider,
    Input,
    TextArea,
    Checkbox,
    CloseIcon,
    Flex,
    Breadcrumb,
    mergeStyles
} from '@fluentui/react-northstar'
import { FC, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { addDoc, collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from '../../firebase-config';
import { navigateBack } from "@microsoft/teams-js";
import { connectStorageEmulator } from "firebase/storage";
import toast, { Toaster } from 'react-hot-toast';

import "./Create-Checklist.css";
import { CheckList, CheckListItem } from '../../models/checklist';
import { IToggleStyles, IInputProps, IBasePickerSuggestionsProps, ITag, IBasePicker, TagPicker, Toggle, NormalPeoplePicker, IPersonaProps, ValidationState } from '@fluentui/react';
import React from 'react';
import { useBoolean } from '@fluentui/react-hooks';
import { Providers } from "@microsoft/mgt-element";

import { Login } from "@microsoft/mgt-react";
import { TeamsMsal2Provider } from '@microsoft/mgt';
import { useId } from '@fluentui/react-hooks';

const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested People',
    mostRecentlyUsedHeaderText: 'Suggested Contacts',
    noResultsFoundText: 'No results found',
    loadingText: 'Loading',
    showRemoveButtons: true,
    suggestionsAvailableAlertText: 'People Picker Suggestions available',
    suggestionsContainerAriaLabel: 'Suggested contacts',
};

const checkboxStyles = {
    root: {
        marginTop: 10,
    },
};


export default function CreateCheck() {

    const [name, setName] = useState<string>('')
    const [checklist, setChecklist] = useState<CheckList>({})
    const [mappedQuestions, setMappedQuestions] = useState<any>();
    const [rerenderQuestions, setRerenderQuestions] = useState<boolean>(false); // flag to re-render the questions after any change
    const checklistCollection = collection(db, "checklist");

    const [selectedUsers, setSelectedUsers] = useState<ITag[]>([])

    const [userTags, setUserTags] = useState<ITag[]>([])

    const [teamTags, setTeamTags] = useState<ITag[]>([])

    const rootClass = mergeStyles({
        maxWidth: 500,
    });

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested users',
        noResultsFoundText: 'No user tags found',
    };

    var selectedTeams: ITag[] = [
    ];

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

    const onUserChange = (users: ITag[]) => {

        setSelectedUsers(users);
    }

    const filterSuggestedTeamTags = (filterText: string, tagList: ITag[]): ITag[] => {
        return filterText
            ? teamTags.filter(
                tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, tagList),
            )
            : [];
    };

    const getTextFromItem = (item: ITag) => item.name;



    let provider = Providers.globalProvider

    function getTeams() {
        provider.graph.client.api('/teams').version('beta').get().then(response => {

            console.log(response.value)

            var teams = response.value as any[];

            var mapped = teams.map(item => ({ key: item.id, name: item.displayName })) as ITag[];

            console.log(response.value)

            setTeamTags(mapped);

        })
    }

    function getPeoples() {
        provider.graph.client.api('/users').version('beta').get().then(response => {

            var users = response.value as any[];

            var mapped = users.map(item => ({ key: item.id, name: item.displayName })) as ITag[];

            console.log(response.value)

            setUserTags(mapped);

            return mapped;

        })
    }


    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0) {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }



    // Boş bir soru oluşturuyor
    function addNewItem() {

        if (!checklist.items) {
            checklist.items = [];
        }

        setRerenderQuestions(true)
        var checkListItems: CheckListItem = {
            text: '',
            checklistItemId: generateUUID()
        }

        checklist?.items?.push(checkListItems);
        console.log(`${checklist}`)
    }

    function removeQuestion(item: any) {
        setRerenderQuestions(true)
        var index = checklist?.items?.indexOf(item) as number; // Let's say it's Bob.

        if (checklist?.items) {
            delete checklist?.items[index];
        }
    }


    const navigateTo = () => history.push('/list-check');

    const notify = () => toast('Created successfully');

    async function createQuizForm() {
        console.log(checklist);

        checklist.timestamp = Timestamp.fromDate(new Date());
        checklist.name = name;

        checklist.selectedUsers = selectedUsers;

        checklist.selectedTeams = selectedTeams;

        const newCityRef = doc(collection(db, "checklist"));

        console.log(checklist);

        await setDoc(newCityRef, checklist);

        notify();

        setTimeout(() => {
            navigateTo();
        }, 1500)
    }

    function handleButtonClick() {
        createQuizForm().then(() => {
            navigateTo();
        })
    }

    const history = useHistory();

    useEffect(() => {

        getTeams();
        getPeoples(); 

        if (rerenderQuestions) {
            console.log(`Questions re-rendered`)
            let tempQuestions = checklist?.items?.map((item, checkIndex) => {

                return (
                    <>
                        <TextArea key={`CheckLabel-${checkIndex}-${item.id}`} placeholder="Type here something about your new task..." name="lessonName" id="first-name-inline" onChange={(e, data) => { item.text = data?.value }} />
                        <Box> 
                            <Grid columns={1} style={{ marginTop: '1rem', marginBottom: '1rem' }}>

                                <Button type="button" onClick={() => removeQuestion(item)} content="Remove Item" />
                            </Grid> 
                            <Divider></Divider>
                        </Box>
                    </>
                )
            })
            setMappedQuestions(tempQuestions);
        }

        return () => setRerenderQuestions(false)
    }, [rerenderQuestions]);


    const picker = React.useRef(null);


    const userPickerId = useId('userId')
    const teamPickerId = useId('teamId')


    return (

        <div className="container">




            <Grid columns={1}
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >

                <Login />

                <div>

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

                    <label htmlFor={teamPickerId}>Choose teams</label>
                    <TagPicker
                        removeButtonAriaLabel="Remove"
                        selectionAriaLabel="Selected teams"
                        /*
                                        // @ts-ignore */
                        onResolveSuggestions={filterSuggestedTeamTags}
                        getTextFromItem={getTextFromItem}
                        pickerSuggestionsProps={pickerSuggestionsProps}
                        itemLimit={4}
                        // this option tells the picker's callout to render inline instead of in a new layer
                        pickerCalloutProps={{ doNotLayer: true }}
                        inputProps={{
                            id: teamPickerId,
                        }}

                    />

                </div>

                <Divider></Divider>

                <br></br>


                <Form >
                    <Toaster />
                    <Input fluid label="Check List Name" onChange={(e, data) => { setName(data?.value!) }} placeholder='Please give a name' name="lessonName" id="first-name-inline" inline required />

                    <Divider></Divider>

                    {mappedQuestions}
                    <Button fluid onClick={addNewItem} content="New Item"></Button>
                    <Flex>
                        <Button fluid onClick={handleButtonClick} content="Create" style={{ marginRight: '1rem' }} />
                        <br></br>
                        <Button fluid onClick={() => {
                            history.push('/list-check');
                        }} type="button" content="Cancel" />
                    </Flex>
                </Form>

            </Grid>


        </div>



    )

}

function removeDuplicates(filteredPersonas: IPersonaProps[], currentPersonas: IPersonaProps[]): IPersonaProps[] {
    throw new Error('Function not implemented.');
}

function doesTextStartWith(arg0: string, filterText: string): unknown {
    throw new Error('Function not implemented.');
}

function convertResultsToPromise(personasToReturn: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> {
    throw new Error('Function not implemented.');
}

function mostRecentlyUsed(mostRecentlyUsed: any, currentPersonas: IPersonaProps[]): IPersonaProps[] {
    throw new Error('Function not implemented.');
}

