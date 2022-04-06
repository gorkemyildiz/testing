import { Breadcrumb, Divider, Grid } from "@fluentui/react-northstar"
import {FC} from "react"

import { JoinSurvey } from "../JoinSurvey"


const AttendSurvey : FC = () => {

    return(
        <div>
            <Breadcrumb aria-lable='breadcrumb'>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/'>Home</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider/>

                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/#/surveys'>Surveys</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider/>

                <Breadcrumb.Item>
                    <Breadcrumb.Link href='/#/join-survey'>Join Survey</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Divider/>

            <Grid
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >
                <JoinSurvey/>

            </Grid>
        </div>
    )
}

export default AttendSurvey