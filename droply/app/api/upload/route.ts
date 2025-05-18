import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { request } from "http";
import { NextRequest, NextResponse } from "next/server";

export async function POST(params:NextRequest) {
    try {
        const {userId} = await auth();
        // for security purpose evn though we have a middleware
        if(!userId){
        // means the user is not logged in
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }

        // parse request body
        const body = await request.json()
        const {imagekit, userId: bodyUserId} = body

        if(bodyUserId !== userId){
            return NextResponse.json({error: "Unauthorised"}, {status: 401})
        }

        if(!imagekit || !imagekit.url){
            return NextResponse.json({error: "Invalid file upload data"}, {status: 401})
        }

        const fileData = {
            name: imagekit.name || "Untitled",
            path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
            size: imagekit.size || 0,
            type: imagekit.fileType || "image",
            fileUrl: imagekit.url,
            thumbnailUrl: imagekit.thumbnailUrl || null,
            userId: userId,
            parentId: null, // set to root level by default 
            isFolder: false,
            isStarred: false,
            isTrash: false
        }

        const [newFile] = await db.insert(files).values(fileData).returning;
        return NextResponse.json(newFile);

    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Failed to save info to database",
            },
            {status: 500}
        );
    }

} 