//@ts-check
import { renderToDom } from '@zardoy/react-util'

import { LeftTouchArea, RightTouchArea, useUsingTouch, useInterfaceState } from '@dimaka/interface'
import { css } from '@emotion/css'
// import DeathScreen from './react/DeathScreen'
import { useSnapshot } from 'valtio'
import { QRCodeSVG } from 'qrcode.react'
import { createPortal } from 'react-dom'
import { contro } from './controls'
import { activeModalStack, isGameActive, miscUiState } from './globalState'
import { options, watchValue } from './optionsStorage'

// todo
useInterfaceState.setState({
    isFlying: false,
    uiCustomization: {
        touchButtonSize: 40,
    },
    updateCoord([coord, state]) {
        const coordToAction = [
            ['z', -1, 'KeyW'],
            ['z', 1, 'KeyS'],
            ['x', -1, 'KeyA'],
            ['x', 1, 'KeyD'],
            ['y', 1, 'Space'], // todo jump
            ['y', -1, 'ShiftLeft'], // todo jump
        ]
        // todo refactor
        const actionAndState = state === 0 ? coordToAction.filter(([axis]) => axis === coord) : coordToAction.find(([axis, value]) => axis === coord && value === state)
        if (!bot) return
        if (state === 0) {
            for (const action of actionAndState) {
                contro.pressedKeyOrButtonChanged({code: action[2],}, false)
            }
        } else {
            //@ts-expect-error
            contro.pressedKeyOrButtonChanged({code: actionAndState[2],}, true)
        }
    }
})

watchValue(options, (o) => {
    useInterfaceState.setState({
        uiCustomization: {
            touchButtonSize: o.touchButtonsSize,
        },
    })
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

const DisplayQr = () => {
    const { currentDisplayQr } = useSnapshot(miscUiState)

    if (!currentDisplayQr) return null

    return createPortal(<div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 15
            }}
            onClick={() => {
                miscUiState.currentDisplayQr = null
            }}
        >
            <QRCodeSVG size={384} value={currentDisplayQr} style={{display: 'block', border: '2px solid black',}} />
        </div>, document.body)

}

const App = () => {
    const isBotAvailable = useIsBotAvailable()
    if (!isBotAvailable) return null

    return <div>
        <DisplayQr />
        <TouchControls />
    </div>
}

renderToDom(<App />, {
    strictMode: false,
    selector: '#react-root',
})
