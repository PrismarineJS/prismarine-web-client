//@ts-check
import { renderToDom } from '@zardoy/react-util'

import { LeftTouchArea, InventoryNew, RightTouchArea, useUsingTouch, useInterfaceState } from '@dimaka/interface'
import { css } from '@emotion/css'
import { activeModalStack, hideCurrentModal, isGameActive } from './globalState'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import useTypedEventListener from 'use-typed-event-listener'

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

const TouchControls = () => {
    // todo setting
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

const useActivateModal = (/** @type {string} */search, onlyLast = true) => {
    const stack = useProxy(activeModalStack)

    return onlyLast ? stack.at(-1)?.reactType === search : stack.some((modal) => modal.reactType === search)
}

function useIsBotAvailable() {
    const stack = useProxy(activeModalStack)

    return isGameActive(false)
}

function InventoryWrapper() {
    const isInventoryOpen = useActivateModal('inventory', false)
    const [slots, setSlots] = useState(bot.inventory.slots)

    useEffect(() => {
        if (isInventoryOpen) {
            document.exitPointerLock()
        }
    }, [isInventoryOpen])

    useTypedEventListener(document, 'keydown', (e) => {
        // todo use refactored keymap
        if (e.code === 'KeyE' && activeModalStack.at(-1)?.reactType === 'inventory') {
            hideCurrentModal()
        }
    })

    useEffect(() => {
        bot.inventory.on('updateSlot', () => {
            setSlots(bot.inventory.slots)
        })
        // todo need to think of better solution
        window['mcData'] = require('minecraft-data')(bot.version)
        window['mcAssets'] = require('minecraft-assets')(bot.version)
    }, [])

    if (!isInventoryOpen) return null

    return <div className={css`
            position: fixed;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);

            & > div {
                scale: 0.6;
                background: transparent !important;
            }
        `}>
        <InventoryNew slots={slots} action={(oldSlot, newSlotIndex) => {
            bot.moveSlotItem(oldSlot, newSlotIndex)
            // bot.inventory.selectedItem
            // bot.inventory.updateSlot(oldSlot, )
        } } />
    </div>
}

const App = () => {
    const isBotAvailable = useIsBotAvailable()
    if (!isBotAvailable) return null

    return <div>
        <InventoryWrapper />
        <TouchControls />
    </div>
}

renderToDom(<App />, {
    strictMode: false,
    selector: '#react-root',
})
