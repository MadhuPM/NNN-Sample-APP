import RawForm from 'react-formal'
import Summary from './Summary'
import React, {Component} from "react"
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { Scrollbars } from 'react-custom-scrollbars'

export default class Form extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.any,
    formatMessage: PropTypes.func,
    title: PropTypes.string,
    noSummary: PropTypes.bool,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    horizontal:PropTypes.bool,
    fieldWidth:PropTypes.string,
    labelWidth:PropTypes.string,
    schema:PropTypes.any,
    height:PropTypes.any,
    style:PropTypes.any
  }
  static defaultProps = {
    height:800
  }
  constructor(props) {
    super(props)
    this.state = {
      valid: true
    }
  }
  submit() {
    this.refs.form.submit()
  }
  validate(){
    this.refs.form.refs.inner.handleValidationRequest({type:'blur',fields:this.props.schema._nodes})
  }
  renderMenuItem = (child, index) => {
    let typeList = ['radio', 'select', 'checkbox', 'checkboxgroup']
    if (!child) {
      return null
    }
    const childProps = {}
    let {horizontal,fieldWidth,labelWidth}=this.props
    let type = child.props.type
    if (child.type.type=='Field') {
      if (fieldWidth) {
        childProps.fieldWidth=fieldWidth
      }
      if (labelWidth) {
        childProps.labelWidth=labelWidth
      }
      if (horizontal) {
        childProps.horizontal=true
      }
    }
    if (typeList.indexOf(type) !== -1) {
      childProps.inner = true
    }
    return React.cloneElement(child, childProps)
  }
  render() {
    let {children,className,formatMessage,title,noSummary,horizontal,fieldWidth,height,style,labelWidth,...props} = this.props
    let basicClassName = className
      ? className
      : ' design2-form'
    return (
      <div className={'form-wrapper'} style={style} >
      <Scrollbars 
        autoHeight
        autoHeightMin={0}
        autoHeightMax={height}
        renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
        renderTrackVertical={props => <div {...props} className="track-vertical"/>}
      >
        <RawForm
          className={basicClassName}
          ref="form"
          {...props}
        >
          {noSummary? null: <Summary formatMessage={formatMessage}/>}
          {title?<h2 className="form-title">{title}</h2>:null}{React.Children.map(children, this.renderMenuItem)}
        </RawForm>
      </Scrollbars>
      </div>
    )
  }

}
