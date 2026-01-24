
export function Footer() {
    return (
        <footer className="border-t py-6 md:py-8 bg-background/50 backdrop-blur-sm">
            <div className="container px-4 md:px-6 flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Built for students, by students who understand.
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Not a replacement for professional therapy. If you are in crisis, please seek professional help.
                </p>
            </div>
        </footer>
    );
}
