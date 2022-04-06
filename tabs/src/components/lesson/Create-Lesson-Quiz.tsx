import { Avatar, Breadcrumb, Card, CardBody, CardHeader, Divider, Flex, Form, FormButton, FormCheckbox, FormInput, Grid, Input } from "@fluentui/react-northstar";
import { Component, FC, Props } from "react";
import { Lesson, QuizQuestion } from "../../models/learning";
import CreateLessonForm from "./Create-Lesson-Form";
import FormExampleComponents from "./Create-Lesson-Form";
import FormExample from "./Create-Lesson-Form";
import "./Create-Lesson.css";
import CreateQuizForm from "./Create-Quiz-Form";

export default function CreateLessonQuiz() {

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




                <CreateQuizForm />

            </Grid>


        </div>



    );
}