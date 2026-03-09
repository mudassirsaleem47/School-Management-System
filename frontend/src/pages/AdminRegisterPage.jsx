import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "@/config/api.js";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, School, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordField } from '@/components/ui/email-pass';

const REGISTER_URL = `${API_URL}/AdminReg`;

const AdminRegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        schoolName: ""
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const res = await axios.post(REGISTER_URL, formData);
            setMessageType("success");
            setMessage(`Admin registered successfully! School ID: ${res.data.schoolName}`);
            setFormData({ name: "", email: "", password: "", schoolName: "" });
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in zoom-in-95">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                        <School className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">School Management System</h1>
                    <p className="text-muted-foreground">Create a new school account</p>
                </div>

                {/* Register Card */}
                <Card className="border shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Admin Registration</CardTitle>
                        <CardDescription>
                            Enter your details to register your school
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Message Display */}
                        {message && (
                            <div className={cn(
                                "mb-6 p-4 rounded-lg flex items-start gap-3 text-sm",
                                messageType === "success"
                                    ? "bg-green-50 border border-green-200 text-green-700"
                                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                            )}>
                                {messageType === "success" ? (
                                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                )}
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@school.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">School Name</Label>
                                    <Input
                                        id="schoolName"
                                        name="schoolName"
                                        placeholder="e.g., Central High School"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        required
                                        className="h-10"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        This will be your school's unique identifier.
                                    </p>
                                </div>
                                <PasswordField
                                    label="Password"
                                    id="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="h-10 border-none"
                                />
                                <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
                                    {loading ? "Creating Account..." : "Register School"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <div className="p-4 text-center text-xs text-muted-foreground border-t bg-muted/30 rounded-b-lg">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </Card>
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} School Management System. All rights reserved.</p>
            </div>
        </div>
    );
};

export default AdminRegisterPage;