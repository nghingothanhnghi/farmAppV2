// src/pages/Jackpot/CreateDrawPage.tsx
import React, { useState } from "react";
import { useJackpotContext } from '../../contexts/jackpotContext';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from "../../components/common/Form";
import Button from "../common/Button";
import PageTitle from "../common/PageTitle";

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

    const handleDateChange = (value: string) => {
        const chosenDate = new Date(value);
        const day = chosenDate.getDay(); // 0=CN, 1=T2, 2=T3,...
        if (![2, 4, 5].includes(day)) {
            alert("Chỉ được chọn ngày Thứ 3, Thứ 5 hoặc Thứ 6");
            return;
        }
        chosenDate.setHours(18, 0, 0, 0);
        setDrawDate(chosenDate.toISOString().slice(0, 16));
    };

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
        <div>
            <PageTitle title="Tạo kỳ quay Jackpot 6/55" />
            <Form
                onSubmit={handleSubmit}
                className="mx-auto max-w-4xl"
            >
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                {/* Draw Date */}
                <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
                    <div className='space-y-1'>
                        <FormLabel htmlFor="drawDate">Ngày Quay Số</FormLabel>
                        <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"> Thời gian quay số cố định: Thứ 3, Thứ 5, Thứ 6 lúc 18:00.
                            Chọn ngày hợp lệ gần nhất để tạo kỳ quay.</p>
                    </div>
                    <div>
                        <FormInput
                            id="drawDate"
                            type="datetime-local"
                            value={drawDate.slice(0, 10)}
                            // onChange={(e) => setDrawDate(e.target.value)}
                            onChange={(e) => handleDateChange(e.target.value)}
                            required

                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Giờ sẽ tự động đặt là 18:00
                        </p>
                    </div>
                </FormGroup>
                <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"/>
                {/* Numbers */}
                <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
                    <div className='space-y-1'>
                        <FormLabel htmlFor="numbers">Các Số Trúng</FormLabel>
                        <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Chọn đủ 6 số trong khoảng 1 – 55.</p>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {numbers.map((num, idx) => (
                            <FormInput
                                key={idx}
                                id={`number-${idx}`}
                                type="number"
                                min={1}
                                max={55}
                                value={isNaN(num) ? "" : num}
                                onChange={(e) => handleNumberChange(idx, e.target.value)}
                                className="w-16"
                                required
                            />
                        ))}
                    </div>
                </FormGroup>
                <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"/>
                {/* Bonus Number */}
                <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
                    <div className='space-y-1'>
                        <FormLabel htmlFor="bonusNumber">Số Đặc Biệt</FormLabel>
                        <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Chọn 1 số trong khoảng 1 – 55 để làm số đặc biệt.</p>
                    </div>
                    <div>
                        <FormInput
                            id="bonusNumber"
                            type="number"
                            min={1}
                            max={55}
                            value={bonusNumber ?? ""}
                            onChange={(e) => setBonusNumber(Number(e.target.value))}
                            required
                        />
                    </div>
                </FormGroup>
                <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"/>
                {/* Actions */}
                <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Button
                        label={loading ? "Creating..." : "Create Draw"}
                        type="submit"
                        disabled={loading}
                        className="md:w-auto"
                        fullWidth={true}
                        rounded='lg'
                    />
                </FormActions>
            </Form>
        </div>
    );
};

export default CreateDrawPage;
