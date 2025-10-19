/**
 * Format a number with comma separators
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(num: number, decimals: number = 2): string {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

/**
 * Format a number as currency with commas
 * @param num - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(num: number): string {
    return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
