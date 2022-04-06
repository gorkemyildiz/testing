import {FC,useEffect} from "react";
import { TagPicker, ITag, IBasePickerSuggestionsProps } from '@fluentui/react/lib/Pickers';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { useId } from '@fluentui/react-hooks';
import {GetWorkSpaces} from "./CheckInOutFireBase";
import {WorkSpace} from "../../models";

type Props = {
}
export function addNewWorkSpace  (newWorkSpace:WorkSpace)
{
    testTags.push({name:newWorkSpace.workSpace,key:newWorkSpace.workSpace})
}

const rootClass = mergeStyles({
    maxWidth: 500,
});

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested colors',
    noResultsFoundText: 'No color tags found',
};

const testTags: ITag[] = [];

const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
    if (!tagList || !tagList.length || tagList.length === 0) {
        return false;
    }
    return tagList.some(compareTag => compareTag.key === tag.key);
};

const filterSuggestedTags = (filterText: string, tagList: ITag[]): ITag[] => {
    return filterText
        ? testTags.filter(
            tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, tagList),
        )
        : [];
};

const getTextFromItem = (item: ITag) => item.name;
const WorkSpacePicker: FC<Props> = ({}) => {
    useEffect(() => {
        GetWorkSpaces().then(workspaces => {
            console.log(workspaces)
            workspaces.map(item => {testTags.push({name:item.workSpace,key:item.workSpace})})
        })

        console.log("getlendi")
    }, []);


    const pickerId = useId('inline-picker');
    return (
         <div>
             <div style={{ marginBottom : '1.2rem'}} >
                <label htmlFor={pickerId} >Choose a WorkSpace</label>
            </div>
        <TagPicker
            removeButtonAriaLabel="Remove"
            selectionAriaLabel="Selected WorkSpace"
            /*
                                // @ts-ignore */
            onResolveSuggestions={filterSuggestedTags}
            getTextFromItem={getTextFromItem}
            pickerSuggestionsProps={pickerSuggestionsProps}
            itemLimit={4}
            // this option tells the picker's callout to render inline instead of in a new layer
            pickerCalloutProps={{ doNotLayer: true }}
            inputProps={{
                id: pickerId,
            }}
        /> 
        </div>
    )
}

export {WorkSpacePicker}