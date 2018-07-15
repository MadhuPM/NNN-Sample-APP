import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class ProgressIndicator extends Component {
    static propTypes = {
        children: PropTypes.any,
        className: PropTypes.any,
        simple: PropTypes.bool,
        userInfo:PropTypes.object,
        onChange:PropTypes.func
    }
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        let {className,userInfo,simple,onChange,...props} = this.props
        let {avatar,name,handleName,role,department,location,phone,email}=userInfo
        let classname=classNames('design2-user-profile',className)
        return (
        <div className={classname} >
            {!simple? <label className="profile-avatar-upload"><img src={avatar} alt="" className="profile-avatar"/><input type="file" onChange={onChange}/></label> :null}
            <div className="profile-name">{name}<a href="javascript:void(0)" className="name-handle">{handleName}</a></div>
            <div className="profile-block">{role}<br/>{department}</div>
            <div className="profile-block">{location}</div>
            <div className="profile-block">{phone}<br/> <a href={`mailto:${email}`}>{email}</a></div>
        </div>)
    }
}
