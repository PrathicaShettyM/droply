"use client"
import type {ThemeProviderProps} from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
"next-themes";
import {ImageKitProvider} from "imagekitio-next";
import {HeroUIProvider} from "@heroui/react";

export interface ProviderProps{
    children: React.ReactNode,
    themeProps ?: ThemeProviderProps
}

const authenticator = async () => {
    try{
        const response = await fetch("/api/imagekit-auth");
        const data = await response.json();
        return data;
    } catch(error) {
        console.log("Authentication error: ", error);
        throw error;
    }
};


export function Providers({children, themeProps}: ProviderProps){
    return(
        <ImageKitProvider 
            authenticator={authenticator}
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
        >
            <HeroUIProvider>
                {children}
            </HeroUIProvider>
        </ImageKitProvider>  
    )
}

// We can wrap as many providers we have by nesting it
// <provider1(like Toast etc)>
//     <provider2>
//         <provider3>
//             . 
//             . 
//             . 
//         </provider3>
//     </provider2>
// </provider1>
