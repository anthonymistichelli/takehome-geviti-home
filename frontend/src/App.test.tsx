import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import App from './App'

vi.mock('axios')
vi.mock('./History', () => ({
    HistoryPage: ({ onLogout }: { onLogout: () => void }) => (
        <div data-testid="history-page">
            <button onClick={onLogout}>Back from History</button>
            Estimation History
        </div>
    )
}))

describe('Home Price Predictor App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the app with title', () => {
        ; (axios.get as any).mockResolvedValue({ data: { results: [] } })
        render(<App />)
        expect(screen.getByText('Geviti.Home')).toBeInTheDocument()
    })

    it('renders the history button', () => {
        ; (axios.get as any).mockResolvedValue({ data: { results: [] } })
        render(<App />)
        expect(screen.getByText('History')).toBeInTheDocument()
    })

    it('renders prediction form', () => {
        ; (axios.get as any).mockResolvedValue({ data: { results: [] } })
        render(<App />)
        expect(screen.getByPlaceholderText('e.g., 2000')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('e.g., 3')).toBeInTheDocument()
    })

    it('submits prediction form with valid data', async () => {
        const mockPredictionResponse = {
            data: {
                id: 1,
                session_token: 'session_1234567_abc123',
                square_footage: 2000,
                bedrooms: 3,
                predicted_price: 450000,
                created_at: '2024-01-01T00:00:00Z',
            },
        }

            ; (axios.get as any).mockResolvedValue({ data: [] })
            ; (axios.post as any).mockResolvedValue(mockPredictionResponse)

        render(<App />)

        const squareFootageInput = screen.getByPlaceholderText('e.g., 2000') as HTMLInputElement
        const bedroomsInput = screen.getByPlaceholderText('e.g., 3') as HTMLInputElement
        const submitButton = screen.getByText('Predict Price')

        fireEvent.change(squareFootageInput, { target: { value: '2000' } })
        fireEvent.change(bedroomsInput, { target: { value: '3' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8000/api/predictions/',
                expect.objectContaining({
                    square_footage: 2000,
                    bedrooms: 3,
                    session_token: expect.any(String),
                })
            )
        })
    })

    it('displays prediction result after successful submission', async () => {
        const mockResponse = {
            id: 1,
            session_token: 'test-token',
            square_footage: 2000,
            bedrooms: 3,
            predicted_price: 250000,
            created_at: '2024-01-01T00:00:00Z',
        }

            ; (global.fetch as any) = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                })
            )

        render(<App />)

        const squareFootageInput = screen.getByRole('spinbutton', { name: /square footage/i })
        const bedroomsInput = screen.getByRole('spinbutton', { name: /bedrooms/i })
        const submitButton = screen.getByRole('button', { name: /predict price/i })

        fireEvent.change(squareFootageInput, { target: { value: '2000' } })
        fireEvent.change(bedroomsInput, { target: { value: '3' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Estimation Result')).toBeInTheDocument()
        })
    })

    it('shows error message on failed prediction', async () => {
        ; (axios.get as any).mockResolvedValue({ data: [] })
            ; (axios.post as any).mockRejectedValue({
                response: { data: { error: 'Test error' } },
            })

        render(<App />)

        const squareFootageInput = screen.getByPlaceholderText('e.g., 2000') as HTMLInputElement
        const bedroomsInput = screen.getByPlaceholderText('e.g., 3') as HTMLInputElement
        const submitButton = screen.getByText('Predict Price')

        fireEvent.change(squareFootageInput, { target: { value: '2000' } })
        fireEvent.change(bedroomsInput, { target: { value: '3' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Test error')).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('navigates to history when History button is clicked', () => {
        ; (axios.get as any).mockResolvedValue({ data: [] })
        render(<App />)

        const historyButton = screen.getByText('History')
        fireEvent.click(historyButton)

        expect(screen.getByTestId('history-page')).toBeInTheDocument()
    })

    it('navigates back from history when onLogout is called', async () => {
        ; (axios.get as any).mockResolvedValue({ data: [] })
        render(<App />)

        // Navigate to history
        const historyButton = screen.getByText('History')
        fireEvent.click(historyButton)
        expect(screen.getByTestId('history-page')).toBeInTheDocument()

        // Navigate back
        const backButton = screen.getByText('Back from History')
        fireEvent.click(backButton)

        await waitFor(() => {
            expect(screen.getByText('Home Price Predictor')).toBeInTheDocument()
        })
    })
})
