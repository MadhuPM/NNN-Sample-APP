import React from 'react'
import PropTypes from 'prop-types'
import { line } from 'd3-shape'
import uniq from 'lodash/uniq'
import { TransitionPath, transitionPropTypes } from './transition'

export class Line extends React.Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        styles: PropTypes.object,
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { xScale, yScale, data, xBandwidth, index, styles, transition } = this.props,
            { colors } = styles,
            xOffset = xBandwidth / 2

        let _line = line()
            .x(i => xScale(i.name) + xOffset)
            .y(i => yScale(i.value))
        
        return (
            <TransitionPath
                className='line'
                d={_line(data)}
                fill='none'
                stroke={colors[index % colors.length]}
                strokeWidth={styles.line.strokeWidth}
                strokeLinecap='round'
                enable={transition.enable}
                duration={transition.duration}
                onEnter={transition.onEnter}
            />
        )
    }
}

export class GroupLine extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
        })),
        styles: PropTypes.shape({
            line: PropTypes.shape({
                strokeWidth: PropTypes.number
            }),
            circle: PropTypes.shape({
                r: PropTypes.number
            }),
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { data, styles, transition, ...restProps } = this.props
        let groups = uniq(data.map(i => i.group))
        
        return groups.map((group, i) =>
            <Line key={`${group}`}
                index={i}
                data={data.filter(i => i.group === group)}
                styles={styles}
                transition={transition}
                {...restProps}
            />
        )
    }
}