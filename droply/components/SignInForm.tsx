"use client"

import { signInSchema } from "@/schemas/signInSchema";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

import {Card, CardBody, CardHeader, Divider, AlertCircle, CardFooter} from "@heroui/react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SignInForm(){
    const router = useRouter();
    
    // destructure the clerk components
    const{signIn, isLoaded, setActive} = useSignIn();

    // handle the form submit and errors
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

        // handle passwords
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const { 
        register, 
        handleSubmit
    } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password
            })

            if(result.status === "complete"){
                // user is created 
                await setActive({session: result.createdSessionId});
                router.push("/dashboard");
            } else {
                setAuthError("Sign In error")
            }

        } catch (error: any) {
            setAuthError(
                error.errors?.[0]?.message || "An error occured during signin process"
            )
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <Card className="w-full max-w-md border border-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold">
                    Welcome Back
                </h1>
                
                <p className="text-default-500 text-center">
                    Sign In to access your secure cloud storage
                </p>
            </CardHeader>

           <Divider/>

           <CardBody className="py-6">
            {
                authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb- flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0"/>
                        <p>{authError}</p>
                    </div>
                )
            }

            <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-6">
                <div className="space-y-2">
                    <label
                        htmlFor="identifier"
                        className="text-sm font-medium text-default-900"
                    >
                        Email
                    </label>

                    <Input
                        id="identifier"
                        type="email"
                        placeholder="your.email@example.com"
                        startContent={
                            <Mail className="h-4 w-4 text-default-500"/>
                        }
                        isInvalid={!!errors.identifier}
                        errorMessage={errors.identifier?.message}
                        {...register("identifier")}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-default-900"
                        >
                            Password
                        </label>
                    </div>

                    <Input
                        id="password"
                        type={showPassword ? "text": "password"}
                        placeholder="●●●●●●●●"
                            startContent={<Lock className="h-4 w-4 text-default-500"/>}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="Light"
                                    size="sm"
                                    onClick={()=> setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500"/>
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500"/>
                                    )}
                                </Button>
                            }
                        isInvalid={!!errors.password}
                        errorMessage={errors.password?.message}
                        {...register("password")}
                        className="w-full"
                    />
                </div>

                <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                    >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
            </CardBody> 

            <Divider/>

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    Don't have an account ? { " " }
                    <Link
                    href="/sign-up"
                    className="text-primary hover: underline font-medium"
                    >
                        Sign Up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}



