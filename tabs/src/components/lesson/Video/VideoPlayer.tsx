import {useBooleanKnob} from "@fluentui/docs-components";
import {List} from "@fluentui/react-northstar";
import React, {useState, FC, useEffect} from "react";
import Video, {RenderCallback, VideoActions, VideoState} from "react-video-renderer";
import {TimeRange} from './timeRange';
import {
    VideoRendererWrapper,
    SelectWrapper,
    ErrorWrapper,
    VideoWrapper,
    MutedIndicator,
    LeftControls,
    RightControls,
    ControlsWrapper,
    TimeRangeWrapper,
    CurrentTime,
    AppWrapper,
    TimebarWrapper,
    VolumeWrapper,
    SpinnerWrapper,
    BuiltWithWrapper,
    PlaybackSpeedWrapper,
    SubtitlesWrapper,
} from './styled';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where,updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { PlayIcon, ChromeFullScreenIcon, PauseIcon } from '@fluentui/react-icons-mdl2';
type Props = {
    selectedVideoUrl: string,
    selectedVideoId:any
}
const VideoPlayer: FC<Props> = ({
                                    selectedVideoUrl = "", selectedVideoId = ""
                                }) => {
    useEffect(() => {
        console.log(selectedVideoUrl + " url budur")
    },[]);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [durationTime, setDurationTime] = useState<number>(0);

    async function onTimeChange(currentTime: number) {
        console.log(currentTime + "şu anki current time bu da " + durationTime)
        if (currentTime===Math.floor(durationTime))
        {
            console.log("== fonksiyonuna geldi")

            await  setVideoFireBase({currentTime:currentTime})
            await  setVideoFireBase({currentTimePercentage:100})
            await  setVideoFireBase({isComplated:true})

        }
           else if(currentTime%10===0)
        {
            console.log(durationTime + " duration")
            console.log(currentTime)
            setCurrentTime(currentTime)
            await  setVideoFireBase({currentTime:currentTime})

            const currentTimePercentage = currentTime * 100 / durationTime
            console.log(currentTimePercentage + " currentTimePercentage")
            await  setVideoFireBase({currentTimePercentage:currentTimePercentage})


        }

        // mod 10
    }


    const onNavigate = (navigate: Function) => (value: number) => {
        if(currentTime>value)
        {
            navigate(value);
        }

    };

    function defaultTime(): number {
        const savedTime = "5"

        if (savedTime) {
            return JSON.parse(savedTime);
        } else {
            return 0;
        } }

    async function  setVideoFireBase(varToUpdate:any) {
        const selectedVideoFb = doc(db, "videos",selectedVideoId);
        console.log("geldi sete")
        console.log(selectedVideoId)
        console.log(selectedVideoUrl)
        await setDoc(selectedVideoFb,varToUpdate, { merge: true}).then(response => {
            console.log(response)
        }).catch(error => {console.log(error.message)})
    }



    return (
            // @ts-ignore
            <Video
                src={selectedVideoUrl}
                autoPlay={true}
                defaultTime={defaultTime}
                onTimeChange={onTimeChange}
            >
                {(video: RenderCallback, state: VideoState, actions: VideoActions) => {
                    let {status, currentTime, buffered, duration, volume, isLoading} = state;
                    setDurationTime(duration) 
                    const onPlayButtonClicked = () => {
                        if (status === 'playing')
                            actions.pause()
                        else
                            actions.play()
                    }

                    return (
                        <div style={{ width : '100%'}} className='wvideo'>
                            {video}

                            {/*  @ts-ignore */}
                            {/*  @ts-ignore */}
                            <div style={{ marginTop : '-4rem', position : 'relative', zIndex : '999', paddingTop: '1rem', paddingBottom: '1rem',  backgroundColor: '#13111154'}}>
                                <button onClick={onPlayButtonClicked}
                                        style={{ float : 'left', width :'7%', display : 'inline-block', height : '2rem', border : 'none', color : '#464eb8', fontSize : '1.5rem', backgroundColor : 'transparent', cursor : 'pointer'}}>
                                    {status === 'playing' ? <PauseIcon /> : <PlayIcon />}
                                </button>
                                <TimeRangeWrapper style={{ width :'86%',  display : 'inline-block', marginTop : '.4rem'}}>
                                    <TimeRange
                                        currentTime={currentTime}
                                        bufferedTime={buffered}
                                        duration={duration}
                                        onChange={onNavigate(actions.navigate)}
                                    />
                                </TimeRangeWrapper>
                                {/*  <button onClick={actions.pause}>Pause</button> */}
                                <button onClick={actions.requestFullscreen} style={{ float : 'right', width :'7%', display : 'inline-block', height : '2rem', border : 'none', color : '#464eb8', fontSize : '1rem', backgroundColor : 'transparent', cursor : 'pointer'}}><ChromeFullScreenIcon/></button>
                            </div>
                        </div>
                    )
                }

                }

            </Video>

        );
    }
    // @ts-ignore
export {VideoPlayer};