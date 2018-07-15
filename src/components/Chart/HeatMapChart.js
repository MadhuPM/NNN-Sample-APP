import React from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal, scaleQuantile } from 'd3-scale'
import { select } from 'd3-selection'
import { Container, XAxis, YAxis, containerCommonPropTypes, extractContainerCommonProps } from './common'
import { assignStyle, delay, niceNumberArray } from './common/util'
import { bindEvents } from './common/events'
import { ShareProps } from './common/propsHelper'
import uniq from 'lodash/uniq'
import _max from 'lodash/max'
import _min from 'lodash/min'

const defaultStyles = {
    heatmap: {
        margin: {
            top: 40,
            left: 60
        }
    },
    axis: {
        stroke:'black'
    },
    plaque: {
        size: 30,
        border: 1,
        borderColor: 'white'
    },
    toolTip: {
        maxWidth: 200,
        border: 2,
        margin: 20,
        backgroundColor: 'white'
    },
    colors : ['#B91224', '#EAB7BD', '#F5DCDE', '#FFEAB4', '#FFF5DA', '#DFEAE2', '#BED5C5', '#28743E']
}

const dataPropType = PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.number
}))

class Legend extends React.Component {
    static get propTypes() {
        return {
            yDomain: PropTypes.array,
            colorScale: PropTypes.func,
            height:PropTypes.number,
            styles: PropTypes.object
        }
    }

    constructor(props) {
        super(props)
        this.nodeRef = null
    }

    componentDidMount() {
        this.renderLegend()
    }

    componentDidUpdate() {
        this.renderLegend()
    }

    renderLegend() {
         let { yDomain, colorScale, styles, ...restProps } = this.props

         let node = select(this.nodeRef)
 
         let height = styles.plaque.size
 
         let width = height * 2
 
         let arr = colorScale.quantiles()
 
         let span = arr[1] - arr[0]
 
         let min = Math.min(...arr) - span
 
         let data = niceNumberArray([min,...arr])

         node.selectAll('.legend').remove()
 
         let legend = node.selectAll('.legend')
             .data(data)
             .enter()
             .append('g')
             .attr('class', 'legend')
             .attr('transform',`translate(0,${yDomain.length * height + 10})`)
 
         legend.append("rect")
             .attr("x", function (d, i) { return width * i })
             .attr("y", 0)
             .attr("width", width)
             .attr("height", height)
             .style("fill", function (d, i) { return styles.colors[i] })
 
         legend.append("text")
             .text(function (d) { return '> ' + d })
             .attr("x", function (d, i) { return width * i })
             .attr("y", height + 20)
    }
    
    render() {
        return (<g ref={ref => this.nodeRef = ref} />)
    }
}

class Plaque extends React.Component {
    static get propTypes() {
        return {
            data: dataPropType,
            events: PropTypes.object,
            xScale: PropTypes.func,
            yScale: PropTypes.func,
            colorScale: PropTypes.func,
            onMouseOver: PropTypes.func,
            onMouseOut: PropTypes.func,
            highlight: PropTypes.func,
            color: PropTypes.string,
            dataX: PropTypes.any,
            dataY: PropTypes.any,
            dataValue: PropTypes.number,
            opacity: PropTypes.number,
            styles: PropTypes.object

        }
    }
    render() {
        let {   data,
                events,
                xScale,
                yScale,
                colorScale,
                color,
                dataX,
                dataY,
                dataValue,
                opacity,
                highlight,
                onMouseOver,
                onMouseOut,
                styles } = this.props,
            { size, border, borderColor } = styles.plaque

            

        return(
            <g onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
                {
                    data.map(
                        ({ x, y, value }, i) => {
                            let _events = bindEvents(events, {x, y, value}, i)
                            return (
                                <rect className='plaque' key={i} x={xScale(x)} y={yScale(y)} 
                                    width={size} 
                                    height={size} 
                                    fill={colorScale(value)} 
                                    opacity={highlight(x,y)? 1 : opacity} 
                                    data-x={x} 
                                    data-y={y} 
                                    data-value={value}
                                    stroke={borderColor} 
                                    strokeWidth={border}
                                    {..._events}
                                />
                            )
                        }
                    )
                }
            </g>
        )
    }

}

class ToolTip extends React.Component {
    static get propTypes() {
        return {
            x: PropTypes.number,
            y: PropTypes.number,
            borderColor: PropTypes.string,
            visible: PropTypes.bool,
            detail: PropTypes.string,
            styles: PropTypes.object
        }
    }
    constructor(props) {
        super(props)

        ToolTip.sequence = ToolTip.sequence || 0

        this.sequence = ToolTip.sequence++
        this.borderRef = null
        this.textRef = null
        this.textPathRef = null
        this.pathId = `ssd-heatmap-tooltip-path-${this.sequence}`
        this.preX = -1
        this.preY = -1
        this.transitionTime = '0.1s'
    }

    componentDidMount() {
        this.renderText()
    }

    componentDidUpdate() {
        this.renderText()
    }

    renderText() {
        if (!this.props.visible) return

        let { x, y, detail, styles } = this.props, { maxWidth, margin } = styles.toolTip
        let { height:lineHeight, width:requiredTextLength } = this.textRef.getBoundingClientRect() 
        let textLength = Math.min(maxWidth - margin * 2, requiredTextLength)
        let linesCount = Math.ceil(requiredTextLength / textLength)

        //calcuate d attribute of svg path
        let pathArr = []
        for (let i = 0; i < linesCount; i++) {
            let path = `M${margin} ${lineHeight * i + lineHeight * 1.5} H${margin + textLength}`
            pathArr.push(path)
        }

        //set d attribute of svg path to break text
        document.getElementById(this.pathId)
            .setAttribute('d', pathArr.join(' '))

        this.borderRef.setAttribute('width', `${textLength + margin * 2 + 2}`)
        this.borderRef.setAttribute('height', `${lineHeight * linesCount + lineHeight * 1.5}`)
    }

