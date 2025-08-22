"use client";
import React, { useState, useEffect, useMemo } from "react";
import { HomeStream } from "@/api/@types/home-datatype";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatName } from "@/components/utils/utils";

import { StreamFilter } from "@/components/filters/StreamFilter";
import { ArrowRightIcon } from "lucide-react";

const HomeCollegeCard = dynamic(
  () => import("@/components/cards/HomeCollegeCard"),
  {
    ssr: false,
    loading: () => <SkeletonLoader />,
  }
);

const SkeletonLoader = () => (
  <div className="bg-gray-300 h-72 rounded-2xl animate-pulse" />
);

const TopColleges: React.FC<{ data: HomeStream[] }> = ({ data }) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [filteredColleges, setFilteredColleges] = useState<
    HomeStream["colleges"]
  >([]);

  const availableStreams = useMemo(() => {
    return data.filter((stream) => stream?.colleges?.length > 0);
  }, [data]);

  const currentStream = useMemo(() => {
    return selectedStreamId
      ? data.find((stream) => stream.stream_id.toString() === selectedStreamId)
      : availableStreams[0];
  }, [data, selectedStreamId, availableStreams]);

  useEffect(() => {
    const stream = currentStream || availableStreams[0];
    if (stream) {
      setSelectedStreamId(stream.stream_id.toString());
      setFilteredColleges(stream.colleges.slice(0, 6));
    }
  }, [currentStream, availableStreams]);

  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-body pb-6 md:pb-12 bg-gray-2">
      <div className="flex justify-between items-center pt-6">
        <h2 className="font-extrabold lg:text-6xl text-gray-9">Top Colleges</h2>
        <Link
          href={
            currentStream?.stream_name !== "All Streams"
              ? `/college/${formatName(
                  currentStream?.stream_name ?? ""
                )}-colleges`
              : "/colleges"
          }
          className="text-primary-main flex items-center gap-2"
        >
          View All <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      <StreamFilter
        streams={availableStreams.map((stream) => ({
          stream_id: stream.stream_id.toString(),
          stream_name: stream.stream_name,
        }))}
        onStreamSelect={setSelectedStreamId}
        currentFilter={selectedStreamId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div key={college.college_id}>
            <HomeCollegeCard college={college} isLoading={!college} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopColleges;
