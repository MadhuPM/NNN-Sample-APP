import React from 'react'
import PropTypes from 'prop-types'
import { arc, pie } from 'd3-shape'
import { registerD3Events, bindEvents } from './events'
import { TransitionArc, transitionPropTypes } from './transition'

export class Donut extends React.Component {
    static defaultProps = {
        transition: {}
    }

    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        events: PropTypes.object,
        radius: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        styles: PropTypes.shape({ donut: PropTypes.object }),
        transition: transitionPropTypes
    }

    render() {
        let { radius, data, styles: donut, transition, width, height, events } = this.props,
            reducer = (accumulator, current) => accumulator + current.value,
            comparer = (a, b) => a.order - b.order

        data.sort(comparer)//dot not omit this sort

        radius = radius || Math.min(width, height) / 2

        let _arc = arc()
            .outerRadius(radius)
            .innerRadius(donut.innerRadius ? donut.innerRadius : radius * 0.75)

        let _pie = pie().value(i => i.value).sort(comparer)//dot not omit this sort as well

        let fontSize = radius * 0.3
        let sum = data.reduce(reducer, 0)

        return (
            <g transform={`translate(${radius},${radius})`}>
                {
                    _pie(data).map((item, index) => {
                        let _events = bindEvents(events, item.data, index)
                        let {
                            startAngle,
                            value,
                            endAngle,
                            padAngle
                        } = item
                        let fill = donut.colors[index % donut.colors.length]

                        return (
                            <TransitionArc key={index} 
                                className='arc'
                                arc={_arc}
                                index={index} 
                                value={value} 
                                startAngle={startAngle} 
                                endAngle={endAngle} 
                                padAngle={padAngle}
                                style={{fill:fill}}
                                enable={transition.enable}
                                duration={transition.duration}
                                onEnter={transition.onEnter}
                                {..._events}
                            />
                        )
                    })
                }
                <text fontSize={fontSize}
                    transform={`translate(0,${fontSize * 0.33})`}
                    textAnchor={'middle'}
                >
                    {sum}
                </text>
            </g>
        )
    }
}