import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '../lib/utils';

export default function AiChatbot() {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your SMS Assistant. How can I help you today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const schoolId = currentUser?.school?._id || currentUser?._id;

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, loading, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        const msg = query.trim();
        if (!msg || loading) return;

        setQuery('');
        const newUserMsg = { role: 'user', content: msg };
        setMessages(prev => [...prev, newUserMsg]);
        setLoading(true);

        try {
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await axios.post(`${API_URL}/AiChat/Groq`, {
                query: msg,
                schoolId,
                history
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not get response." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Server Error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 z-[1000] bg-primary text-primary-foreground"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[550px] flex flex-col shadow-2xl z-[1000] border-border animate-in slide-in-from-bottom-5 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="bg-primary-foreground/20 p-1.5 rounded-lg">
                        <Bot className="h-5 w-5" />
                    </div>
                    SMS AI Assistant
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 hover:bg-white/20 text-primary-foreground"
                >
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
                <ScrollArea ref={scrollRef} className="h-full p-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-end gap-2 max-w-[85%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <Avatar className="h-8 w-8 border border-border shrink-0">
                                    <AvatarFallback className={cn(
                                        "text-[10px]",
                                        m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                        m.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-card text-card-foreground border border-border rounded-bl-none"
                                    )}
                                >
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 mr-auto max-w-[85%]">
                                <Avatar className="h-8 w-8 border border-border shrink-0 animate-pulse">
                                    <AvatarFallback className="bg-muted">
                                        <Bot className="h-4 w-4 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-card border border-border px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 bg-background border-t border-border">
                <form onSubmit={handleSend} className="flex w-full items-center gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !query.trim()}
                        size="icon"
                        className="h-10 w-10 shrink-0 transition-all duration-200"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

