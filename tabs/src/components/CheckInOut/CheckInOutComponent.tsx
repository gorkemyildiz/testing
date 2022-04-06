import {BookmarkIcon, Button, EditIcon, Flex, gridCellMultipleFocusableBehavior, Table} from "@fluentui/react-northstar";
import {collection, onSnapshot} from "firebase/firestore";
import {FC, useEffect, useState} from "react"
import {useHistory} from "react-router-dom";
import {db} from "../../firebase-config";
import {CheckInOut} from "../../models";

type Props = {}

const CheckInOutComponent: FC<Props> = ({}) => {
    const header = {
        key: 'header',
        items: [
            {content: 'Create Check In Out', key: 'create-check-in-out'},
            {content: 'actions', key: 'pic'}
        ]
    }

    const history = useHistory();
    const navigateTo = () => history.push('/check-in-out-creator')
    const checkInOutCollection = collection(db, "company/1/company_check_in_out/")
    const [checkInOut, setCheckInOut] = useState<Array<CheckInOut>>(() => []);
    return (
        <div className="container">
            <Button onClick={navigateTo} content='Create new Check in out'/>
            <Table variables={{cellContentOverflow: 'none'}} header={header} aria-label='Static Table'/>
        </div>
    )
}


export {CheckInOutComponent};