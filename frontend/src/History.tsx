import { useState, useEffect } from 'react'
import axios from 'axios'
import './History.css'
import { formatNumberWithCommas, formatCurrency } from './utils'

interface PredictionResult {
    id: number
    session_token: string
    name: string
    square_footage: number
    bedrooms: number
    predicted_price: number
    created_at: string
}

interface HistoryProps {
    onLogout: () => void
}

export function HistoryPage({ onLogout }: HistoryProps) {
    const [predictions, setPredictions] = useState<PredictionResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Edit form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')
    const [editSqft, setEditSqft] = useState('')
    const [editBedrooms, setEditBedrooms] = useState('')
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState('')

    // Sorting and filtering state
    const [sortColumn, setSortColumn] = useState<'name' | 'square_footage' | 'bedrooms' | 'predicted_price' | 'created_at'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filterName, setFilterName] = useState('')
    const [filterMinPrice, setFilterMinPrice] = useState('')
    const [filterMaxPrice, setFilterMaxPrice] = useState('')

    const API_BASE_URL = 'http://localhost:8000/api/predictions'

    useEffect(() => {
        const token = localStorage.getItem('sessionToken')
        if (token) {
            fetchPredictionsForSession(token)
        }
    }, [])

    const fetchPredictionsForSession = async (token: string) => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(
                `${API_BASE_URL}/session-data/?session_token=${token}`
            )
            setPredictions(response.data)
        } catch (err: any) {
            setError('Error fetching predictions')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (pred: PredictionResult) => {
        setEditingId(pred.id)
        setEditName(pred.name)
        setEditSqft(pred.square_footage.toString())
        setEditBedrooms(pred.bedrooms.toString())
        setEditError('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditName('')
        setEditSqft('')
        setEditBedrooms('')
        setEditError('')
    }

    const handleSaveEdit = async (id: number) => {
        const sessionToken = localStorage.getItem('sessionToken')
        if (!sessionToken) return

        setEditLoading(true)
        setEditError('')

        try {
            const sqft = editSqft ? parseFloat(editSqft) : undefined
            const beds = editBedrooms ? parseInt(editBedrooms) : undefined

            const updateData: any = {}
            if (editName !== '') updateData.name = editName
            if (sqft !== undefined) updateData.square_footage = sqft
            if (beds !== undefined) updateData.bedrooms = beds

            const response = await axios.patch(
                `${API_BASE_URL}/session-update/${id}/?session_token=${sessionToken}`,
                updateData
            )

            const updatedPredictions = predictions.map(p =>
                p.id === id ? response.data : p
            )
            setPredictions(updatedPredictions)
            setSuccess('Prediction updated successfully!')
            setTimeout(() => setSuccess(''), 3000)
            handleCancelEdit()
        } catch (err: any) {
            setEditError(err.response?.data?.error || 'Error updating prediction')
        } finally {
            setEditLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const sessionToken = localStorage.getItem('sessionToken')
        if (!sessionToken) return

        if (!window.confirm('Are you sure you want to delete this prediction?')) return

        try {
            await axios.delete(
                `${API_BASE_URL}/session-delete/${id}/?session_token=${sessionToken}`
            )
            setPredictions(predictions.filter(p => p.id !== id))
            setSuccess('Prediction deleted successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error deleting prediction')
        }
    }

    const handleSort = (column: 'name' | 'square_footage' | 'bedrooms' | 'predicted_price' | 'created_at') => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortOrder('asc')
        }
    }

    const getSortedAndFilteredPredictions = () => {
        let filtered = predictions.filter(p => {
            const matchesName = !filterName || p.name.toLowerCase().includes(filterName.toLowerCase())
            const matchesMinPrice = !filterMinPrice || p.predicted_price >= parseFloat(filterMinPrice)
            const matchesMaxPrice = !filterMaxPrice || p.predicted_price <= parseFloat(filterMaxPrice)
            return matchesName && matchesMinPrice && matchesMaxPrice
        })

        const sorted = [...filtered].sort((a, b) => {
            let aVal: any = a[sortColumn]
            let bVal: any = b[sortColumn]

            if (sortColumn === 'created_at') {
                aVal = new Date(aVal).getTime()
                bVal = new Date(bVal).getTime()
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return sorted
    }

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return ' ⇅'
        return sortOrder === 'asc' ? ' ↑' : ' ↓'
    }

    const sortedAndFilteredPredictions = getSortedAndFilteredPredictions()

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>Estimation History</h1>
                <button
                    className="logout-btn"
                    onClick={onLogout}
                    aria-label="Back to prediction form"
                >
                    Back
                </button>
            </div>

            {error && <div className="error" role="alert">{error}</div>}
            {success && <div className="success" role="status" aria-live="polite">{success}</div>}

            <div className="history-content">
                <div className="history-section-header">
                    <div>
                        <h2>Your Estimations</h2>
                        <p className="total-predictions">Total: {predictions.length} (Showing: {sortedAndFilteredPredictions.length})</p>

                        {loading ? (
                            <p role="status" aria-live="polite">Loading predictions...</p>
                        ) : predictions.length === 0 ? (
                            <p>No predictions yet. Make your first prediction to see it here!</p>
                        ) : (
                            <>
                                <div className="filter-section">
                                    <h3>Filter & Sort</h3>
                                    <div className="filter-controls">
                                        <div className="filter-group">
                                            <label htmlFor="filterName">Search by Name:</label>
                                            <input
                                                id="filterName"
                                                type="text"
                                                placeholder="Enter name..."
                                                value={filterName}
                                                onChange={(e) => setFilterName(e.target.value)}
                                                aria-label="Filter predictions by name"
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <label htmlFor="filterMinPrice">Min Price:</label>
                                            <input
                                                id="filterMinPrice"
                                                type="number"
                                                placeholder="$0"
                                                value={filterMinPrice}
                                                onChange={(e) => setFilterMinPrice(e.target.value)}
                                                aria-label="Filter by minimum price"
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <label htmlFor="filterMaxPrice">Max Price:</label>
                                            <input
                                                id="filterMaxPrice"
                                                type="number"
                                                placeholder="$999,999"
                                                value={filterMaxPrice}
                                                onChange={(e) => setFilterMaxPrice(e.target.value)}
                                                aria-label="Filter by maximum price"
                                            />
                                        </div>
                                        <button
                                            className="reset-filters-btn"
                                            onClick={() => {
                                                setFilterName('')
                                                setFilterMinPrice('')
                                                setFilterMaxPrice('')
                                            }}
                                            aria-label="Clear all filters"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="history-table" role="table" aria-label="Your predictions table">
                                        <thead>
                                            <tr>
                                                <th scope="col" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                                    Name{getSortIcon('name')}
                                                </th>
                                                <th scope="col" onClick={() => handleSort('square_footage')} style={{ cursor: 'pointer' }}>
                                                    Square Footage{getSortIcon('square_footage')}
                                                </th>
                                                <th scope="col" onClick={() => handleSort('bedrooms')} style={{ cursor: 'pointer' }}>
                                                    Bedrooms{getSortIcon('bedrooms')}
                                                </th>
                                                <th scope="col" onClick={() => handleSort('predicted_price')} style={{ cursor: 'pointer' }}>
                                                    Predicted Price{getSortIcon('predicted_price')}
                                                </th>
                                                <th scope="col" onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                                                    Date Created{getSortIcon('created_at')}
                                                </th>
                                                <th scope="col">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedAndFilteredPredictions.map((pred) => (
                                                <tr key={pred.id}>
                                                    <td>
                                                        {editingId === pred.id ? (
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                placeholder="Enter name (optional)"
                                                                style={{ width: '100%', padding: '4px' }}
                                                            />
                                                        ) : (
                                                            pred.name || '-'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingId === pred.id ? (
                                                            <input
                                                                type="number"
                                                                value={editSqft}
                                                                onChange={(e) => setEditSqft(e.target.value)}
                                                                placeholder="Square footage"
                                                                style={{ width: '100%', padding: '4px' }}
                                                            />
                                                        ) : (
                                                            formatNumberWithCommas(pred.square_footage)
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingId === pred.id ? (
                                                            <input
                                                                type="number"
                                                                value={editBedrooms}
                                                                onChange={(e) => setEditBedrooms(e.target.value)}
                                                                placeholder="Bedrooms"
                                                                style={{ width: '100%', padding: '4px' }}
                                                            />
                                                        ) : (
                                                            pred.bedrooms
                                                        )}
                                                    </td>
                                                    <td>{formatCurrency(pred.predicted_price)}</td>
                                                    <td>
                                                        {new Date(pred.created_at).toLocaleDateString()}{' '}
                                                        {new Date(pred.created_at).toLocaleTimeString()}
                                                    </td>
                                                    <td className="actions-cell">
                                                        {editingId === pred.id ? (
                                                            <>
                                                                <button
                                                                    className="submit-btn"
                                                                    onClick={() => handleSaveEdit(pred.id)}
                                                                    disabled={editLoading}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className="cancel-btn"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() => handleEditClick(pred)}
                                                                    aria-label={`Edit prediction for ID ${pred.id}`}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => handleDelete(pred.id)}
                                                                    aria-label={`Delete prediction for ID ${pred.id}`}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {editError && <div className="error" style={{ marginTop: '10px' }}>{editError}</div>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
