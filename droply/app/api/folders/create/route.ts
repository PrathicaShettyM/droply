import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuidv4} from "uuid";


export async function POST(request: NextRequest){
    try {
        // 1. check if the user is logged in
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json({error: "Unauthorised"}, {status: 401}); 
        } 
        
        // 2. grab the folder name, userId, parentId from request body
        const body = await request.json();
        const {name, userId: bodyUserId, parentId = null} = body 

        // 3. match the userid with the id u have got
        if(bodyUserId !== userId){
            return NextResponse.json(
                {error: "Unauthorised"},
                {status: 401}
            )
        }

        // 4. check for the foldername existance
        if(!name || typeof name !== "string" || name.trim() === ""){
            return NextResponse.json(
                {error: "Folder name is required"},
                {status: 400}
            )
        }

        // 5. chech if parentId exits(if not then its the the root folder)
        if(parentId){
            // write the sql query to match parentid, belong to user, be a folder
            const [parentFolder] = await db
                    .select()
                    .from(files)
                    .where(
                        and(
                           eq(files.id, parentId),
                           eq(files.userId, userId),
                           eq(files.isFolder, true) 
                        )
                    )
            
            // incase the parent folder is not there, throw error
            if(!parentFolder){
                return NextResponse.json(
                    {error: "Parent folder not found"},
                    {status: 400}
                )
            }
        }

        // if parent exits, then create a folder in DB
        const folderData = {
            id: uuidv4(),
            name: name.trim(),
            path: `/folder/${userId}/${uuidv4}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId,
            parentId,
            isFolder: true,
            isStarred: false,
            isTrash: false,
            
        } 

        const newFolder = await db.insert(files).values(folderData).returning;
        
        return NextResponse.json({
            success: true,
            message: "Folder created successfully",
            folder: newFolder
        })
        
    } catch (error) {
        
    }
}