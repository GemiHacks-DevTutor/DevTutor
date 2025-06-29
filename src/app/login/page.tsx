'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";


const Login = () => {

    const { user, login } = useUser();
    const router = useRouter();

    useEffect(() => {

        if(user)
            router.replace("/dashboard");

    }, [user, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        const username = (event.target as HTMLFormElement).username.value;
        const password = (event.target as HTMLFormElement).password.value;
        
        const success = await login(username, password);
        // Navigation will happen automatically via useEffect when user state changes
        if (!success) {
            console.error('Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-100">
            <Card className="w-full max-w-lg px-8 py-10">
                <CardHeader>
                    <div className="flex flex-col items-center space-y-4">
                        <Image 
                            src="/logo.png" 
                            alt="DevTutor Logo" 
                            width={120} 
                            height={120}
                            className="object-contain rounded-lg"
                        />
                        <CardTitle className="text-3xl text-center w-full">Login</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <form className="space-y-6 w-full flex flex-col items-center" onSubmit={handleSubmit}>
                        <div className="w-full">
                            <Label htmlFor="username" className="mb-3 block text-xl">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                required
                                className="text-2xl py-4 px-5 focus-visible:ring-2 focus-visible:ring-neutral-800"
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor="password" className="mb-3 block text-xl">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                required
                                className="text-2xl py-4 px-5 focus-visible:ring-2 focus-visible:ring-neutral-800"
                            />
                        </div>
                        <Button type="submit" className="w-full text-xl py-4">Login</Button>
                    </form>
                    <div className="mt-6 text-center text-lg">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-neutral-800 hover:underline text-lg">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
