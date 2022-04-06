import { Button, Divider } from "@fluentui/react-northstar"
import {FC, useState} from "react"
import { useHistory } from "react-router-dom"
import {SurveyList} from "../SurveyList"

type Props = {

}

const Surveys : FC<Props> = ({

}) => {
    const history = useHistory()
    const [clickedButton, setClickedButton] = useState<string>(() => '');
    const navigateTo = () => history.push('/create-survey')

    return(
        <div className='container'>

            <Button onClick={navigateTo} content='Create New Survey'/>
            <Divider/>

            <SurveyList/>

        </div>
    )
}

export default Surveys