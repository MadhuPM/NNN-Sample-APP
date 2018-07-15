import addEventListener from 'dom-helpers/events/on';
import removeEventListener from 'dom-helpers/events/off';
import ownerDocument from 'dom-helpers/ownerDocument';
import ReactDOM from 'react-dom'
export function emptyFunc(){
}
export function contains(root, n) {
  let node = n
  while (node) {
    if (node === root) {
      return true
    }
    node = node.parentNode
  }

  return false
}
