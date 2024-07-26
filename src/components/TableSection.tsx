import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from "./ui/button"
  
type UserData = {
    handle: string,
    current_rating: number,
    peak_rating: number,
    peak_rating_date: string
}
interface Props {
    tableData: UserData[],
    deleteUser: (handle: string) => void
}

export const TableSection: React.FC<Props> = ({tableData, deleteUser}) => {
    return (
        <Table className="mt-8">
        <TableHeader>
            <TableRow>
            <TableHead className="sm:text-center">User</TableHead>
            <TableHead className="sm:text-center">Current rating</TableHead>
            <TableHead className="sm:text-center">Peak rating</TableHead>
            <TableHead className="sm:text-center">Peak rating date</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {tableData.map((user) => (
            <TableRow key={user.handle}>
                <TableCell className="font-medium sm:text-center">{user.handle}</TableCell>
                <TableCell className="sm:text-center">{user.current_rating}</TableCell>
                <TableCell className="sm:text-center">{user.peak_rating}</TableCell>
                <TableCell className="sm:text-center">{user.peak_rating_date}</TableCell>
                <TableCell className="text-end">
                    <Button className="p-0 m-0 h-5 w-5 rounded-xl aspect-auto align-middle text-center bg-transparent text-red-600 hover:bg-slate-200" onClick={()=>deleteUser(user.handle)}>X</Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    )
}
