import React, { useEffect, useState } from 'react'
import "./Create-Lesson-Form.css";
import {
    Form,
    FormInput,
    FormDropdown,
    FormRadioGroup,
    FormSlider,
    FormCheckbox,
    FormDatepicker,
    FormButton,
    FormTextArea,
    Grid,
    Button,
    mergeStyles,
} from '@fluentui/react-northstar'

import { db } from '../../firebase-config';
import { collection, getDocs, addDoc, doc, Timestamp, setDoc } from "firebase/firestore"
import { useHistory } from 'react-router-dom';
import { IBasePickerSuggestionsProps, ITag, TagPicker } from '@fluentui/react';
import { Providers } from '@microsoft/mgt-element';
import { useId } from '@fluentui/react-hooks';

interface Lesson {
    id: string;
    lessonName: string;
}




export default function CreateLessonForm() {

    const [isLoading, setIsLoading] = useState(false);

    const [teamTags, setTeamTags] = useState<ITag[]>([])

    const [selectedTeams, setSelectedTeams] = useState<ITag[]>([])

    const navigateTo = () => history.push('/lessons');

    const lessonCollection = collection(db, "lessons");

    const [lessons, setLessons] = useState(Array<Lesson>());

    const history = useHistory();

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


    useEffect(() => {
        const getLessons = async () => {
            const data = await getDocs(lessonCollection);
            // var lessonsArray = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

            var lessArray = Array<Lesson>();

            data.docs.forEach(doc => {

                lessArray.push({
                    id: doc.id,
                    lessonName: doc.data().lessonName
                })

            })

            setLessons(lessArray);

        }

        getLessons();

        getTeams();

    }, [])




    const createLesson = async (lessonName: any) => {
        await addDoc(lessonCollection,
            {
                lessonName: lessonName,
                selectedTeams: selectedTeams,
                timestamp: Timestamp.fromDate(new Date())
            })
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const data = new FormData(event.target);

        const lessonName = data.get('lessonName');

        console.log(data.get('lessonName'));

        setIsLoading(true);

        createLesson(lessonName).then(res => {

            setTimeout(() => {

                setIsLoading(false);

                navigateTo();
            }, 1500);

        })

    }

    const rootClass = mergeStyles({
        maxWidth: 500,
    });

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested users',
        noResultsFoundText: 'No user tags found',
    };

    const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }
        return tagList.some(compareTag => compareTag.key === tag.key);
    };

    const onTeamChange = (users: ITag[]) => {

        setSelectedTeams(users);
    }

    const filterSuggestedTeamTags = (filterText: string, tagList: ITag[]): ITag[] => {
        return filterText
            ? teamTags.filter(
                tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, tagList),
            )
            : [];
    };

    const getTextFromItem = (item: ITag) => item.name;


    const teamPickerId = useId('teamId')


    return (

        <Form
            onSubmit={handleSubmit}
        >

            <FormInput label="Lesson Name" name="lessonName" id="first-name-inline" inline required />

            <label htmlFor={teamPickerId!}>Choose teams</label>
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
                    id: teamPickerId!,
                }}
                /*
                // @ts-ignore */
                onChange={onTeamChange}

            />


            <Grid>

                <FormButton loading={isLoading} type='submit' content="Create" />

                <br></br>

                <Button onClick={navigateTo} type='button' content="Cancel" />
            </Grid>



        </Form>


    )



}
