import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import API_URL from "@/config/api.js"
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
import { AlertCircle, CheckCircle } from "lucide-react"

const REGISTER_URL = `${API_URL}/AdminReg`

export function RegisterForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    schoolName: ""
  })
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await axios.post(REGISTER_URL, formData)
      setMessageType("success")
      setMessage(`Admin registered successfully! School ID: ${res.data.schoolName}`)
      setFormData({ name: "", email: "", password: "", schoolName: "" })
      setTimeout(() => navigate("/AdminLogin"), 2000)
    } catch (error) {
      setMessageType("error")
      setMessage(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Registration</CardTitle>
          <CardDescription>
            Create your school management account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Message Display */}
          {message && (
            <div className={cn(
              "mb-6 p-4 rounded-lg flex items-start gap-3",
              messageType === "success" 
                ? "bg-green-50 border border-green-200" 
                : "bg-destructive/15 border border-destructive/50"
            )}>
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              )}
              <span className={messageType === "success" ? "text-green-700 text-sm" : "text-destructive text-sm"}>
                {message}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  type="text" 
                  placeholder="Enter your full name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  placeholder="admin@school.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input 
                  id="schoolName"
                  name="schoolName" 
                  type="text" 
                  placeholder="e.g., Central High School" 
                  value={formData.schoolName}
                  onChange={handleChange}
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  This will be your school's unique identifier
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password" 
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  Password should be at least 6 characters
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Admin"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/AdminLogin" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
