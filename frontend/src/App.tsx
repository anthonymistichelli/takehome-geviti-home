import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { HistoryPage } from './History'
import { formatNumberWithCommas, formatCurrency } from './utils'

interface PredictionResult {
    id: number
    session_token: string
    square_footage: number
    bedrooms: number
    predicted_price: number
    created_at: string
}

function generateSessionToken(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getOrCreateSessionToken(): string {
    const stored = localStorage.getItem('sessionToken')
    if (stored) {
        return stored
    }
    const newToken = generateSessionToken()
    localStorage.setItem('sessionToken', newToken)
    return newToken
}

function App() {
    const [sessionToken, setSessionToken] = useState('')
    const [squareFootage, setSquareFootage] = useState('')
    const [bedrooms, setBedrooms] = useState('')
    const [prediction, setPrediction] = useState<PredictionResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showHistory, setShowHistory] = useState(false)

    const API_BASE_URL = 'http://localhost:8000/api/predictions'

    // Initialize session token on component mount
    useEffect(() => {
        setSessionToken(getOrCreateSessionToken())
    }, [])

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_BASE_URL}/`, {
                session_token: sessionToken,
                square_footage: parseFloat(squareFootage),
                bedrooms: parseInt(bedrooms),
            })

            setPrediction(response.data)
        } catch (err: any) {
            setError(
                err.response?.data?.error || 'Error making prediction. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (showHistory) {
        return (
            <HistoryPage
                onLogout={() => {
                    setShowHistory(false)
                }}
            />
        )
    }

    return (
        <div className="app-wrapper">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="header" role="banner">
                <div className="header-content">
                    <div className="header-left">
                        <img src="/logo.png" alt="Geviti Logo - Home Price Predictor" className="logo" />
                        <div className="brand">
                            <h1 className="brand-name">Geviti.Home</h1>
                        </div>
                    </div>
                    <button
                        className="history-button-header"
                        onClick={() => setShowHistory(true)}
                        aria-label="View prediction history"
                    >
                        History
                    </button>
                </div>
            </header>
            <main className="container" id="main-content">
                <h1>Home Price Predictor</h1>

                <div className="prediction-form">
                    <h2>Home Specifications</h2>
                    <form onSubmit={handlePredict} aria-label="Home price prediction form">
                        <div className="form-group">
                            <label htmlFor="squareFootage">Square Footage:</label>
                            <input
                                id="squareFootage"
                                type="number"
                                step="1"
                                min="1"
                                value={squareFootage}
                                onChange={(e) => setSquareFootage(e.target.value)}
                                placeholder="e.g., 2000"
                                aria-required="true"
                                aria-label="Enter square footage of the home"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bedrooms">Number of Bedrooms:</label>
                            <input
                                id="bedrooms"
                                type="number"
                                min="1"
                                value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)}
                                placeholder="e.g., 3"
                                aria-required="true"
                                aria-label="Enter number of bedrooms"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} aria-busy={loading}>
                            {loading ? 'Predicting...' : 'Predict Price'}
                        </button>
                    </form>

                    {error && <div className="error" role="alert">{error}</div>}
                    {prediction && (
                        <div className="result" role="status" aria-live="polite">
                            <h3>Estimation Result</h3>
                            <p>
                                <strong>Square Footage:</strong> {formatNumberWithCommas(prediction.square_footage)} sqft
                            </p>
                            <p>
                                <strong>Bedrooms:</strong> {prediction.bedrooms}
                            </p>
                            <p className="predicted-price">
                                <strong>Predicted Price:</strong> {formatCurrency(prediction.predicted_price)}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default App
