import Form from './Form'
import Field from './Field'
import RawForm from 'react-formal'
import Select from './Select'
import Checkbox from './Checkbox'
import FormCheckbox from './FormCheckbox'
import CheckboxGroup from './CheckboxGroup'
import Radio from './Radio'
import Button from './Button'
import TextInput from './Input'
import Textarea from './Textarea'
import invariant from 'invariant'
import errToJSON from './util'
import { RangePicker} from '../DatePicker'
import DatePicker from './DatePicker'
import TimePicker from '../TimePicker'
const list=['Message','Context','Trigger','setter','getter','toErrors','addInputTypes','setDefaults']
list.forEach((x)=>{
    Form[x]=RawForm[x]
})
const types={
  'select': Select,
  'checkbox': FormCheckbox,
  'checkboxgroup': CheckboxGroup,
  'radio': Radio,
  'timepicker': TimePicker,
  'datepicker': DatePicker,
  'rangepicker': RangePicker
}
Form.addInputTypes(types)
Form.Field=Field
Form.Button=Button
Form.toErrors = (err) => {
    invariant(err && err.name === 'ValidationError',
      '`toErrors()` only works with ValidationErrors.')
  
    return errToJSON(err)
  }
export {Checkbox,CheckboxGroup,Radio,Select,Textarea,TextInput}
export default Form
