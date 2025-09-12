// components/Migration/components/RawDataForm.tsx
import React, { useRef, useState } from "react";
import { ingestRawData } from "../../../services/migrationService";
import FileInput from "../../common/FileInput";
import Form, { FormGroup, FormLabel, FormInput, FormActions } from "../../common/Form";
import Button from "../../common/Button";
import { useAlert } from '../../../contexts/alertContext';
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

const RawDataForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { setAlert } = useAlert();
  const [clientId, setClientId] = useState("");
  const [payload, setPayload] = useState("{}");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text); // ensure it's valid JSON
        setPayload(JSON.stringify(parsed, null, 2)); // pretty-print
      } catch (error) {
        console.error("JSON parse error:", error);
        setAlert({
          type: "error",
          message: "Invalid JSON file. Please upload a valid .json file.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const parsed = JSON.parse(payload);
      await ingestRawData({ client_id: clientId, payload: parsed });
      setAlert({ type: "success", message: "Data ingested successfully!" });
      setClientId("");
      setPayload("{}");
      setTimeout(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 0);
      // ✅ Move to next step
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Invalid JSON or server error. Please check your input.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="client_id">Client ID</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Used to name and save your trained model.</p>
        </div>
        <div>
          <FormInput
            id="client_id"
            name="client_id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
        </div>
      </FormGroup>

      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="json-upload">Upload JSON File</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Used to name and save your trained model.</p>
        </div>
        <div>
          <FileInput
            id="json-upload"
            onChange={handleFileChange}
            inputRef={fileInputRef}
            accept=".json"
            multiple={false}
            label="Choose file"
          />
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="payload">Payload (Editable JSON)</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Used to name and save your trained model.</p>
        </div>

        <div className="border rounded-md overflow-hidden">
          <CodeMirror
            value={payload}
            height="300px"
            extensions={[json()]}
            onChange={(val) => setPayload(val)}
            theme="light"
          />
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          type="submit"
          label={isSubmitting ? "Submitting..." : "Submit Raw Data"}
          disabled={isSubmitting}
          variant="primary"
          className="md:w-auto"
          fullWidth={true}
          rounded='lg'
        />
      </FormActions>
    </Form>
  );
};

export default RawDataForm;
