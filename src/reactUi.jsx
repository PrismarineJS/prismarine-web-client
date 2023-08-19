//@ts-check
import { renderToDom } from '@zardoy/react-util'

import React, { useEffect } from 'react'
import { LeftTouchArea, RightTouchArea, useUsingTouch, useInterfaceState } from '@dimaka/interface'
import { css } from '@emotion/css'

// todo
useInterfaceState.setState({
    isFlying: false,
    updateCoord: ([coord, state]) => {
        const coordToAction = [
            ['z', -1, 'forward'],
            ['z', 1, 'back'],
            ['x', -1, 'left'],
            ['x', 1, 'right'],
            ['y', 1, 'jump'],
        ]
        // todo refactor
        const actionAndState = state !== 0 ? coordToAction.find(([axis, value]) => axis === coord && value === state) : coordToAction.filter(([axis]) => axis === coord)
        console.log(actionAndState)
        if (!bot) return
        if (state === 0) {
            for (const action of actionAndState) {
                //@ts-ignore
                bot.setControlState(action[2], false)
            }
        } else {
            //@ts-ignore
            bot.setControlState(actionAndState[2], true)
        }
    }
})

const App = () => {
    const usingTouch = useUsingTouch()

    if (!usingTouch) return null
    return (
        <div
            onTouchMove={() => console.log('test')}
            className={css`
                position: fixed;
                inset: 0;
                height: 100%;
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: flex-end;
            `}
        >
            <LeftTouchArea />
            <div />
            <RightTouchArea />
        </div>
    )
}

renderToDom(<App />, {
    strictMode: false,
    selector: '#react-root',
})
