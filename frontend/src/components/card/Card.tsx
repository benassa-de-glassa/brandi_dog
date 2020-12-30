import React from 'react'
import { CardProps, colorToUnicode, CardKey } from '../../models/card.model'

export default function Card(props: CardProps) {
    let className = props.highlighted
        ? "card card-highlighted"
        : props.selected
            ? "card card-selected"
            : "card"

    // change the color to red for hearts and diamonds, black remains default
    // value to keep jokers black 
    let textColor = (props.color === 'hearts' || props.color === 'diamonds') ? 'red' : 'black'
    return (
        <div
            className={className}
            onClick={props.clickHandler}
        >
            <span className={`card-value card-${textColor}`}>{CardKey[props.value]}</span>
            <span className={`card-color card-${textColor}`}>{colorToUnicode[props.color]}</span>
        </div>
    )
}