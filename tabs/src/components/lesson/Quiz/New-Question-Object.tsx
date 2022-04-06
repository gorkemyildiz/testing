import React from 'react'

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
    Input,
    RadioGroup,
    Checkbox,
    Button,
    CloseIcon,
} from '@fluentui/react-northstar'



const NewQuestionObject = (props: any) => (


    <div>
        <Input label="Answer" inline></Input>

        <Checkbox label="Correct Answer" />

        <Button icon={<CloseIcon />} text iconOnly title="Close" />
    </div>


);

export default NewQuestionObject;

