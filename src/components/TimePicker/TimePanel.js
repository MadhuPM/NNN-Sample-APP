import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from './Select';
// import ScrollLock from 'react-scrolllock';

function noop() {}

function generateOptions(length, disabledOptions, hideDisabledOptions, step = 1) {
  const arr = [];
  for (let value = 0; value < length; value += step) {
    if (!disabledOptions || disabledOptions.indexOf(value) < 0 || !hideDisabledOptions) {
      arr.push(value);
    }
  }
  return arr;
}

const formatOption = (option, disabledOptions) => {
    let value = `${option}`;
    if (option < 10) {
        value = `0${option}`;
    }
    let disabled = false;
    if (disabledOptions && disabledOptions.indexOf(option) >= 0) {
        disabled = true;
    }
    return {
        value,
        disabled,
    };
}

const propTypes = {
}

const defaultProps = {
}

export default class TimePanel extends React.Component {
    constructor(props){
        super(props)
        const {disabledHourOptions, hideDisabledOptions, hourStep, use24Hours,
            disabledMinuteOptions, minuteStep, disabledSecondOptions, secondStep,
            format, value, selectedValue = value,
            minuteOptions, secondOptions, hourOptions
         } = props
        let hourIndex = -1, minuteIndex = -1, secondIndex = -1, ampmIndex = -1
        if (selectedValue) {
            const hour = selectedValue.hour()
            const hour12 = hour % 12 === 0 ?12:hour % 12
            hourIndex = hourOptions.indexOf(use24Hours?hour:hour12)
            minuteIndex = selectedValue.minute()
            secondIndex = secondOptions.indexOf(selectedValue.second())
            const am = selectedValue && hour < 12 && hour > 0
            ampmIndex = (am?0:1)
        }

        this.state={
            minute:minuteIndex,
            hour:hourIndex,
            second:secondIndex,
            selected:ampmIndex,
            selectedValue
        }
    }

    componentWillReceiveProps(nextProps) {
        const { value } = nextProps
        if (value) {
            const selected = (value.hour() < 12 && value.hour() > 0) ? 0 : 1
            this.setState({
                hour: value.hour(),
                minute: value.minute(),
                second: value.second(),
                selected: selected,
                selectedValue:value
            });
        }
        else {
            this.setState({
                hour: -1,
                minute: -1,
                second: -1,
                selected: -1,
            });
        }
    }
    // componentWillUpdate(){

    // }
  
    onCancel=()=> {
        this.props.onPanelClose();
    }
    onOk=()=> {
        this.props.onPanelClose();
        const {selectedValue} = this.state
        this.props.onChange(selectedValue);
        // this.setState({
            // hour:selectedValue.hour(),
            // hour:selectedValue.hour(),
            // hour:selectedValue.hour(),
            // hour:selectedValue.hour(),
        // })
        // value
    }
    onItemChange = (type, itemValue) => {
        const { defaultOpenValue, use24Hours } = this.props;
        const value = (this.state.selectedValue || defaultOpenValue).clone();
    
        if (type === 'hour') {
          if (!use24Hours) {
            if (this.props.isAM) {
                value.hour(+itemValue % 12);
            } else {
                value.hour((+itemValue % 12) + 12);
            }
          } else {
            value.hour(+itemValue);
          }
            this.setState({
                hour:value.hour()
            })
        } else if (type === 'minute') {
          value.minute(+itemValue);
          this.setState({
              minute:value.minute()
          })
        } else if (type === 'ampm') {
          const ampm = itemValue.toUpperCase();
          if (!use24Hours) {
            if (ampm === 'PM' && value.hour() < 12) {
              value.hour((value.hour() % 12) + 12);
            }    
            this.setState({
                selected:1
            })
            if (ampm === 'AM') {
              if (value.hour() >= 12) {
                value.hour(value.hour() - 12);
              }
              this.setState({
                  selected:0
              })
            }
          }
        } else {
          value.second(+itemValue);
          this.setState({
              second:value.second()
          })
        }
        this.setState({
            selectedValue:value
        })
      }
    render() {
        const { className, prefixCls, format, showSecond, use24Hours, 
            minuteOptions, secondOptions, hourOptions, AMPMOptions, ...otherProps } = this.props
        const disabledOptions = undefined
        const { hour, minute, second, selected} = this.state
        const hourAdj=(!use24Hours)?((hour % 12) || 12):hour
        const minuteIndex = (minute!==-1)?minuteOptions.indexOf(minute):-1
        const okDisabled = (hour === -1 || minuteIndex === -1 ||
            (showSecond && second === -1) ||
            (!use24Hours && selected === -1))
            ? true : false
        return (
            <div className={classNames({ [`${prefixCls}-inner`]: true, [className]: !!className })}>
                <Select
                    prefixCls={prefixCls}
                    options={hourOptions.map(option => formatOption(option, disabledOptions))}
                    selectedIndex={(hour!==-1)?hourOptions.indexOf(hourAdj):-1}
                    type="hour"
                    onSelect={this.onItemChange}
                />
                <Select
                    prefixCls={prefixCls}
                    options={minuteOptions.map(option => formatOption(option, disabledOptions))}
                    selectedIndex={minuteIndex}
                    type="minute"
                    onSelect={this.onItemChange}
                />
                {showSecond
                 ?<Select
                    prefixCls={prefixCls}
                    options={secondOptions.map(option => formatOption(option, disabledOptions))}
                    selectedIndex={(second!==-1)?secondOptions.indexOf(second):-1}
                    type="second"
                    onSelect={this.onItemChange}
                 />
                 :null
                }
                {use24Hours
                    ?null
                    :<Select
                      prefixCls={prefixCls}
                      options={AMPMOptions}
                      selectedIndex={selected}
                      type="ampm"
                      onSelect={this.onItemChange}
                    />
                
                }
                <div className={`${prefixCls}-footer`}>
                    <span 
                        onClick={okDisabled?undefined:this.onOk} 
                        className={classNames({ [`${prefixCls}-footer-ok-disabled`]: okDisabled})} 
                    >
                    OK
                    </span>
                    <span className={'cancel'} onClick={this.onCancel}>Cancel</span>
                </div>                
                {/* <ScrollLock /> */}
            </div>
        );
    }
}

 TimePanel.propTypes = propTypes;
 TimePanel.defaultProps = defaultProps;