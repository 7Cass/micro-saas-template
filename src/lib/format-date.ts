export function formatTimestampToDate(date: number): string {
    return new Intl.DateTimeFormat('pt-br', {
        dateStyle: 'short'
    }).format(date * 1000);
}