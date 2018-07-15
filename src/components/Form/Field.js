import RawForm from 'react-formal'
import React, {Component} from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Field extends Component{
	static propTypes = {
    children:PropTypes.any,
    title:PropTypes.string,
    required:PropTypes.bool,
    type:PropTypes.string,
    short:PropTypes.bool,
    className:PropTypes.any,
    name:PropTypes.any,
    horizontal:PropTypes.bool,
    width:PropTypes.string,
    fieldWidth:PropTypes.string,
    labelWidth:PropTypes.string
    }
    static type='Field'
	constructor(props) {
      super(props)
    }

	
	render() {
        let {children,title,required,type,className,short,name,horizontal,width,fieldWidth,labelWidth,...props} = this.props
        let lowType=type?type.toLowerCase():'input'
        let typeName='design2-'+ (type?lowType:'input')
        let wrapperClass=classNames('field-wrapper',{'horizontal-field':horizontal,'no-title-field':!title})
        let fieldClass=classNames('form-field',{'short-field':short},className,typeName)
      return(
          <div className={wrapperClass} style={{width:(width?width:(fieldWidth?fieldWidth:'100%')),paddingLeft:horizontal?(labelWidth?labelWidth:'120px'):0}}>
              {title?<label className="field-title" style={{width:horizontal?(labelWidth?labelWidth:'120px'):'100%'}}>{title}{required?' *':null}</label>:null}
              <RawForm.Field type={lowType}  name={name} className={fieldClass} autoComplete="off" {...props} >{children}</RawForm.Field>
              {/*eslint-disable*/}
              <RawForm.Message for={name}/>
          </div>
        )
    }
	
}
