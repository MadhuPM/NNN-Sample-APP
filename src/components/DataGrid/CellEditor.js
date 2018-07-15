import React, {Component} from 'react';
import PropTypes from 'prop-types'
//import {DateTimePicker} from 'react-widgets';
//import DatePopup from './DatePopup';
import {OverlayTrigger, Popover} from 'react-bootstrap';

export default class CellEditor extends Component {
  static propTypes = {
    col: PropTypes.object,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    rowHeight: PropTypes.number,
    error: PropTypes.string,
    bottomOffset: PropTypes.number,
    rightOffset: PropTypes.number,
    tabIndex: PropTypes.number,
    index: PropTypes.number,
    editIndex: PropTypes.number
  }

  constructor(props) {
    super(props);
    const {value = ''} = props;
    this.state = {value};
  }

  componentWillReceiveProps(props) {
    if (this.props.value !== props.value) {
      const {value = ''} = props;
      this.setState({value});
    }
  }

  onChange = (val) => {
    if (this.props.onChange(val, this.props.col, this.props.editIndex)) {
      this.setState({value: val});
    }
  }

  render() {
    const {col, rowHeight, error, bottomOffset, rightOffset, tabIndex} = this.props;
    const autoFocus = tabIndex === 1;
    const {value} = this.state;
    const fieldStyle = {height: rowHeight - 5, width: '100%', fontSize: '14px'};
    const dateFieldStyle = {width: '100%', height: rowHeight - 5, fontSize: '14px'};
    const className = error ? 'form-control error' : 'form-control';

    let editField;

    switch (col.dataType) {
//      case 'date':
//        editField = (
//          <div>
//            <DatePopup value={value} tabIndex={tabIndex}
//              onChange={this.onChange} key={col.dataKey} className={className}
//              style={dateFieldStyle} />
//          </div>
//        );
//        break;
//      case 'datetime':
//        editField = (
//          <div className={rightOffset < 50 ? 'rightAlignPopup' : undefined}>
//            <DateTimePicker tabIndex={tabIndex}
//              key={`${col.dataKey}_picker`} value={value}
//              dropUp={bottomOffset < 330} onChange={this.onChange}
//              time className={className}
//              style={dateFieldStyle} />
//          </div>
//        );
//        break;
      case 'number':
        editField = (
          <input type='number' tabIndex={tabIndex}
            onChange={(e) => this.onChange(e.target.value)} key={col.dataKey} autoFocus={autoFocus}
            className={className} value={value} style={{...fieldStyle, textAlign: 'right'}}
          />
        );
        break;
      default:
        editField = (
          <input tabIndex={tabIndex} type='text'
            onChange={(e) => this.onChange(e.target.value)} key={col.dataKey}
            className={className} value={value} style={fieldStyle} autoFocus={autoFocus} 
          />
        );
    }

    const hover = error ? <Popover id={`${col.dataKey}_error`}>{error}</Popover> : <div />;
    return (
      <OverlayTrigger
        key={col.dataKey} overlay={hover} placement='top'
        trigger={['hover', 'focus']}
      >
         {editField}
      </OverlayTrigger>

    );
  }
}
