import { useState, useRef } from "react"
import {Graph} from "./components/Graph.tsx"
import { FormSection } from "./components/FormSection.tsx"
import { TableSection } from "./components/TableSection.tsx"
import unix2date from "./services/auxiliar/unix2date.ts"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

type Contest = {
  contestId: number,
  contestName: string,
  handle: string,
  rank: number,
  ratingUpdateTimeSeconds: number,
  oldRating: number,
  newRating: number
}
type DayData = {
  dateUNIX: number,
  rating: number
}
type UsersRatingHistory = {handle: string, rating_history: DayData[]}[]
type UserData = {
  handle: string,
  current_rating: number,
  peak_rating: number,
  peak_rating_date: string
}

function App() {

  async function addUserRatingHistory(newHandle: string | null){
    if(!newHandle) {
      setLoadingNewUser(false)
      return
    }
    if(selectedUsers.includes(newHandle.toLowerCase())) {
      toast({
        variant: "default",
        title: "USER WAS PREVIOUSLY ADDED",
        description: `User "${newHandle}" was already added`,
      })
      setLoadingNewUser(false)
      return
    }

    const url = "https://codeforces.com/api/user.rating?handle=".concat(newHandle)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
  
      const json = await response.json()
      const newUserContests: Contest[] =  json.result
      const newUserRatingHistory: DayData[] = newUserContests.map((contest) => {return {dateUNIX: contest.ratingUpdateTimeSeconds, rating: contest.newRating}})
      
      setRatingsHistory((ratingsHistory) => [...ratingsHistory, {handle: newHandle, rating_history: newUserRatingHistory}])
      
      //getting table data of user
      let current_rating = 0
      let peak_rating = -1
      let peak_rating_date = "01/01/2024"
      newUserContests.forEach((contest) => {
        current_rating=contest.newRating
        if(contest.newRating>peak_rating){
          peak_rating=contest.newRating
          peak_rating_date = unix2date(contest.ratingUpdateTimeSeconds)
        }
      })
      setUsersData((prevState) => [...prevState, {
        handle: newHandle,
        current_rating: current_rating,
        peak_rating: peak_rating,
        peak_rating_date: peak_rating_date
      }])
      setSelectedUsers((users) => [...users, newHandle.toLowerCase()])
      
      toast({
        variant: "default",
        title: "NEW USER ADDED",
        description: `User "${newHandle}" added successfully`,
      })
    } catch (error) {
      console.error((error as Error).message);
      toast({
        variant: "destructive",
        title: "ERROR",
        description: `Couldn't get data of user "${newHandle}"`,
      })
    }
    setLoadingNewUser(false)
  }

  function deleteUser(handle: string){
    setSelectedUsers((users) => users.filter((u) => u!=handle.toLowerCase()))
    setUsersData((users) => users.filter((u) => u.handle!=handle))
    setRatingsHistory((ratingsHistory) => ratingsHistory.filter((history) => history.handle!=handle))
  }
  //form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!newHandle.current?.value) return
    setLoadingNewUser(true)
    addUserRatingHistory(newHandle.current.value)
    newHandle.current.value = ""
  }

  const initialRatingsHistory: UsersRatingHistory = []
  const initialUsers: string[] = []
  const initialUsersData: UserData[] = []

  const [selectedUsers, setSelectedUsers] = useState(initialUsers)
  const [ratingsHistory, setRatingsHistory] = useState(initialRatingsHistory)
  const [usersData, setUsersData] = useState(initialUsersData)
  const [loadingNewUser, setLoadingNewUser] = useState(false)

  const { toast } = useToast()

  const newHandle = useRef<HTMLInputElement>(null)

  return (
    <>
    <div className="container">
      <h1 className="text-center text-2xl sm:text-4xl font-bold mt-6 font-serif">
        CODE<span className="text-blue-800">FORCES</span>
        <br/>
        Rating Comparator
      </h1>
      <FormSection handleSubmit={handleSubmit} newHandle={newHandle} loadingNewUser={loadingNewUser}/>
      {<Graph ratingsHistory={ratingsHistory}/>}
      <TableSection tableData={usersData} deleteUser={deleteUser}/>
    </div>
    <Toaster />
    </>
  )
}

export default App
