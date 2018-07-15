import RawForm from 'react-formal'
import React, {Component} from "react"
import PropTypes from 'prop-types'
import classNames from 'classnames'
import AlertBanner from '../AlertBanner'
export default class Summary extends Component{
	static propTypes = {
    children:PropTypes.any,
    className:PropTypes.any,
    formatMessage:PropTypes.func
	}
	constructor(props) {
      super(props)
      this.state = {

      }
  }
  
  formatMessage=(message,idx,messages )=>{
        const {formatMessage}=this.props
        const label =formatMessage? formatMessage(messages):'Incomplete Fields'
        if (idx===0) {
            return <span key={idx}>{label}</span>
        }else{
            return null
        }
  }
	
	render() {
        let {className,children,formatMessage,...props} = this.props
        let fieldClass=classNames('form-summary',className)
      return(
              <RawForm.Summary formatMessage={this.formatMessage} className={fieldClass} inline {...props} component={AlertBanner}  type='warning' titleHidden></RawForm.Summary>
        )
    }
	
}
