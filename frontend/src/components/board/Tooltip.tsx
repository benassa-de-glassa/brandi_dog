import React from 'react'

import { ActionNumber } from '../../models/action.model'
import { TooltipProps } from '../../models/tooltip.model'

/* 
display the action modulo 70 because e.g. moving 3 after playing a 7 card
is represented by the action '73' but the user should be able to click on '3' 
instead of '73'. 
*/

function Tooltip(props: TooltipProps) {
    return (
        <div
            className='tooltip'
            style={{
                [props.tooltip.anchor.y]: props.tooltip.y,
                [props.tooltip.anchor.x]: props.tooltip.x
            }}
        >
            <p className='tooltip-text'>Choose a move</p>
            <div id="tooltip-options">
            {props.tooltipActions.map((action: ActionNumber) =>
                <button id={String(action)} key={action} className='movebutton btn'
                    onClick={() => props.tooltipClicked(action)}>
                        {action % 70 /* see comment above */}
                    
                </button>
            )}
            </div>
            <button
                id="close-tooltip"
                className='close'
                aria-label="Close"
                onClick={props.closeTooltip}
            >
                <img aria-hidden={true} src="/close.svg" id="close-tooltip-icon" alt="p-icon" />
            </button>
        </div>
    )
}

export default Tooltip