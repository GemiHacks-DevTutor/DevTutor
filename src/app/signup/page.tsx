'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import Image from "next/image";

const Signup = () => {

    const { user, signup } = useUser();
    const router = useRouter();

    useEffect(() => {

        if(user)
            router.replace("/dashboard");

    }, [user, router]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const firstName = (event.target as HTMLFormElement).firstName.value;
        const lastName = (event.target as HTMLFormElement).lastName.value;
        const username = (event.target as HTMLFormElement).username.value;
        const password = (event.target as HTMLFormElement).password.value;

        signup(username, password, firstName, lastName)
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
                        <CardTitle className="text-3xl text-center w-full">Sign Up</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <form className="space-y-6 w-full flex flex-col items-center" onSubmit={handleSubmit}>
                        <div className="w-full">
                            <Label htmlFor="firstName" className="mb-3 block text-xl">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                required
                                className="text-2xl py-4 px-5 focus-visible:ring-2 focus-visible:ring-neutral-800"
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor="lastName" className="mb-3 block text-xl">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                required
                                className="text-2xl py-4 px-5 focus-visible:ring-2 focus-visible:ring-neutral-800"
                            />
                        </div>
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
                        <Button type="submit" className="w-full text-xl py-4">Sign Up</Button>
                    </form>
                    <div className="mt-6 text-center text-lg">
                        Already have an account?{" "}
                        <Link href="/login" className="text-neutral-800 hover:underline text-lg">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;