    canTransite() {
        let { x, y } = this.props
        let result = this.preX > -1 && this.preY > -1 && x + y != this.preX + this.preY

        this.preX = x
        this.preY = y
            
        return result
    }
    render() {
        let { x, y, borderColor, visible, detail, styles } = this.props,
            { border, backgroundColor } = styles.toolTip,
            transite = this.canTransite()

        return (<g className='ssd-heatmap-tooltip-wrapper'>
            {/* border */}
            <rect x={x} y={y} style={{transition: visible && transite ? `x ${this.transitionTime} ease, y ${this.transitionTime} ease` : ''}}
                fill={backgroundColor} 
                stroke={borderColor} 
                strokeWidth={border} 
                ref={ref => this.borderRef = ref} 
                opacity={visible? 1 : 0}
            />

            {/*invisible original text used to measure required text length*/}
            <text ref={ref => this.textRef = ref} visibility={'hidden'}>{detail}</text>
            
            {/* text */}
            <g className='ssd-heatmap-tooltiop-text' transform={`translate(${x},${y})`} style={{ transition: visible && transite ? `all ${this.transitionTime} ease` : '' }}>
                <path id={this.pathId} d={`M0 0 H5000`}/>
                <text opacity={visible ? 1 : 0}>
                    <textPath xlinkHref={`#${this.pathId}`} ref={ref => this.textPathRef = ref}>
                        {detail}
                    </textPath>
                </text>
            </g>
        </g>)
    }
}

export default class HeatMapChart extends React.Component {
    static get defaultProps() {
        return {
            width: 800,
            height: 600,
            dataMapper: item => item,
            toolTipMapper: (x, y, value) => value
        }
    }

    static get propTypes() {
        return {
            ...containerCommonPropTypes,
            dataMapper: PropTypes.func,
            events: PropTypes.object,
            toolTipMapper: PropTypes.func,
            data: dataPropType
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            plaqueOpacity: 1,
            toolTipX: -1,
            toolTipY: -1,
            selectedDataX: '',
            selectedDataY: '',
            selectedDataValue: '',
            toolTipVisible: false,
            toolTipBorderColor: 'none'
        }
        this.onMouseOverPlaque = this.onMouseOverPlaque.bind(this)
        this.onMouseOutPlaque = this.onMouseOutPlaque.bind(this)
        this.styles = null
    }

    onMouseOverPlaque(evt) {
        let target = evt.target, { size, border } = this.styles.plaque

        delay('default',()=>{
            this.setState({
                plaqueOpacity: 0.85,
                toolTipX: parseFloat(target.getAttribute('x')) + size + border,
                toolTipY: parseFloat(target.getAttribute('y')) + size + border,
                selectedDataX: target.getAttribute('data-x'),
                selectedDataY: target.getAttribute('data-y'),
                selectedDataValue: target.getAttribute('data-value'),
                toolTipBorderColor: target.getAttribute('fill'),
                toolTipVisible: true
            })
        })
    }

    onMouseOutPlaque() {
        delay('default',()=>{
            this.setState({
                plaqueOpacity: 1,
                toolTipVisible: false
            })
        })
    }
    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data, dataMapper, events, toolTipMapper, styles: propStyles, ...restProps } = props
        let { state } = this
        
        const highlight = (x,y) => x == state.selectedDataX && y == state.selectedDataY

        this.styles = assignStyle(defaultStyles, propStyles)

        let { styles } = this

        data = data.map(dataMapper)

        let xScale = scaleOrdinal()
        let xDomain = uniq(data.map(d => d.x))
        let xRange = xDomain.map((d, i) => i * styles.plaque.size)

        let yScale = scaleOrdinal()
        let yDomain = uniq(data.map(d => d.y))
        let yRange = yDomain.map((d, i) => i * styles.plaque.size).reverse()

        let values = data.map(d => d.value)
        let min = _min(values)
        let max = _max(values)
        let colorScale = scaleQuantile().domain([min,max]).range(styles.colors)


        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    xScale={xScale}
                    xDomain={xDomain}
                    xBandwidth={styles.plaque.size}
                    xRange={xRange}

                    yScale={yScale}
                    yDomain={yDomain}
                    yBandwidth={styles.plaque.size}
                    yRange={yRange}

                    colorScale={colorScale}
                    {...restProps}
                >
                    <XAxis hideLine tickSize={0} orientation='top' domainAlignment='middle' styles={styles.axis} />
                    <YAxis hideLine tickSize={0} orientation='left' domainAlignment={yBandwidth => yBandwidth / 2 + 5} styles={styles.axis} />
                    <Plaque opacity={state.plaqueOpacity}
                        highlight={highlight}
                        onMouseOver={this.onMouseOverPlaque}
                        onMouseOut={this.onMouseOutPlaque}
                        styles={styles}
                        events={events}
                    />
                    <Legend styles={styles} />
                    <ToolTip x={state.toolTipX}
                        y={state.toolTipY}
                        visible={state.toolTipVisible}
                        borderColor={state.toolTipBorderColor}
                        detail={toolTipMapper(state.selectedDataX, state.selectedDataY, state.selectedDataValue)}
                        styles={styles}
                    />
                </ShareProps>
            </Container>
        )
    }
}


