// src/pages/Jackpot/CreateDrawPage.tsx
import React, { useState } from "react";
import { useJackpotContext } from '../../contexts/jackpotContext';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from "../../components/common/Form";
import Button from "../common/Button";

const CreateDrawPage: React.FC = () => {
  const { actions, loading, error } = useJackpotContext();

  const [drawDate, setDrawDate] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });

  const [numbers, setNumbers] = useState<number[]>(Array(6).fill(NaN));
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleNumberChange = (index: number, value: string) => {
    const newNums = [...numbers];
    newNums[index] = value ? Number(value) : NaN;
    setNumbers(newNums);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (numbers.some(isNaN)) {
      alert("Please fill all 6 numbers");
      return;
    }
    if (bonusNumber === null || isNaN(bonusNumber)) {
      alert("Please provide a bonus number");
      return;
    }

    try {
      await actions.createDraw({
        draw_date: new Date(drawDate).toISOString(),
        numbers,
        bonus_number: bonusNumber,
      });

      await actions.fetchLatestDraw(); // refresh after create
      setSuccessMessage(`✅ Draw created for ${new Date(drawDate).toLocaleString()}`);
      setNumbers(Array(6).fill(NaN));
      setBonusNumber(null);
    } catch (err: any) {
      console.error("Failed to create draw", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">
        🎯 Create Manual Jackpot Draw
      </h1>

      <Form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6"
      >
        {/* Draw Date */}
        <FormGroup>
          <FormLabel htmlFor="drawDate">Draw Date & Time</FormLabel>
          <FormInput
            id="drawDate"
            type="datetime-local"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            required
          />
        </FormGroup>

        {/* Numbers */}
        <FormGroup className="flex flex-wrap gap-3">
          <FormLabel htmlFor="numbers">Numbers</FormLabel>
          {numbers.map((num, idx) => (
            <FormInput
              key={idx}
              id={`number-${idx}`}
              type="number"
              min={1}
              max={99}
              value={isNaN(num) ? "" : num}
              onChange={(e) => handleNumberChange(idx, e.target.value)}
              className="w-16"
              required
            />
          ))}
        </FormGroup>

        {/* Bonus Number */}
        <FormGroup>
          <FormLabel htmlFor="bonusNumber">Bonus Number</FormLabel>
          <FormInput
            id="bonusNumber"
            type="number"
            min={1}
            max={99}
            value={bonusNumber ?? ""}
            onChange={(e) => setBonusNumber(Number(e.target.value))}
            required
          />
        </FormGroup>

        {/* Actions */}
        <FormActions className="flex justify-end gap-3">
          <Button label={loading ? "Creating..." : "Create Draw"} type="submit" disabled={loading}/>
        </FormActions>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      </Form>
    </div>
  );
};

export default CreateDrawPage;
