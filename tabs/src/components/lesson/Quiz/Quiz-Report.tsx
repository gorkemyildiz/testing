import { Breadcrumb, Button, Card, ExcelColorIcon, Flex, Table } from "@fluentui/react-northstar";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../../firebase-config";
// @ts-ignore
import * as FileSaver from "file-saver";
// @ts-ignore
import * as XLSX from "xlsx";


export function QuizReport(): JSX.Element {

    const search = useLocation().search;
    const id = new URLSearchParams(search).get("lessonId");
    console.log(id);

    const [quizResults, setQuizResults] = useState(Array<any>());

    function Refresh() {
        React.useEffect(() => {

            const quizResultsCollections = collection(db, "quiz-results");

            const q = query(quizResultsCollections, where("lessonId", "==", id), orderBy("timestamp", "desc"));

            const unsubQuizResults = onSnapshot(q, (data) => {
                var lessArray = Array<any>();

                data.docs.forEach(doc => {

                    console.log(doc.id, "=>", doc.data());
                    lessArray.push({
                        id: doc.id,
                        correctCount: doc.data().correctCount,
                        emptyCount: doc.data().emptyCount,
                        wrongCount: doc.data().wrongCount,
                        lessonId: doc.data().lessonId,
                        lessonName: doc.data().lessonName,
                        userId: doc.data().userId,
                        userName: doc.data().userName,
                        point: doc.data().point,
                    })

                })

                setQuizResults(lessArray);

            });

        }, [])
    }

    Refresh();

    const header = {
        key: 'header',
        items: [
            { content: 'User Name', key: 'name' },
            { content: 'Lesson Name', key: 'name' },
            { content: 'Correct', key: 'correct' },
            { content: 'Empty', key: 'empty' },
            { content: 'Wrong', key: 'wrong' },
            { content: 'Point', key: 'point' },
        ],
    };

    var quizResultsRows = quizResults.map((item, index) => {

        var shortLessonName = "";

        if (item.lessonName && item.lessonName.length > 30) {
            shortLessonName = item.lessonName.substring(0, 30) + "...";
        } else {
            shortLessonName = item.lessonName
        }

        var plan = {
            key: index,
            items: [
                { key: 'username', content: item.userName },
                { key: 'lessonName', content: shortLessonName },
                { key: 'correctCount', content: item.correctCount },
                { key: 'emptyCount', content: item.emptyCount },
                { key: 'wrongCount', content: item.wrongCount },
                { key: 'point', content: item.point },

            ]
        }

        return plan;
    })

    const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const exportToCSV = (apiData: any, fileName: any) => {
        const ws = XLSX.utils.json_to_sheet(apiData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    function exportExcel() {
        exportToCSV(quizResults, "learning-report");
    }

    return (
        <>
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
                        <Breadcrumb.Link href="">Report Quiz</Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb>

                <Card size="large" style={{ width: 1200 }} aria-roledescription="card with avatar, image and text">
                    <Card.Header>
                        <Flex gap="gap.small">

                            <Flex column>
                                <h3>Quiz Results</h3>
                            </Flex>
                        </Flex>
                    </Card.Header>

                    <br></br>
                    <Card.Body>
                        <Button icon={<ExcelColorIcon />} onClick={exportExcel} content="Export Excel" />

                        <br></br>

                        <Flex column gap="gap.small">
                            <Table variables={{ cellContentOverflow: 'none' }} header={header} rows={quizResultsRows} aria-label="Static table" />
                        </Flex>
                    </Card.Body>
                </Card>
            </div>

        </>


    )


}