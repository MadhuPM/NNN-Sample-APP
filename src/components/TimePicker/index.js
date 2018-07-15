import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import Panel from "./TimePanel";
import moment from "moment";
import { Overlay } from "react-bootstrap";
import DebounceInput from "../DatePicker/DebounceInput";
import classNames from "classnames";
import Icon, { ICONS } from "../Icon";
// import Placement from '../DatePicker/Placement'
const Placement = (props) => {
  const { style, children, p, positionTop, positionLeft, left, offsetX } = props
  const top = (positionTop ) + 'px'
  // let left = offsetX?(positionLeft + offsetX + 140) + 'px':(positionLeft + 140) + 'px'
  const leftPos = (left ) + 'px'
  return (
    <div style={{ top,left:leftPos, position:'absolute' }} className={p}>
      {children}
    </div>
  )
}

function noop() {}

function refFn(field, component) {
  this[field] = component;
}

function generateOptions(
  length,
  disabledOptions,
  hideDisabledOptions,
  step = 1
) {
  const arr = [];
  for (let value = 0; value < length; value += step) {
    if (
      !disabledOptions ||
      disabledOptions.indexOf(value) < 0 ||
      !hideDisabledOptions
    ) {
      arr.push(value);
    }
  }
  return arr;
}

export default class Picker extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    defaultOpenValue: PropTypes.object,
    inputReadOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    allowEmpty: PropTypes.bool,
    defaultValue: PropTypes.object,
    open: PropTypes.bool,
    defaultOpen: PropTypes.bool,
    align: PropTypes.object,
    placement: PropTypes.any,
    transitionName: PropTypes.string,
    getPopupContainer: PropTypes.func,
    placeholder: PropTypes.string,
    format: PropTypes.string,
    showMinute: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    // popupClassName: PropTypes.string,
    disabledHours: PropTypes.func,
    disabledMinutes: PropTypes.func,
    disabledSeconds: PropTypes.func,
    hideDisabledOptions: PropTypes.bool,
    onChange: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
    autoComplete: PropTypes.string,
    use24Hours: PropTypes.bool,
    hourStep: PropTypes.number,
    minuteStep: PropTypes.number,
    secondStep: PropTypes.number,
    focusOnOpen: PropTypes.bool,
    onKeyDown: PropTypes.func,
    autoFocus: PropTypes.bool,
    id: PropTypes.string
  };

  static defaultProps = {
    clearText: "clear",
    prefixCls: "design2-timepicker",
    defaultOpen: false,
    inputReadOnly: false,
    style: {},
    className: "",
    // popupClassName: "",
    id: "",
    align: {},
    defaultOpenValue: moment(),
    allowEmpty: true,
    showHour: true,
    showMinute: true,
    showSecond: false,
    disabledHours: noop,
    disabledMinutes: noop,
    disabledSeconds: noop,
    hideDisabledOptions: false,
    placement: "bottom",
    onChange: noop,
    onOpen: noop,
    onClose: noop,
    onFocus: noop,
    onBlur: noop,
    addon: noop,
    use24Hours: false,
    focusOnOpen: true,
    onKeyDown: noop,
    rootClose: true,
    minuteStep: 15
  };

  constructor(props) {
    super(props);
    // this.saveInputRef = refFn.bind(this, 'picker');
    // this.savePanelRef = refFn.bind(this, 'panelInstance');
    const {
      defaultOpen,
      defaultValue,
      open = defaultOpen,
      value = defaultValue,
      showSecond,
      use24Hours,
      disabledHourOptions,
      hideDisabledOptions,
      hourStep,
      disabledMinuteOptions,
      minuteStep,
      disabledSecondOptions,
      secondStep
    } = props;
    const width = (3 + (showSecond ? 1 : 0) - (!use24Hours ? 0 : 1)) * 42.5;
    const format = this.getFormat();
    const hourOptions = generateOptions(
      24,
      disabledHourOptions,
      hideDisabledOptions,
      hourStep
    );
    let hourOptionsAdj;
    if (!use24Hours) {
      hourOptionsAdj = [12].concat(hourOptions.filter(h => h < 12 && h > 0));
    } else {
      hourOptionsAdj = hourOptions;
    }
    const minuteOptions = generateOptions(
      60,
      disabledMinuteOptions,
      hideDisabledOptions,
      minuteStep
    );
    const secondOptions = generateOptions(
      60,
      disabledSecondOptions,
      hideDisabledOptions,
      secondStep
    );
    const AMPMOptions = ["am", "pm"]
      .map(c => (format.match(/\sA/) ? c.toUpperCase() : c))
      .map(c => ({ value: c }));
    const str = (value && value.format(format)) || "";
    // just minute now
    const invalid = value?minuteOptions.indexOf(value.minute()) === -1:false
    this.state = {
      open,
      value,
      selectedValue: value,
      invalid,
      show: false,
      width: width,
      str,
      hourOptions: hourOptionsAdj,
      minuteOptions,
      secondOptions,
      AMPMOptions,
      popoverHided: true
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value, open } = nextProps;
    const {minuteOptions} = this.state
    const format = this.getFormat()
    if ("value" in nextProps) {
      if (value === null ) {
        this.setState({
          value:undefined,
          selectedValue:undefined,
          str:'',
          invalid:false
        });
      }
      else{
        const str = value.format(format)
        const invalid = minuteOptions.indexOf(value.minute()) === -1
        this.setState({
          value,
          selectedValue:value,
          str,
          invalid
        });
      }
    }
    if (open !== undefined) {
      this.setState({ open });
    }
  }

  onPanelChange = value => {
    this.setValue(value);
  };

  onPanelClear = () => {
    // this.setState({ selectedValue:undefined });
    this.setValue(undefined);
    this.setOpen(false);
  };

  onVisibleChange = open => {
    this.setOpen(open);
  };

  onEsc = () => {
    this.setOpen(false);
    this.focus();
  };

  onPanelClose = () => {
    this.setState({
      show: false
    });
  };

  onKeyDown = e => {
    // console.log("key down", e, "(((((((((((((((((((");
    if (e.keyCode === 40) {
      this.setOpen(true);
    }
  };

  setValue(value) {
    const format = this.getFormat();
    if (!("value" in this.props)) {
      this.setState({
        value,
        selectedValue: value,
        invalid: false
      });
    }
    this.setState({
      str: (value && value.format(format)) || "",
      invalid: false
    });
    this.props.onChange(value);
  }

  getFormat() {
    const { format, showHour, showMinute, showSecond, use24Hours } = this.props;
    if (format) {
      return format;
    }

    if (!use24Hours) {
      const fmtString = [
        showHour ? "hh" : "",
        showMinute ? "mm" : "",
        showSecond ? "ss" : ""
      ]
        .filter(item => !!item)
        .join(":");

      return fmtString.concat(" a");
    }

    return [
      showHour ? "hh" : "",
      showMinute ? "mm" : "",
      showSecond ? "ss" : ""
    ]
      .filter(item => !!item)
      .join(":");
  }

  isAM() {
    const value = this.state.value || this.props.defaultOpenValue;
    return value.hour() >= 0 && value.hour() < 12;
  }

  getPanelElement() {
    const {
      prefixCls,
      placeholder,
      disabledHours,
      disabledMinutes,
      disabledSeconds,
      hideDisabledOptions,
      inputReadOnly,
      allowEmpty,
      showHour,
      showMinute,
      showSecond,
      defaultOpenValue,
      clearText,
      addon,
      use24Hours,
      focusOnOpen,
      onKeyDown,
      hourStep,
      minuteStep,
      secondStep
    } = this.props;
    const { minuteOptions, secondOptions, hourOptions, AMPMOptions } = this.state;
    return (
      <Panel
        prefixCls={`${prefixCls}-panel`}
        ref={this.savePanelRef}
        value={this.state.selectedValue}
        onChange={this.onPanelChange}
        onClear={this.onPanelClear}
        defaultOpenValue={defaultOpenValue}
        showSecond={showSecond}
        onEsc={this.onEsc}
        onEnter={this.onEnter}
        onPanelClose={this.onPanelClose}
        format={this.getFormat()}
        placeholder={placeholder}
        use24Hours={use24Hours}
        minuteStep={minuteStep}
        onKeyDown={onKeyDown}
        minuteOptions={minuteOptions}
        secondOptions={secondOptions}
        hourOptions={hourOptions}
        AMPMOptions={AMPMOptions}
        isAM={this.isAM()}
      />
    );
  }

  onInputChange = event => {
    const str = event.target.value;
    this.setState({
      str
    });
    const {
      disabledHours,
      disabledMinutes,
      disabledSeconds,
      onChange,
      allowEmpty
    } = this.props;
    const { hourOptions, minuteOptions, secondOptions } = this.state;
    const format = this.getFormat();
    if (str) {
      const parsed = moment(str, format, true);
      if (!parsed.isValid()) {
        this.setState({
          invalid: true,
          selectedValue: undefined
        });
        return;
      }
      const value = parsed.clone();
      
      // console.log(minuteOptions.indexOf(value.hour()),"sdfadsjnfkadsnlf")
      // if time value not allowed, response warning.
      // if (
      //   hourOptions.indexOf(value.hour()) < 0 ||
      //   minuteOptions.indexOf(value.minute()) < 0 ||
      //   secondOptions.indexOf(value.second()) < 0
      // ) {
        if (minuteOptions.indexOf(value.hour()) !== -1) {
          this.setState({
            selectedValue: value,
            invalid: false
          });
        }
        else{
          this.setState({
            selectedValue: value,
            invalid: true
          });
        }
      // this.props.onChange(value)
      return;
      // }

      // if time value is disabled, response warning.
      const disabledHourOptions = disabledHours();
      const disabledMinuteOptions = disabledMinutes(value.hour());
      const disabledSecondOptions = disabledSeconds(
        value.hour(),
        value.minute()
      );
      if (
        (disabledHourOptions &&
          disabledHourOptions.indexOf(value.hour()) >= 0) ||
        (disabledMinuteOptions &&
          disabledMinuteOptions.indexOf(value.minute()) >= 0) ||
        (disabledSecondOptions &&
          disabledSecondOptions.indexOf(value.second()) >= 0)
      ) {
        this.setState({
          invalid: true
        });
        return;
      }

      if (originalValue) {
        if (
          originalValue.hour() !== value.hour() ||
          originalValue.minute() !== value.minute() ||
          originalValue.second() !== value.second()
        ) {
          // keep other fields for rc-calendar
          const changedValue = originalValue.clone();
          changedValue.hour(value.hour());
          changedValue.minute(value.minute());
          changedValue.second(value.second());
          onChange(changedValue);
        }
      } else if (originalValue !== value) {
        onChange(value);
      }
    } else if (allowEmpty) {
      onChange(null);
    } else {
      this.setState({
        invalid: true
      });
      return;
    }

    this.setState({
      invalid: false
    });
  };

  setOpen(open) {
    const { onOpen, onClose } = this.props;
    if (this.state.open !== open) {
      if (!("open" in this.props)) {
        this.setState({ open });
      }
      if (open) {
        onOpen({ open });
      } else {
        onClose({ open });
      }
    }
  }

  getClearButton() {
    const { prefixCls, allowEmpty } = this.props;
    const { width } = this.state;
    if (!allowEmpty) {
      return null;
    }
    return (
      <a
        className={`${prefixCls}-clear-btn`}
        role="button"
        onMouseDown={this.onPanelClear}
        style={{
          left: width - 20 + "px"
        }}
      >
        <Icon
          name={"close-circle-dark"}
          color={"#ffffff"}
          size={"12"}
          className={"icon-dark"}
        />
      </a>
    );
  }

  focus() {
    this.domInstance.focus();
  }

  blur() {
    this.domInstance.blur();
  }

  show = () => {
    this.setState({
      show: true,
      popoverHided:false
    });
  };

  saveTimeInput = dom => {
    this.domInstance = dom;
  };

  saveSpanRef = dom => {
    this.spanInstance = dom;
    if (dom !== null) {
      const {left}=dom.getBoundingClientRect()
      // console.log(left, 1)
      this.setState({
        left: -1000
      })
    }
  };

  onEnter=(e)=>{
    const {left,top}=this.spanInstance.getBoundingClientRect()
      // console.log(left, 2)
      this.setState({
      left:left,
      top
    })
  }

  onExited=(e)=>{
    // set input width
    this.setState({
      popoverHided: true
    })
  }

  _handleKeyPress=(e)=> {
    if (e.key === 'Enter') {
      const format = this.getFormat()
      const str = e.target.value
      if (str !== '') {
        const parsed = moment(str, format, true);
        if (parsed.isValid()) {
          const minute = parsed.minute()
          const {minuteOptions} = this.state
          if (minuteOptions.indexOf(minute) !== -1) {
            this.setValue(parsed);
          }
          // else{
          //   console.log('wrong time input')
          // }
        }
      }
    }
  }
  render() {
    const {
      prefixCls,
      placement,
      align,
      id,
      disabled,
      transitionName,
      className,
      getPopupContainer,
      name,
      autoComplete,
      onFocus,
      onBlur,
      autoFocus,
      inputReadOnly,
      rootClose,
      style
    } = this.props;
    const {
      open,
      value,
      show,
      width,
      str,
      invalid,
      selectedValue,
      left,
      popoverHided
    } = this.state;
    // const popupClassName = this.getPopupClassName();
    const placeholder = this.props.placeholder || this.getFormat().replace('a', 'AM/PM');
    const inputClassName = classNames({
      [`${prefixCls}-input`]: true,
      ["show-popup"]: show,
      ["disabled"]: disabled,
      ["invalid"]: invalid,
      ["not-popup"]: !show
    });
    const spanClassName = classNames({
      [prefixCls]: !className,
      [className]: !!className
    });
    const inputStyle = {
      height: "40px",
      position: "relative",
      width: !popoverHided ? width + "px" : "100%"
    };
    const formWidth = {
      width: '100%',
      display: "inline-block" 
    }
    const inlineStyle = {
      display: "inline-block" 
    }
    return (
      <div style={className.includes('form-field')?formWidth:inlineStyle}
      >
        <span className={spanClassName} style={style} ref={"target"}>
          <span style={{ height: "40px",width: "0", position: "relative" }} ref={this.saveSpanRef} />
          <DebounceInput
            debounceTimeout={100}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName}
            onClick={this.show}
            onChange={this.onInputChange}
            ref={this.saveTimeInput}
            style={inputStyle}
            value={str}
            autoComplete="off"
            onKeyPress={this._handleKeyPress}
          />
          { !popoverHided ? value ? this.getClearButton() : null : <span onClick={disabled?undefined:this.show} className={classNames({[`${prefixCls}-icon disabled`]: disabled,})}/>}
        </span>
        <Overlay
          show={this.state.show}
          onHide={() => this.setState({ show: false })}
          placement={placement}
          container={document.body}
          rootClose={rootClose}
          onEnter={this.onEnter}
          target={props => findDOMNode(this.refs.target)}
          shouldUpdatePosition
          onExited={this.onExited}
        >
          <Placement
            left ={left}
          >
            {this.getPanelElement()}
          </Placement>
        </Overlay>
      </div>
    );
  }
}
