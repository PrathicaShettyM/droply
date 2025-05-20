import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// initialise imagekit credentidals
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(request: NextRequest){
    try {
        // 1. authenticate user
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json({error: "Unauthorised"}, {status: 401});
        } 

        // 2. parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File; 
        const formUserId = formData.get("userId") as string;  
        const parentId = formData.get("parentId") as string || null;

        // 3. match it with userid
        if(formUserId !== userId){
            return NextResponse.json(
                {error: "Unauthorised"},
                {status: 401}
            )
        }

        // 4. If file exits then validate it
        if(!file){
            return NextResponse.json(
                {error: "No file provided"},
                {status: 401}
            )
        }
        
        // 5. Check if parentid exists
        // 5.1 "yes" part
        // 5.1.1 ensure parentId exists
        // 5.1.2 ensure it belong to user
        // 5.1.3 it shd be a folder
        // query this to the db
        if(parentId){
            const[parentFolder] = await db
                    .select()
                    .from(files)
                    .where(
                        and(
                            eq(files.id, parentId),
                            eq(files.userId, userId),
                            eq(files.isFolder, true)
                        )
                    )
        } else { // if(!parentId) // If parentId doesnt exist    5.2 "no" part
           return NextResponse.json(
                {error: "Parent folder not found"},
                {status: 401}
            ) 
        }

        // 6. restrict user to upload only images and pdfs
        if(!file.type.startsWith("image/") && file.type !== "application/pdf"){
            // if its not a valid file format to be uploaded throw exception
            return NextResponse.json(
                {status: "Only images and pdf are supported"},
                {status: 401}
            );
        }

        // 7. Since we are handling files, we need to convert it into buffer
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        // handle naming in root directory or subfolder
        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}`:`/droply/${userId}`;

        // 8. upload file to imagekit
        const originalFilename = file.name;
        const fileExtension = originalFilename.split(".").pop() || "";

        // validate extensions
        // 8.1 check for empty validation
        // 8.2 validation for not storing other files formats like exe, php
        const uniqueFilename = `${uuidv4()}.${fileExtension}`

        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFilename,
            folder: folderPath,
            useUniqueFileName: false
        })

        // 9. generate the file name
        const fileData = {
            name: originalFilename,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId: userId,
            parentId: parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false
        }   
        
        const [newFile] = await db
                            .insert(files)
                            .values(fileData).returning();
        
        return NextResponse.json(newFile);

    } catch (error) {
        return NextResponse.json(
            {error: "Failed to upload file"},
            {status: 401}
        );
    }
}


