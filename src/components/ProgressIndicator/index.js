import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class ProgressIndicator extends Component {
    static propTypes = {
        className: PropTypes.any,
        list: PropTypes.array,
        step:PropTypes.number
    }
    render() {
        let {className,list,step,...props} = this.props
        let classname=classNames('design2-indicator',className)
        let steps=list.map((item,index)=>{
            let itemClass=classNames({'finished-step':index<=step-1})
            return <span key={index} className={itemClass}>{item}</span>
        })
        return (
        <div className={classname} >
            {steps}
        </div>)
    }
}
