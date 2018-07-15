import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, XAxis, YAxis, Container, Legend, GroupLine, GroupDot, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/groupBy'
import { ShareProps } from './common/propsHelper'

const colors = [
    '#9F3AB7', '#F8984C', '#F56D00',
    '#D4A6DE', '#BB75CC', '#9F3AB7',
    '#B9E8F5', '#92DBEF', '#64CCE9',
    '#A39491', '#6F5953', '#000000'
]

const defaultStyles = {
    groupLine: {
        line: {
            strokeWidth: 4
        },
        colors: colors
    },
    groupDot: {
        circle: {
            r: 6
        },
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

export default class LineChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        range: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 800,
        height: 600,
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
        data = addGroupProperty(data)
        
        return {
            originalData: data,
            enableTransition: false
        }
    }

    getVisibleData() {
        let result = []
        let state = this.state
        let { originalData } = state
        let groupData = groupBy(originalData, 'group')

        Object.keys(groupData).forEach((groupName, i) => {
            groupData[groupName].forEach(d => {
                if (state[i] && state[i] === 'hide') {
                    //set value to zero to re calculate value range
                    result.push(Object.assign({}, d, { value: 0 }))
                }
                else {
                    result.push(d)
                }
            })
        })
        return result
    }

    
    getVisibleStyles() {
        let getColors = (color, i) => this.state[i] && this.state[i] === 'hide' ? 'transparent' : color
        let styles = assignStyle(defaultStyles, this.props.styles)

        //get visible colors
        styles.groupLine.colors = styles.groupLine.colors.map(getColors)
        styles.groupDot.colors = styles.groupDot.colors.map(getColors)

        return styles
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data: _data, dataMapper: _dataMapper, events, range, styles: _styles, legendData, legendX, legendY, ...restProps } = props

        let data = this.getVisibleData()

        let styles = this.getVisibleStyles() 

        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    xScale={scaleBand()}
                    xDomain={data => uniq(data.map(d => d.name))}
                    yScale={scaleLinear()}
                    yDomain={range || (data => autoRange(data.map(d => d.value)))}
                    {...restProps}
                >
                    <XAxis tickSize={0} domainAlignment='middle' styles={styles.axis} />
                    <YAxis tickSize={0} styles={styles.axis}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x', 'y'],
                            onEnter: { 'y': -100 },
                            duration: 300
                        }}
                    />

                    <GroupLine styles={styles.groupLine}
                        transition={{
                            enable: this.state.enableTransition,
                            duration: 300
                        }}
                    />

                    <GroupDot styles={styles.groupDot} events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['cx', 'cy', 'fill'],
                            duration: 300
                        }}
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

function addGroupProperty(data) {
    return data.map( i => {
            if(typeof(i.group) === 'undefined') {
                i.group = 'default'
            }
            return i
    })
}
