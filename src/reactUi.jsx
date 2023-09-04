//@ts-check
import { renderToDom } from '@zardoy/react-util'

import { LeftTouchArea, RightTouchArea, useUsingTouch, useInterfaceState } from '@dimaka/interface'
import { css } from '@emotion/css'
import { activeModalStack, isGameActive } from './globalState'
import { isProbablyIphone } from './menus/components/common'
// import DeathScreen from './react/DeathScreen'
import { useSnapshot } from 'valtio'
import { contro } from './controls'

// todo
useInterfaceState.setState({
    isFlying: false,
    uiCustomization: {
        touchButtonSize: isProbablyIphone() ? 55 : 40,
    },
    updateCoord: ([coord, state]) => {
        const coordToAction = [
            ['z', -1, 'KeyW'],
            ['z', 1, 'KeyS'],
            ['x', -1, 'KeyA'],
            ['x', 1, 'KeyD'],
            ['y', 1, 'Space'], // todo jump
        ]
        // todo refactor
        const actionAndState = state !== 0 ? coordToAction.find(([axis, value]) => axis === coord && value === state) : coordToAction.filter(([axis]) => axis === coord)
        if (!bot) return
        if (state === 0) {
            for (const action of actionAndState) {
                contro.pressedKeyOrButtonChanged({code: action[2],}, false)
            }
        } else {
            //@ts-ignore
            contro.pressedKeyOrButtonChanged({code: actionAndState[2],}, true)
        }
    }
})

const TouchControls = () => {
    // todo setting
    const usingTouch = useUsingTouch()

    if (!usingTouch) return null
    return (
        <div
            className={css`
                position: fixed;
                inset: 0;
                height: 100%;
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: flex-end;
                pointer-events: none;
                touch-action: none;
                & > div {
                    pointer-events: auto;
                }
            `}
        >
            <LeftTouchArea />
            <div />
            <RightTouchArea />
        </div>
    )
}

function useIsBotAvailable() {
    const stack = useSnapshot(activeModalStack)

    return isGameActive(false)
}

const App = () => {
    const isBotAvailable = useIsBotAvailable()
    // if (!isBotAvailable) return <DeathScreen />

    return <div>
        <TouchControls />
    </div>
}

renderToDom(<App />, {
    strictMode: false,
    selector: '#react-root',
})
