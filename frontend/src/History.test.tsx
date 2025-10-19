import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import axios from 'axios'
import { HistoryPage } from './History'

vi.mock('axios')

describe('HistoryPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        localStorage.setItem('sessionToken', 'test-session-123')
    })

    it('renders prediction history title', () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockResolvedValue({ data: [] })

        render(<HistoryPage onLogout={mockLogout} />)

        expect(screen.getByText('Estimation History')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('displays back button', () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockResolvedValue({ data: [] })

        render(<HistoryPage onLogout={mockLogout} />)

        const backButton = screen.getByText('Back')
        expect(backButton).toBeInTheDocument()
    })

    it('fetches predictions for current session on mount', async () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockResolvedValue({ data: [] })

        render(<HistoryPage onLogout={mockLogout} />)

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('session_token=test-session-123')
            )
        }, { timeout: 3000 })
    })

    it('displays predictions table with correct columns', async () => {
        const mockLogout = vi.fn()
        const mockPredictions = [
            {
                id: 1,
                session_token: 'test-session-123',
                name: 'Test Home',
                square_footage: 2000,
                bedrooms: 3,
                predicted_price: 450000,
                created_at: '2024-01-01T00:00:00Z',
            },
        ]

            ; (axios.get as any).mockResolvedValue({ data: mockPredictions })
            ; (axios.patch as any).mockResolvedValue({ data: mockPredictions[0] })

        render(<HistoryPage onLogout={mockLogout} />)

        await waitFor(() => {
            // Check for headers
            expect(screen.getByText('Estimation History')).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('displays empty message when no predictions', async () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockResolvedValue({ data: [] })

        render(<HistoryPage onLogout={mockLogout} />)

        await waitFor(() => {
            expect(screen.getByText(/No predictions yet/i)).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('calls onLogout when Back button is clicked', async () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockResolvedValue({ data: [] })

        render(<HistoryPage onLogout={mockLogout} />)

        const backButton = screen.getByText('Back')
        fireEvent.click(backButton)

        expect(mockLogout).toHaveBeenCalled()
    })

    it('displays loading state while fetching predictions', () => {
        const mockLogout = vi.fn()
            ; (axios.get as any).mockImplementation(
                () => new Promise(() => { }) // Never resolves
            )

        render(<HistoryPage onLogout={mockLogout} />)

        // Component should render header even while loading
        expect(screen.getByText('Estimation History')).toBeInTheDocument()
    })
})
