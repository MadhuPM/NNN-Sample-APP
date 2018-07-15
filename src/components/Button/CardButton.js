import React, {Component} from "react"
import PropTypes from 'prop-types'
import {Button as Btn} from "react-bootstrap"

export default class CardButton extends Component{
	
	static propTypes = {
    bsClass: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.any
	}
	constructor(props) {
      super(props)
  }
  
	render() {
    
        let {children, ...props} = this.props
        let class_name="btn"
        if(React.Children.count(children)==2){
            class_name = "card-button"
        }
      return(
        <div className="design2-button">
          <Btn bsClass={class_name} {...props} >{children}</Btn>
        </div>
        )

  }
	
}
