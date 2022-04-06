import React, { useEffect } from "react";
// https://fluentsite.z22.web.core.windows.net/quick-start
import { Provider, teamsTheme, Loader } from "@fluentui/react-northstar";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";
import { useTeamsFx } from "./sample/lib/useTeamsFx";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import Tab from "./Tab";
import "./App.css";
import TabConfig from "./TabConfig";
import Lessons from "./lesson/Lessons";
import CreateLesson from "./lesson/Create-Lesson";
import CreateLessonQuiz from "./lesson/Create-Lesson-Quiz";
import WatchVideoComponent from "./lesson/Video/Watch-Video-Component";
import AddNewVideo from "./lesson/Video/New-Video";
import EditLesson from "./lesson/Edit-Lesson";
import TakeQuiz from "./lesson/Quiz/TakeQuiz";
import { QuizReport } from "./lesson/Quiz/Quiz-Report"
import { CheckInOutComponent } from "./CheckInOut/CheckInOutComponent";
import { CheckInOutCreator } from "./CheckInOut/CheckInOutCreator";

import Surveys from './forms/page/Surveys'
import EditSurvey from './forms/page/EditSurvey'
import CreateSurvey from './forms/page/CreateSurvey'
import AttendSurvey from './forms/page/AttendSurvey'
import UserList from "./users/UserList";
import AuthPage from "./auth/AuthPage";

import ListCheckItems from "./checklist/List-CheckItems";
import CreateCheck from "./checklist/Create-Checklist";
import DailyChecklist from "./checklist/Daily-Checklist";
import ChecklistUserReport from "./checklist/Checklist-User-Report";
import SelectedDaysCheckListReport from "./checklist/SelectedDays-Checklist-Report";

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
export default function App() {
  const { theme, loading } = useTeamsFx();


  return (
    <Provider theme={theme || teamsTheme} styles={{ backgroundColor: "#eeeeee" }}>
      <Router>
        <Route exact path="/">
          <Redirect to="/lessons" />
        </Route>
        {loading ? (
          <Loader style={{ margin: 100 }} />
        ) : (
          <>
            <Route exact path='/auth' component={AuthPage} />
            <Route exact path="/privacy" component={Privacy} />
            <Route exact path="/termsofuse" component={TermsOfUse} />
            <Route exact path="/tab" component={Tab} />
            <Route exact path="/lessons" component={Lessons} />
            <Route exact path="/create-lesson" component={CreateLesson} />
            <Route exact path="/edit-lesson" component={EditLesson} />
            <Route exact path="/create-lesson-quiz" component={CreateLessonQuiz} />
            <Route exact path="/watch-video" component={WatchVideoComponent} />
            <Route exact path="/add-video" component={AddNewVideo} />
            <Route exact path="/take-quiz" component={TakeQuiz} />
            <Route exact path="/quiz-reports" component={QuizReport} />
            <Route exact path="/config" component={TabConfig} />
            <Route exact path="/surveys" component={Surveys} />
            <Route exact path="/edit-survey" component={EditSurvey} />
            <Route exact path="/create-survey" component={CreateSurvey} />
            <Route exact path="/join-survey" component={AttendSurvey} />

            <Route exact path="/users" component={UserList} />
            <Route exact path="/create-check" component={CreateCheck} />
            <Route exact path="/list-check" component={ListCheckItems} />
            <Route exact path="/daily-checklist" component={DailyChecklist} />
            <Route exact path="/checklist-user-report" component={ChecklistUserReport} />
            <Route exact path="/check-in-out" component={CheckInOutComponent} />
            <Route exact path="/check-in-out-creator" component={CheckInOutCreator} />
            <Route exact path="/checklist-user-report-selected-days" component={SelectedDaysCheckListReport} />
          </>
        )
        }
      </Router >
    </Provider >
  );
}
