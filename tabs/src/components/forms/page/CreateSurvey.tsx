import { Breadcrumb, Divider, Grid } from "@fluentui/react-northstar"
import {FC} from "react"
import { CreateForm } from "../CreateForm"


const CreateSurvey : FC = () => {

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
                    <Breadcrumb.Link href='/#/create-survey'>Create Survey</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Divider/>

            <Grid
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >
                <CreateForm/>
            </Grid>
        </div>
    )
}

export default CreateSurvey