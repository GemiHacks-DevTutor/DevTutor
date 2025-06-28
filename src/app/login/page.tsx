'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";


const Login = () => {

    const { user, login } = useUser();
    const router = useRouter();

    useEffect(() => {

        if(user)
            router.replace("/");

    }, [user, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        const username = (event.target as HTMLFormElement).username.value;
        const password = (event.target as HTMLFormElement).password.value;
        
        login(username, password);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-100">
            <Card className="w-full max-w-lg px-8 py-10">
                <CardHeader>
                    <CardTitle className="text-3xl text-center w-full">Login</CardTitle>
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
