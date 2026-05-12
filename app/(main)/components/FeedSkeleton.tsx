"use client";

export default function FeedSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full max-w-[470px] mx-auto mt-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-full pb-5 border-b border-[#262626]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#262626] animate-pulse"></div>
                        <div className="w-24 h-4 bg-[#262626] rounded animate-pulse"></div>
                    </div>
                    <div className="w-full aspect-[4/5] bg-[#262626] rounded-[4px] animate-pulse mb-3"></div>
                    <div className="flex gap-4">
                        <div className="w-6 h-6 bg-[#262626] rounded-full animate-pulse"></div>
                        <div className="w-6 h-6 bg-[#262626] rounded-full animate-pulse"></div>
                        <div className="w-6 h-6 bg-[#262626] rounded-full animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
