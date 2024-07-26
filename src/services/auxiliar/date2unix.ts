export default function date2unix(date: string): number{
    return Math.floor(new Date(date).getTime() / 1000)
}