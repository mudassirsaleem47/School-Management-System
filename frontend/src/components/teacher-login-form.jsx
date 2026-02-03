import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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

export function TeacherLoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const { teacherLogin, loading, error } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    const credentials = { email, password }

    try {
      await teacherLogin(credentials)
      navigate("/teacher/dashboard")
    } catch (err) {
      setLocalError(error || "Invalid credentials or Server error.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Teacher Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your teaching dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {localError && (
            <div className="mb-6 p-4 bg-destructive/15 border border-destructive/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive text-sm">{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="teacher@school.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Are you an admin?{" "}
              <Link to="/AdminLogin" className="underline underline-offset-4">
                Login here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
