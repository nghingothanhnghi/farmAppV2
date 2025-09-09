// src/components/Migration/components/TemplateCreator.tsx
import React, { useState } from 'react';
import { createTemplate } from '../../../services/templateService';
import { useAlert } from '../../../contexts/alertContext';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from "../../common/Form";
import Button from '../../common/Button';

interface TemplateCreatorProps {
    onTemplateCreated?: () => void;
    goBack?: () => void;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onTemplateCreated, goBack }) => {
    const { setAlert } = useAlert();

    const [clientId, setClientId] = useState('');
    const [jsonInput, setJsonInput] = useState('{}');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let parsed;
        try {
            parsed = JSON.parse(jsonInput);
        } catch (err) {
            setAlert({ type: 'error', message: 'Invalid JSON format in mapping.' });
            return;
        }
        try {
            setLoading(true);

            await createTemplate({
                client_id: clientId.trim(),
                mapping: parsed,
            });

            setAlert({ type: 'success', message: 'Template created successfully!' });
            setClientId('');
            setJsonInput('{}');
            onTemplateCreated?.(); // 🟢 tell parent to reload
        } catch (err: any) {
            console.error(err);
            const message =
                err?.response?.data?.detail || 'Failed to create template.';
            setAlert({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800">Add New Template</h2>
            <p className="text-sm text-gray-500">
                Please enter valid JSON like: <code>{'{"source_key": "target_key"}'}</code>
            </p>

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
                <FormLabel htmlFor="template_mapping">Template Mapping (JSON)</FormLabel>
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
                    rounded='lg'
                />
                <Button
                    type="submit"
                    label={loading ? 'Creating...' : 'Create Template'}
                    disabled={loading || !clientId}
                    variant="primary"
                    rounded='lg'
                />
            </FormActions>
        </Form>
    );
};

export default TemplateCreator;
