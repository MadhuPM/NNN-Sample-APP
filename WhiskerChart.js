import React from 'react'
import PropTypes from 'prop-types'
import { scaleLinear, scaleBand } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { select, selectAll } from 'd3-selection'
import { autoRange, XAxis, YAxis, Container, Grids, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import { bindEvents } from './common/events'
import { isNumberOrNumberString, inject, animationFrame } from './common/util'
import { ToolTip } from './common/tooltip'
import { ShareProps } from './common/propsHelper'

const dataPropType = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    min: PropTypes.any,
    max: PropTypes.any,
    target: PropTypes.any,
    actual: PropTypes.any
}))

const defaultStyles = {
    whisker: {
        range: {
            length: 15,
            stroke: 'black',
            strokeWidth: 0.5,
            strokeWidthII: 2
        },
        rect: {
            length: 10,
            fill: '#64CCE9'
        },
        circle: {
            r: 5,
            fill: 'black'
        }
    },
    legend: {
        fontSize: '14px'
    },
    axis: {
        stroke: 'black'
    },
    grid: {
        stroke: '#CDCDCD'
    }
}


const Range = ({ x, yMin, yMax, styles }) => {
    let halfLen = styles.range.length / 2;
    return (<g>
        {/* top short line */}
        <line stroke={styles.range.stroke} x1={x - halfLen} y1={yMax} x2={x + halfLen} y2={yMax} strokeWidth={styles.range.strokeWidthII} />
        {/* center line */}
        <line stroke={styles.range.stroke} x1={x} y1={yMax} x2={x} y2={yMin} strokeWidth={styles.range.strokeWidth} />
        {/* bottom short line */}
        <line stroke={styles.range.stroke} x1={x - halfLen} y1={yMin} x2={x + halfLen} y2={yMin} strokeWidth={styles.range.strokeWidthII} />
    </g>)
}

Range.propTypes = {
    x: PropTypes.number,
    yMin: PropTypes.number,
    yMax: PropTypes.number,
    styles: PropTypes.object
}

const Target = ({ x, y, styles }) => {
    let halfLen = styles.rect.length / 2

    return (<rect className='target'
        width={styles.rect.length}
        height={styles.rect.length}
        x={x}
        y={y}
        fill={styles.rect.fill}
        transform={`translate(${-halfLen},${-halfLen}) rotate(45,${x + halfLen},${y + halfLen})`}
            />)
};

Target.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    styles: PropTypes.object
}

const Actual = ({ x, y, styles }) => {
    return <circle className='actual' r={styles.circle.r} cx={x} cy={y} fill={styles.circle.fill} />
}

Actual.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    styles: PropTypes.object
}

const Legend = ({ x, y, styles, width, height, legendData }) => {
    let halfLen = styles.whisker.rect.length / 2, cx = 5, cy = 5, rx = 5, ry = 40, textIndent = 10

    x = typeof x === 'function' ? x(width, height) : x
    y = typeof y === 'function' ? y(width, height) : y

    return legendData && (<g transform={`translate(${x},${y})`}>
        <circle className='actual' r={styles.whisker.circle.r} cx={cx} cy={cy} fill={styles.whisker.circle.fill} />
        <text x={cx + textIndent} y={cx} alignmentBaseline='middle' fontSize={styles.legend.fontSize}>{legendData[0]}</text>
        <rect className='target'
            width={styles.whisker.rect.length}
            height={styles.whisker.rect.length}
            x={rx}
            y={ry}
            fill={styles.whisker.rect.fill}
            transform={`translate(${-halfLen},${-halfLen}) rotate(45,${rx + halfLen},${ry + halfLen})`}

        />
        <text x={rx + textIndent} y={ry} alignmentBaseline='middle' fontSize={styles.legend.fontSize}>{legendData[1]}</text>
    </g>)
}

Legend.propTypes = {
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    styles: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    legendData: PropTypes.array
}

const EventArea = ({x, y, width, height, ...restProps}) => {
    return (
        <rect className='event-area' x={x} y={y} width={width} height={height} fill="transparent" {...restProps}/>
    )
}

