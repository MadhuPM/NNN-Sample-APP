import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import funds from './data/funds.json';

function FieldGroup({ id, label, help, ...props }) {
    return (
        <FormGroup controlId={id}>
            {label && <ControlLabel>{label}</ControlLabel>}
            <FormControl {...props} />
            {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}

class FundTable extends Component {
    render() {
        return (
            <div className="App">
                <h1 className="App-title">Funds</h1>
                <Form inline>
                    <FieldGroup
                        id="search"
                        type="text"
                        placeholder="Search Funds"
                    />
                </Form>
            </div>
        );
    }
}

export default FundTable;
