import React, { Component } from "react"
import PropTypes from 'prop-types'
import { PanelGroup as RawAccordion } from 'react-bootstrap'

export default class Accordion extends Component {
    static defaultProps = {
        id: "panelGroup"
    }
    static propTypes = {
        activeKey: PropTypes.any,
        defaultActiveKey: PropTypes.any,
        onSelect: PropTypes.func,
        id: PropTypes.string,
        generateChildId: PropTypes.func,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
        this.state={
            activeKey:props.activeKey
        }
    }
    onSelect=(activeKey)=>{
        const {onSelect}=this.props
        this.setState({
            activeKey
        })
        onSelect?onSelect(activeKey):null
    }
    renderChild=(child)=>{
        if (!child) {
            return null
        }
        const {activeKey} = this.state
        const childProps = {
            activeKey:activeKey
        }
        return React.cloneElement(child, childProps)
    }
    render() {
        let {children, onSelect,activeKey,...props } = this.props
        return (
            <RawAccordion accordion activeKey={this.state.activeKey} onSelect={this.onSelect} {...props} >
                {
                    React.Children.map(children, this.renderChild)
                }
            </RawAccordion>

        )
    }

}
