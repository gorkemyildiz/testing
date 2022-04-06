import React, {FC, useState} from "react";
import {IBasePickerSuggestionsProps, ITag, TagPicker} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
type Props = {
    setUsers:Function
}
const ChooseUsers: FC<Props> = ({
                                    setUsers = () => console.log("empty")
                                }) => {

    const [selectedUsers, setSelectedUsers] = useState<ITag[]>([])
    const [userTags, setUserTags] = useState<ITag[]>([])
    const [teamTags, setTeamTags] = useState<ITag[]>([])
    const userPickerId = useId('userId')
    const teamPickerId = useId('teamId')

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
    const filterSuggestedTeamTags = (filterText: string, tagList: ITag[]): ITag[] => {
        return filterText
            ? teamTags.filter(
                tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, tagList),
            )
            : [];
    };
    const getTextFromItem = (item: ITag) => item.name;
    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested users',
        noResultsFoundText: 'No user tags found',
    };
    const onUserChange = (users: ITag[]) => {

        setSelectedUsers(users);
        setUsers(users)
    }
    return (
        <div>
            <div style={{ marginBottom : '1rem', marginTop : '1rem'}} > 
                <label htmlFor={userPickerId}>Choose users</label>
            </div>
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


                // @ts-ignore
                onChange={onUserChange}
            />
            <div style={{ marginBottom : '1rem', marginTop : '1rem'}} > 
                <label htmlFor={teamPickerId}>Choose teams</label>
            </div> 
            <TagPicker
                removeButtonAriaLabel="Remove"
                selectionAriaLabel="Selected teams"

                                // @ts-ignore
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
    )
}
export {ChooseUsers}