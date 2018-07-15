import React from 'react'
import PropTypes from 'prop-types'
import { ShareProps } from './common/propsHelper'
import { Donut, Container, Legend, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'

const colors = [
    '#F56D00', '#9F3AB7', '#64CCE9', '#32120A',
    '#F8984C', '#BB75CC', '#92DBEF', '#6F5953',
    '#FABD8C', '#D4A6DE', '#B9E8F5', '#A39491'
]

const defaultStyles = {
    legend: {
        width: 15,
        height: 15,
        colors: colors
    },
    donut: {
        innerRadius: 0,
        colors: colors
    },
    innerRadius: 0
}

export default class DonutChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        x: PropTypes.string,
        y: PropTypes.string,
        innerRadius: PropTypes.number,
        dataMapper: PropTypes.func,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.shape({
            legend: PropTypes.object,
            donut: PropTypes.object,
            innerRadius: PropTypes.object
        })
    }

    static defaultProps = {
        onClick: function(evt, data){},
        width: 500,
        height: 500,
        dataMapper: item => item,
        legendX: (width, height) => width +20,
        legendY: 0
    }

    constructor(props) {
        super(props)
        this.state = this.getInitState()
    }

    getInitState() {
        let { data, dataMapper, x, y } = this.props
        //API - backward compatible
        if (typeof (x) === 'string' && typeof (y) === 'string') {
            data = data.map(i => Object.assign({}, i, { name: i[x], value: i[y] }))
        }
        //End
        return {
            originalData: data.map(dataMapper),
            enableTransition: false
        }
    }

    getVisiblebData() {
        let result = []
        let state = this.state
        let { originalData } = state
        
        originalData.forEach((d,i) => {
            if (!state[i] || state[i] !== 'hide') {
                result.push(d)
            }
            else {
                result.push(Object.assign({}, d, { value: 0 }))//set value to 0 to hide the bar
            }    
        })

        return result
    }

    getVisibleStyles() {
        return assignStyle(defaultStyles, this.props.styles)
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { events, data: _data, dataMapper: _dataMapper, innerRadius, styles: _styles, legendData, legendX, legendY, x, y, ...restProps } = props
        let data = this.getVisiblebData()
        let styles = this.getVisibleStyles()
        
        //API - backward compatible
        if (innerRadius) {
            styles = assignStyle(styles, { donut: { innerRadius } })
        }
        //End
        
        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    {...restProps}
                >
                    <Donut styles={styles.donut}
                        events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['startAngle', 'endAngle', 'padAngle'],
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