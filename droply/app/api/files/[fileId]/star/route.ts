import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    props: {params: Promise<{fileId: string}>}
){
    try {
        // 1. authenticate user
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json(
                {error: "Unauthorised"}, 
                {status: 401});
        } 

        // 2. grab file id
        const {fileId} = await props.params; // fileId => shd be same this cuurent folder name
        if(!fileId){
            return NextResponse.json(
                {error: "File ID is required"}, 
                {status: 401});
        } 

        // 3. grab the file
        const [file] = await db
                                .select()
                                .from(files)
                                .where(
                                    and(
                                        eq(files.id, fileId),
                                        eq(files.userId, userId)                                 
                                    )
                                )
        
        if(!file){
            return NextResponse.json(
                {error: "File not found"}, 
                {status: 401});
        }                         

        // 4. Toggle the star status
        const updatedFiles = await db.update(files)
            .set({isStarred: !file.isStarred})
            .where(
                and(
                    eq(files.id, fileId),   
                    eq(files.userId, userId)
                )
            )
            .returning();
        
        console.log(updatedFiles);
        
        const updatedFile = updatedFiles[0];
        return NextResponse.json(updatedFile);

    } catch (error) {
            return NextResponse.json(
                {error: "Failed to update the file"}, 
                {status: 500});
    }
}