EventArea.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
} 


const Whisker = ({ data, events, height, xScale, yScale, xBandwidth, styles }) => {
    let xOffset = xBandwidth / 2
    return (<g>
        {
            data.map(
                ({ name, min, max, target, actual }, index) => {
                    let _events = bindEvents(events, { name, min, max, target, actual }, index)

                    return (<g key={name}>
                        {
                            isNumberOrNumberString(min) && isNumberOrNumberString(max) &&
                            <Range yMin={yScale(min)} yMax={yScale(max)} x={xScale(name) + xOffset} styles={styles}/>
                        }
                        {
                            isNumberOrNumberString(target) &&
                            <Target
                                target={target}
                                x={xScale(name) + xOffset}
                                y={yScale(target)}
                                styles={styles}
                            />
                        }
                        {
                            isNumberOrNumberString(actual) &&
                            <Actual
                                x={xScale(name) + xOffset}
                                y={yScale(actual)}
                                styles={styles}
                            />
                        }

                        <EventArea 
                            x={xScale(name)} 
                            y={0} 
                            width={xBandwidth} 
                            height={height} 
                            {..._events}
                        />
                    </g>)
                })
        }
    </g>)
} 

Whisker.propTypes = {
    xScale: PropTypes.func,
    yScale: PropTypes.func,
    data: dataPropType,
    events: PropTypes.object,
    height: PropTypes.number,
    xBandwidth: PropTypes.number,
    styles: PropTypes.object
}

export default class WhiskerChart extends React.Component {
    static get defaultProps() {
        return {
            legendData: ['Actual','Target'],
            width: 500,
            height: 500,
            paddingRight: 100,
            dataMapper: item => item
        }
    }

    static get propTypes() {
        return {
            ...containerCommonPropTypes,
            events: PropTypes.object,
            range: PropTypes.arrayOf(PropTypes.number),
            legendData: PropTypes.arrayOf(PropTypes.string),
            legendX: PropTypes.number,
            legendY: PropTypes.number,
            data: dataPropType,
            dataMapper: PropTypes.func,
            styles: PropTypes.object
        }
    }
    constructor(props) {
        super(props)
        this.state = {
            showToolTip: false,
            toolTipContent: null,
            toolTipX: 0,
            toolTipY: 0
        }

        this.onMouseOverEventArea = this.onMouseOverEventArea.bind(this)
        this.onMouseOutContainer = this.onMouseOutContainer.bind(this)
        this.events = inject(props.events, 'onMouseOver', this.onMouseOverEventArea)
    }

    onMouseOverEventArea(evt, data) {
        animationFrame(() => {
            this.setState({
                showToolTip: this.props.toolTip? true : false,
                toolTipContent: this.props.toolTip && this.props.toolTip(data)
            })
        })
    }

    onMouseOutContainer(evt) {
        this.setState({ showToolTip: false })
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data, dataMapper, events: _events, range, styles, legendData, legendX, legendY, toolTip, ...restProps } = props
        
        styles = assignStyle(defaultStyles, styles)

        return (
            <Container {...containerProps} onMouseOut={this.onMouseOutContainer}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={scaleBand()}
                    xDomain={data => data.map(d => d.name)}
                    yScale={scaleLinear()}
                    yDomain={range || (data => autoRange(data.map(d => Math.max(d.min || 0, d.max || 0, d.actual || 0, d.target || 0))))}
                    {...restProps}
                >
                    <Grids yGrid styles={styles.grid} />
                    <XAxis tickSize={10} domainAlignment='middle' tickAlignment='middle' styles={styles.axis} />
                    <YAxis tickSize={0} styles={styles.axis} />
                    <Whisker styles={styles.whisker} events={this.events} />
                    <Legend legendData={legendData} x={isFinite(legendX) ? legendX : (w, h) => w + 15} y={isFinite(legendY) ? legendY : 0} styles={styles} />
                </ShareProps>
                <ToolTip
                    display={toolTip ? true : false}
                    show={this.state.showToolTip}
                    traceMouse
                    content={this.state.toolTipContent}
                />
            </Container>
        )
    }
}
