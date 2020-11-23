import React from 'react'

import './card.css'

const color2unicode = {
    // these are the unicode symbols
    spades: '\u2660',
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663'
}

export default function Card(props) {
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
            <span className={`card-value card-${textColor}`}>{props.value}</span>
            <span className={`card-color card-${textColor}`}>{color2unicode[props.color]}</span>
        </div>
    )
}