import React from 'react'
import PropTypes from 'prop-types'
import { TransitionLine, transitionPropTypes } from './transition'

export class Grids extends React.Component {
    static propTypes = {
        xDomain: PropTypes.array,
        yDomain: PropTypes.array,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        width: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        height: PropTypes.number,
        xGrid: PropTypes.bool,
        yGrid: PropTypes.bool,
        styles: PropTypes.shape({
            stroke: PropTypes.string
        }),
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { xBandwidth, xDomain, xScale, yDomain, yScale, width, height, xGrid, yGrid, styles, transition} = this.props, 
            xData = xDomain, yData = yDomain, 
            xOffset = xBandwidth

        return(
            <g className='grids'>
                {
                    xGrid && xData.map((d, i) => 
                    <TransitionLine
                        key={i}
                        className='x-grid'
                        x1={xScale(d)}
                        y1={height}
                        x2={xScale(d)}
                        y2={0}
                        stroke={styles.stroke}
                        transform={`translate(${xOffset},0)`}
                        enable={transition.enable}
                        onEnter={transition.onEnter}
                        transitionOn={transition.transitionOn}
                        duration={transition.duration}
                    />)
                }
                {
                    yGrid && yData.map((d,i)=>
                    <TransitionLine
                        key={i}
                        className='y-grid'
                        x1={0}
                        y1={yScale(d)}
                        x2={width}
                        y2={yScale(d)}
                        stroke={styles.stroke}
                        enable={transition.enable}
                        onEnter={transition.onEnter}
                        transitionOn={transition.transitionOn}
                        duration={transition.duration}
                    />)
                }
            </g>
        )
    }
}