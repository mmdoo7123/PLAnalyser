export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold">Welcome to AI Finance Tool</h1>
            <p className="mt-2">
                Please <a href="/login" className="text-blue-500">log in</a> to continue.
            </p>
        </div>
    );
}
