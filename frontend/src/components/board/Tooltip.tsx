import React from 'react'

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
            {props.tooltipActions.map((action: number) =>
                <button id={String(action)} key={action} type="button" className='movebutton'
                    onClick={() => props.tooltipClicked(action)}>
                    <span aria-hidden="true">
                        {action % 70 /* see comment above */}
                    </span>
                </button>
            )}
            <button
                id="close-tooltip"
                type="button"
                className='close'
                aria-label="Close"
                onClick={props.closeTooltip}
            >
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    )
}

export default Tooltip