// src/components/Jackpot/components/BuyTicketPanel.tsx
import React from 'react';
import type { PlayType, Ticket } from '../../../models/interfaces/Jackpot';
import Button from '../../common/Button';
import { useAuth } from '../../../contexts/authContext';
import { useAlert } from '../../../contexts/alertContext';
import { useJackpotContext } from '../../../contexts/jackpotContext';
import { FormGroup, FormLabel, FormSelect } from '../../common/Form';

interface Props {
    numbers: number[];
    setNumbers: React.Dispatch<React.SetStateAction<number[]>>;
    playType: PlayType;
    setPlayType: React.Dispatch<React.SetStateAction<PlayType>>;
    requiredNumbers: number;
    onTicketPurchased?: (ticket: Ticket) => void; // ✅ callback
}

const BuyTicketPanel: React.FC<Props> = ({ numbers, setNumbers, playType, setPlayType, requiredNumbers }) => {
    const { user, isAuthenticated } = useAuth();
    const { setAlert } = useAlert();
    const { latestDraw, loading, actions } = useJackpotContext();

    const handleBuyTicket = async () => {
        if (!isAuthenticated || !user) {
            setAlert({ type: 'warning', message: 'Please log in to buy a ticket.' });
            return;
        }
        if (!latestDraw) {
            setAlert({ type: 'info', message: 'No active draw available.' });
            return;
        }
        if (numbers.length !== requiredNumbers) {
            setAlert({ type: 'warning', message: `Please select exactly ${requiredNumbers} numbers.` });
            return;
        }
        try {
            const ticket = await actions.buyTicket({
                user_id: user.id,
                draw_id: latestDraw.id,
                numbers,
                play_type: playType,
            });
            setAlert({ type: 'success', message: `Ticket #${ticket.id} purchased successfully!` });
            setNumbers([]); // reset selection
        } catch (err: any) {
            setAlert({ type: 'error', message: err?.message || 'Failed to buy ticket.' });
        }
    };

    return (
        <div>
            {/* Play Type Selector */}
            <FormGroup>
                <FormLabel htmlFor="playType" className='text-sm mb-2'>Chọn cách chơi</FormLabel>
                <FormSelect
                    id="playType"
                    value={playType}
                    onChange={e => setPlayType(e.target.value as PlayType)}
                >
                    <option value="basic">Basic</option>
                    <option value="bao5">Bao 5</option>
                    <option value="bao7">Bao 7</option>
                    <option value="bao8">Bao 8</option>
                    <option value="bao9">Bao 9</option>
                </FormSelect>
            </FormGroup>
            <Button
                label={loading ? 'Processing...' : 'Buy Ticket'}
                onClick={handleBuyTicket}
                disabled={loading || numbers.length !== requiredNumbers}
                fullWidth
                size="md"
                variant="primary"
                rounded="md"
            />
        </div>
    );
};

export default BuyTicketPanel;
