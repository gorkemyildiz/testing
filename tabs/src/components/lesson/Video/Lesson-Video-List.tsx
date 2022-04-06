import { useBooleanKnob } from '@fluentui/docs-components'
import { List, Image, Input, Slider } from '@fluentui/react-northstar'
import React from 'react'

const items = [
    {
        key: 'robert',
        header: 'Video 1',
        content: (
            <div>
                <Slider defaultValue={20} />
            </div>
        ),
    },
    {
        key: 'robert',
        header: 'Video 2',
        content: (
            <div>
                <Slider defaultValue={44} />
            </div>
        ),
    },
    {
        key: 'robert',
        header: 'Video 3',
        content: (
            <div>
                <Slider defaultValue={80} />
            </div>
        ),
    },
    {
        key: 'robert',
        header: 'Video 4',
        content: (
            <div>
                <Slider defaultValue={35} />
            </div>
        ),
    },
    {
        key: 'robert',
        header: 'Video 5',
        content: (
            <div>
                <Slider defaultValue={45} />
            </div>
        ),
    },
    {
        key: 'robert',
        header: 'Video 6',
        content: (
            <div>
                <Slider defaultValue={76} />
            </div>
        ),
    },
]

const LessonVideoList = () => {
    const [debug] = useBooleanKnob({
        name: 'debug',
    })
    return <List selectable debug={debug} items={items} />
}

export default LessonVideoList