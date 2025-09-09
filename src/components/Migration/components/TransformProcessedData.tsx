import React, { useState } from 'react';
import { useAlert } from '../../../contexts/alertContext';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import Form, { FormGroup, FormLabel, FormActions, FormInput } from "../../common/Form";
import Button from '../../common/Button';
import { createTemplate } from '../../../services/templateService';
interface TransformProcessedDataProps {
    onCompleteStep?: () => void;
    goBack?: () => void;
}

const TransformProcessedData: React.FC<TransformProcessedDataProps> = ({ onCompleteStep, goBack }) => {
    const { setAlert } = useAlert();

    const [clientId, setClientId] = useState('');
    const [jsonInput, setJsonInput] = useState('{}');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const parsed = JSON.parse(jsonInput);

            await createTemplate({
                client_id: clientId,
                mapping: parsed,
            });

            setAlert({ type: 'success', message: 'Template created successfully' });

            if (onCompleteStep) {
                onCompleteStep();
            }
        } catch (err: any) {
            console.error(err);
            setAlert({
                type: 'error',
                message: err?.response?.data?.detail || 'Failed to create template',
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <FormGroup>
                <FormLabel htmlFor="client_id">Client ID</FormLabel>
                <FormInput
                    id="client_id"
                    name="client_id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter client ID"
                    required
                />
            </FormGroup>
            <FormGroup>
                <FormLabel htmlFor="template_mapping">Result</FormLabel>
                <div className="border rounded-md overflow-hidden">
                    <CodeMirror
                        value={jsonInput}
                        height="200px"
                        extensions={[json()]}
                        onChange={(val) => setJsonInput(val)}
                        theme="light"
                    />
                </div>
            </FormGroup>
            <FormActions>
                <Button
                    type="button"
                    label="Back"
                    variant="secondary"
                    onClick={goBack}
                />
                <Button
                    type="submit"
                    label={loading ? 'Creating...' : 'Create Template'}
                    disabled={loading || !clientId}
                    variant="primary"
                />
            </FormActions>
        </Form>
    );
};

export default TransformProcessedData;
