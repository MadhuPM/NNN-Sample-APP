import React, {Component} from 'react'
import PropTypes from 'prop-types'
import VirtualizedSelect from '../Filter/VirtualizedSelect'
import Icon,{ICONS} from '../../components/Icon'
import classNames from 'classnames'
let flag=false
export default class Search extends Component {
    static propTypes = {
        children: PropTypes.any,
        dataSource:PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.func
        ]),
        value: PropTypes.any,
        className:PropTypes.any,
        placeholder:PropTypes.any,
        autoClear:PropTypes.bool,
        global:PropTypes.bool,
        style:PropTypes.any,
        onSearch:PropTypes.func,
        onChange:PropTypes.func,
        async:PropTypes.bool,
        offHistory:PropTypes.bool,
        optionHeight:PropTypes.number,
        strict:PropTypes.bool,
        noResultsText:PropTypes.any
    }
    static defaultProps = {
        strict: true
      }
    constructor(props) {
        super(props)
        this.state = {
          inputValue:props.value?props.value:'',
          selectValue:'',
          history:[]
        }
    }
    onSearch=(value)=>{
      const {onSearch,async}=this.props
      let {inputValue}=this.state
    if (inputValue) {
        onSearch?onSearch(value):null
        this.setState({selectValue:value.label,inputValue:value.label})
        if (async) {
            setTimeout(() => {
                this.refs.select._selectRef.select.setState({inputValue:value.label,isFocused:true,isPseudoFocused:false})
            }, 0);
        }else{
            this.refs.select._selectRef.setState({inputValue:value.label,isFocused:true,isPseudoFocused:false})
        }
        
    }else{
        this.setState({selectValue:'',inputValue:''})
    }
    }
    onChange = (e) => {
      const {onChange}=this.props
      onChange?onChange(e):null
      e?this.setState({inputValue:e,selectValue:''}):this.setState({inputValue:'',selectValue:''})
  }
    arrowRenderer=(info)=>{
      return null
    }
    getOptions=(input,callback)=>{
        let {dataSource} = this.props
        this.setState({inputValue:input})
        dataSource(input,callback)
    }
    keyDown=(e)=>{
        if(e.keyCode==13&&(!this.props.strict||!this.props.dataSource)){
            this.onSearch({value:e.target.value,label:e.target.value})
        }
    }
    render() {
        let {dataSource,className, placeholder,autoClear,global,style,async,optionHeight,noResultsText,strict,...props} = this.props
        let {inputValue,selectValue,history}=this.state
        let classname=classNames('design2-search',className,{'noValue':!inputValue,"globalSearch":global})
        let option={}
        if (async) {
            option.loadOptions=this.getOptions
        }else{
            option.options=dataSource
        }
        return (
        <div className="design2-search-wrapper" style={style}>
            <VirtualizedSelect ref='select'
            {...option}
            className={classname}
            value={selectValue}
            placeholder={placeholder?placeholder:'Search'}
            inputValue={inputValue}
            onChange={this.onSearch}
            onInputChange={this.onChange}
            clearable={false} {...props}
            arrowRenderer={this.arrowRenderer}
            matchProp="label"
            optionHeight={optionHeight?optionHeight:(global?50:35)}
            async={async}
            cache={false}
            onSelectResetsInput={false}
            onBlurResetsInput
            onInputKeyDown={this.keyDown}
            noResultsText={(!strict||!dataSource)?false:noResultsText}
            ignoreCase={false}
            optionRenderer={this.optionRenderer}
            />
        </div>)
    }
}