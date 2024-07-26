export default function unix2date(unixTime: number): string{
    const date = new Date(unixTime * 1000)
    
    return date.toISOString().slice(0,10)
}