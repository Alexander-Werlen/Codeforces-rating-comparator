import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    newHandle: React.RefObject<HTMLInputElement>
    loadingNewUser: boolean
}

export const FormSection: React.FC<Props>  = ({handleSubmit, newHandle, loadingNewUser}) => {
    return (
        <div className="flex justify-center items-center">
        <form className="mt-6 mb-2" onSubmit={handleSubmit}>
            
            <input type="text" id="newHandle" name="newHandle" placeholder="tourist" ref={newHandle} className="border-2 rounded h-9 p-1 border-gray-500 text-base"/>
            {!loadingNewUser && 
            <input type="submit" value="ADD" className="ml-4 w-20 border-2 rounded p-1 cursor-pointer bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 text-white"/>
            }
            {loadingNewUser && 
            <Button disabled className="ml-4 h-9 w-20 border-2 rounded p-1 bg-blue-500 border-blue-500 text-white text-base">
            ADD
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </Button>
            }
        </form>
        </div>

    )
}