import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export function ParentLoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const { parentLogin, loading, error } = useAuth()
  
  const [studentName, setStudentName] = useState("")
  const [rollNum, setRollNum] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    const credentials = { studentName, rollNum, password }

    try {
      await parentLogin(credentials)
      navigate("/parent/dashboard")
    } catch (err) {
      setLocalError(error || "Invalid credentials or Server error.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Parent Login</CardTitle>
          <CardDescription>
            Enter student details to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {localError && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" />
                 {localError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    type="text"
                    placeholder="Ali Khan"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rollNum">Roll Number</Label>
                  <Input
                    id="rollNum"
                    type="number"
                    placeholder="101"
                    required
                    value={rollNum}
                    onChange={(e) => setRollNum(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking login, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
