import { clerkMiddleware, createRouteMatcher, auth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// create public and private routes
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, request) => {
    const user = auth()
    const userId = (await user).userId
    const url = new URL(request.url)

    if(userId && isPublicRoute(request) && url.pathname !== "/"){
        // if the user is logged in then redirect him to dashboard(we dont want him to again access signin or signup page)
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // protect the private routes
    if(!isPublicRoute(request)){
        await auth.protect()
    }
});
