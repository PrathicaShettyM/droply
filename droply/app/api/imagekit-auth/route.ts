import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { createPrivateKey } from "crypto";
import { auth } from "@clerk/nextjs/server";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});

export async function GET(){

    try {
        const {userId} = await auth();

        // for security purpose evn though we have a middleware
        if(!userId){
            // means the user is not logged in
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }

        const authParams = imagekit.getAuthenticationParameters();
        return NextResponse.json(authParams);
    } catch (error: any) {
        return NextResponse.json({error: "Failed to generate authentication parameters for imagekit"}, {status: 500});
    }

}