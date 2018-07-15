import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, XAxis, YAxis, Container, GroupBar, Legend, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/groupBy'
import { GroupText } from './common/text'
import { ShareProps } from './common/propsHelper'

const colors = ['#F56D00','#9F3AB7','#64CCE9','#32120A']

const defaultStyles = {
    groupBar: {
        width:30,
        colors: colors
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    },
    axis: {
        stroke: 'black'
    }
}

export default class GroupBarChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        width: PropTypes.number,
        height: PropTypes.number,
        dataMapper: PropTypes.func,
        range: PropTypes.array,
        showValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        pivot: PropTypes.bool,
        styles: PropTypes.object
    }

    static defaultProps = {
        width: 800,
        height: 600,
        pivot: false,
        showValue: false,
        dataMapper: item => item,
        legendX: (width, height) => width + 10,
        legendY: 0
    }

    constructor(props) {
        super(props)
        this.state = this.getInitState()
    }

    getInitState() {
        let { data, dataMapper } = this.props
        data = data.map(dataMapper)
        data = data.map(addOrderProperty)
        
        return {
            originalData: data,
            enableTransition: false
        }
    }

    getVisiblebData() {
        let result = []
        let state = this.state
        let { originalData } = state
        let groupData = groupBy(originalData,'name')

        Object.keys(groupData).forEach(groupName => {
            groupData[groupName].forEach((d,i)=>{
                if (!state[i] || state[i] !== 'hide') {
                    result.push(d)
                }
            })
        })

        return result
    }

    getVisibleStyles() {
        let getColors = (color, i) => this.state[i] && this.state[i] === 'hide' ? false : true
        let styles = assignStyle(defaultStyles, this.props.styles)

        //get visible colors
        styles.groupBar.colors = styles.groupBar.colors.filter(getColors)

        return styles
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data: _data,
            dataMapper: _dataMapper,
            events,
            range,
            showValue,
            styles: _styles,
            legendData,
            legendX,
            legendY,
            pivot,
            ...restProps } = props

        let data = this.getVisiblebData()
        let styles = this.getVisibleStyles()
        let names =  uniq(data.map(d => d.name))
        let valueRange = range || autoRange(uniq(data.map(d => d.value)))

        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    xScale={pivot ? scaleLinear() : scaleBand()}
                    xDomain={pivot ? valueRange : names}
                    yScale={pivot ? scaleBand() : scaleLinear()}
                    yDomain={pivot ? names: valueRange}
                    {...restProps}
                >
                    <XAxis tickSize={0} 
                        domainAlignment={pivot ? 'start' : 'middle'} 
                        styles={styles.axis}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x','y'],
                            onEnter: { 'x': this.props.width },
                            duration: 300
                        }}
                    />
                    <YAxis tickSize={0} 
                        domainAlignment={pivot ? bandwidth => bandwidth / 2 : 'start'} 
                        styles={styles.axis} 
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x','y'],
                            onEnter: { 'y': -100 },
                            duration: 300
                        }}
                    />
                    <GroupBar 
                        pivot={pivot}
                        styles={styles.groupBar} 
                        events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x', 'y', 'width', 'height','fill'],
                            onEnter: pivot ? 
                                { 'width': 0 } 
                                : 
                                (width, height) => ({'y': height, 'height': 0}),
                            duration: 300
                        }}
                    />
                    <GroupText
                        pivot={pivot}
                        styles={{
                            textAnchor: pivot ? 'start' : 'middle',
                            width: styles.groupBar.width,
                            dy: pivot ? '.6ex' : 0
                        }}
                        xOffset={pivot ? 6 : 0}
                        yOffset={pivot ? 0 : -6}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x', 'y'],
                            onEnter: pivot ?
                                { 'x': 6 }
                                :
                                (width, height) => ({ 'y': height - 6 }),
                            duration: 300
                        }}
                        showValue={showValue}
                    />
                    <Legend 
                        legendData={legendData} 
                        x={legendX}
                        y={legendY}
                        styles={styles.legend} 
                    />
                </ShareProps>
            </Container>
        )
    }
}

function addOrderProperty(d, i) {
    return Number.isInteger(d.order) ? d : Object.assign(d, { order: i })
}