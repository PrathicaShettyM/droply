import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    try {
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json(
                { error: "Unauthorised" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams;
        const queryUserId = searchParams.get("userId");
        const parentId = searchParams.get("parentId");

        if(!queryUserId || queryUserId !== userId){
            return NextResponse.json(
                { error: "Unauthorised" },
                { status: 401 }
            ) 
        }

        // fecth files from the database
        let userFiles;
        if(parentId){
            // fecthing from a specific folder
            userFiles = await db
                        .select()
                        .from(files)
                        .where(
                            and(
                                eq(files.userId , userId),
                                eq(files.parentId, parentId)
                            )
                        )
        } else {
            // fetching from the root directory(so we cehck isNull condition)
            userFiles = await db
                    .select()
                    .from(files)
                    .where(
                        and(
                            eq(files.userId, userId),
                            isNull(files.parentId)
                        )
                    )
        }

        return NextResponse.json(userFiles);
    } catch (error) {
        return NextResponse.json(
            {error: "Error fetching files"},
            {status: 500}
        )
    }
}