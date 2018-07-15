import React, { Component } from "react"
import PropTypes from 'prop-types'
import { Modal as RawModal } from "react-bootstrap"
import classnames from 'classnames'

export default class Modal extends Component {
    static defaultProps = {
        backdrop: true
    }
    static propTypes = {
        animation: PropTypes.bool,
        backdrop: PropTypes.oneOf([
            'static',true,false
        ]),
        dialogClassName: PropTypes.string,
        bsClass: PropTypes.string,
        show: PropTypes.bool,
        onHide: PropTypes.func,
        children: PropTypes.any
    }
    constructor(props) {
        super(props)
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.show){
            document.body.firstElementChild.classList.add('bodyblur')
        }else{
            document.body.firstElementChild.classList.remove('bodyblur')
        }
    }
    componentWillUnmount(){
        document.body.firstElementChild.classList.remove('bodyblur')
    }
    render() {
        let { children,onHide,dialogClassName,bsSize, ...props } = this.props

        return (
            <RawModal dialogClassName={classnames("design2-modal",dialogClassName)} onHide={onHide?onHide:null} {...props} >
                {children}
            </RawModal>
        )

    }

}
