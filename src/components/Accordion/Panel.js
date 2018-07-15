import React, { Component, cloneElement  } from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Panel as RawPanel } from 'react-bootstrap'

export default class Panel extends Component {
    static defaultProps = {
        
    }
    static propTypes = {
        bsClass: PropTypes.string,
        activeKey:PropTypes.any,
        eventKey: PropTypes.string.isRequired,
        header: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node
        ]).isRequired,
        id: PropTypes.string,
        onSelect: PropTypes.func,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
        this.activeKey=props.activeKey
        this.childrenContent= []
    }
    componentWillReceiveProps(nextProps){
        const activeKey=nextProps.activeKey
        if(activeKey){
            this.activeKey=activeKey
        }
    }
    render() {
        const { children,header,eventKey,bsClass,id } = this.props
        if(this.activeKey && this.activeKey==eventKey)this.childrenContent=children

        return (
            <RawPanel eventKey={eventKey} id={id}>
                <RawPanel.Heading bsClass={bsClass}>
                    <RawPanel.Title toggle>{header}</RawPanel.Title>
                </RawPanel.Heading>
                <RawPanel.Body collapsible >
                    {this.childrenContent}
                </RawPanel.Body>
            </RawPanel>

        )
    }

}
