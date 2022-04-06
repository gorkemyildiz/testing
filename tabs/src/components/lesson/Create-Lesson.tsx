import { Avatar, Breadcrumb, Card, CardBody, CardHeader, Divider, Flex, Form, FormButton, FormCheckbox, FormInput, Grid, Input } from "@fluentui/react-northstar";
import { FC, Props } from "react";
import CreateLessonForm from "./Create-Lesson-Form";
import FormExampleComponents from "./Create-Lesson-Form";
import FormExample from "./Create-Lesson-Form";
import "./Create-Lesson.css";

export default function CreateLesson() {



    return (

        <div className="container">

            <Breadcrumb aria-label="breadcrumb">
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Divider />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/#/lessons">Lessons</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Divider />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="">Create Lesson</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Divider></Divider>

            <Grid
                styles={({ theme: { siteVariables } }) => ({
                    backgroundColor: siteVariables.colorScheme.default.background,
                    padding: '20px',
                })}
            >



                <CreateLessonForm></CreateLessonForm>



            </Grid>


        </div>



    );
}