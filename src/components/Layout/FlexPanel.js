import React, {Component} from 'react';
import { PropTypes } from "prop-types";


export default class FlexPanel extends Component {
  static propTypes = {
    children: PropTypes.node,
    split: PropTypes.oneOf(['horizontal', 'vertical']),
    defaultSize: PropTypes.number,
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    primary: PropTypes.oneOf(['first', 'second'])
  };

  static defaultProps = {
    primary: 'first',
    defaultSize: 400,
    minSize: 100
  };

  getContent() {
    const {split, children, defaultSize, maxSize, minSize, primary} = this.props;
    return children;
  }

  render() {
    const className = 'design2_flexMain';
    const {split, children, defaultSize, maxSize, minSize, primary, ...rest} = this.props;

    return (
      <div {...rest} className={className}>
       {this.getContent()}
      </div>
    );
  }
}
