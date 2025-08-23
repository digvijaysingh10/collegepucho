"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HomeCity } from "@/api/@types/home-datatype";
import { CourseDTO } from "@/api/@types/course-type";
import { getColleges } from "@/api/list/getColleges";
import { getCourses } from "@/api/list/getCourses";
import { getCities } from "@/api/list/getCities";
import { toast } from "sonner";
import LeadForm from "../forms/LeadForm";
import { CollegeDTO } from "@/api/@types/college-list";
import Link from "next/link";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

type LeadModalProps = {
  headerTitle?: React.ReactNode | string;
  triggerText?: React.ReactNode | string;
  btnTxt?: string;
  btnColor?: string;
  btnWidth?: string;
  btnMinWidth?: string;
  btnPadding?: string;
  btnHeight?: string;
  btnVariant?:
    | "default"
    | "link"
    | "ghost"
    | "destructive"
    | "outline"
    | "secondary"
    | null;
  brochureUrl?: string;
};

const defaultHeader = (
  <div className="flex flex-col md:gap-4">
    <div className="flex items-center gap-2 md:gap-4">
      <Link
        href="/"
        prefetch
        className="bg-[#141A21] text-white p-4 rounded-full font-bold "
      >
        True<span className="text-primary-main">Scholar</span>
      </Link>
      <div className="text-sm md:text-lg font-medium  leading-6 flex flex-col md:flex-row gap-2 items-center">
        <p>Tell us about your preferences</p>
        <p className="text-primary-main"> — we’ll guide you!</p>
      </div>
    </div>
  </div>
);

const LeadModal: React.FC<LeadModalProps> = ({
  headerTitle,
  triggerText = "Get Started",
  btnTxt,
  btnColor,
  btnWidth,
  btnMinWidth,
  btnPadding,
  btnHeight = "h-10",
  btnVariant = "default",
  brochureUrl,
}) => {
  const [clgData, setClgData] = useState<CollegeDTO[]>([]);
  const [courseData, setCourseData] = useState<CourseDTO[]>([]);
  const [cityData, setCityData] = useState<HomeCity[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const submitted = getCookie("leadFormSubmitted");
    if (submitted) {
      setIsFormSubmitted(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [colleges, courses, cities] = await Promise.all([
        getColleges({ limit: 500, page: 1 }),
        getCourses(),
        getCities(),
      ]);
      setClgData((colleges?.colleges as CollegeDTO[]) || []);
      setCourseData(courses?.courses || []);
      setCityData(cities || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Submission Error", {
        description: "There was a problem loading the form data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !getCookie("leadFormSubmitted")) {
      fetchData();
    }
  }, [fetchData, isOpen]);

  const handleFormSubmitSuccess = useCallback((formData: any) => {
    setIsFormSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!getCookie("leadFormSubmitted")) {
      setIsOpen(open);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={btnVariant}
          style={{
            backgroundColor: btnColor,
            color: btnTxt,
            width: btnWidth,
            minWidth: btnMinWidth,
            padding: btnPadding,
          }}
          className={`w-full md:w-auto ${btnHeight} px-4 rounded-xl`}
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[95vh] max-w-screen-md overflow-hidden md:p-0 rounded-2xl"
        aria-label="Lead Generation Form"
      >
        <div className="p-0 md:p-6">
          <DialogHeader>
            <DialogTitle>{headerTitle || defaultHeader}</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="animate-pulse rounded-2xl h-[60vh]"></div>
          ) : isFormSubmitted ? (
            <div className="py-10 text-center">
              <p className="text-green-600 font-semibold text-lg">
                Thank you! Your request has been submitted.
              </p>
              <p className="text-gray-600 mt-2">
                Our team will contact you soon.
              </p>
            </div>
          ) : (
            <LeadForm
              collegeData={clgData}
              courseData={courseData}
              cityData={cityData}
              brochureUrl={brochureUrl}
              onFormSubmitSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
