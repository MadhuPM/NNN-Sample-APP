import React, {  Component } from "react"
import ReactDOM from "react-dom"
import { Grid, Row } from 'react-bootstrap'
import { PropTypes } from "prop-types"

export default class LGrid extends Component {
  static propTypes = {
        children:PropTypes.any
  }
  render() {
    const { children, ...props } = this.props

    return(
        <div>
            <Grid {...props}>
                <Row>
                    {children}
                </Row>
            </Grid>
        </div>
    );
  }
}
