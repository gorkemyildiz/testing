import { Button, Divider, FormInput, Grid, Input } from '@fluentui/react-northstar';
import * as React from 'react';
import { useState } from 'react';
import LessonList from './Lesson-List';
import "./Lessons.css";
import { useHistory } from "react-router-dom";


export default function Lessons() {

  const history = useHistory();

  const [clickedButton, setClickedButton] = useState('');

  const navigateTo = () => history.push('/create-lesson');//eg.history.push('/login');


  return (
    <div className='container'>

      <Button onClick={navigateTo} content="Create New Lesson" />

      <Divider/>

      <LessonList/>
    </div>
  );
}
