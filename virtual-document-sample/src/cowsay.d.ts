declare module 'cowsay' {

    export interface CowsayOptions {
        text: string;
        cow?: string;
        eyes?: string;
        tongue?: string;
        wrap?: boolean;
        wrapLength?: number;
        mode?: 'b' | 'd' | 'g' | 'p' | 's' | 't' | 'w' | 'y'
    }

    export function say(options: CowsayOptions): string;
}
