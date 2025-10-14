import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";

interface FacultyReport {
  studentName: string;
  studentNumber: string;
  email: string;
  faculty: string;
  department: string;
  qualification: string;
  yearOfStudy: string;
  placesVisited: string;
  academicExposure: string;
  purpose: string;
  outcomes: string;
  impact: string;
  plannedActivity: string;
  involvement: string;
  researchOpportunities: string;
  additionalInfo: string;
}

export default function FacultyReportView({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<FacultyReport | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const docRef = doc(db, "facultyReports", reportId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setReport(docSnap.data() as FacultyReport);
      }
    };
    fetchReport();
  }, [reportId]);

  if (!report) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
      <Card className="w-full max-w-5xl shadow-2xl rounded-2xl bg-white/95 backdrop-blur">
        <div className="min-h-screen bg-white flex flex-col items-center py-8 px-2">
          {/* Header with logo */}
          <div className="flex flex-col items-center mb-4">
            <img
              src="/asserts/DUTENVLOGO1.png"
              alt="DUT Logo"
              width={120}
              className="mb-2"
            />
            <h2 className="text-xl font-bold text-center mb-2">
              Student Report from National and International Visits
            </h2>
          </div>
          {/* Table */}
          <div className="w-full max-w-4xl border border-gray-400">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-400 font-semibold w-1/3 p-2">Student Name:</td>
                  <td className="border border-gray-400 p-2">{report.studentName}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Student number:</td>
                  <td className="border border-gray-400 p-2">{report.studentNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Email address:</td>
                  <td className="border border-gray-400 p-2">{report.email}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Faculty:</td>
                  <td className="border border-gray-400 p-2">{report.faculty}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Department:</td>
                  <td className="border border-gray-400 p-2">{report.department}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Qualification & Year of Study:</td>
                  <td className="border border-gray-400 p-2">
                    {report.qualification} {report.yearOfStudy && `- Year ${report.yearOfStudy}`}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    Places and Country visited (include dates travelled):
                  </td>
                  <td className="border border-gray-400 p-2">{report.placesVisited}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    Any previous academic international exposure (Y/N) and Details:
                  </td>
                  <td className="border border-gray-400 p-2">{report.academicExposure}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">Purpose of this visit:</td>
                  <td className="border border-gray-400 p-2">{report.purpose}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    State the different outcomes / key take-aways that did you gain from this visit / engagement:
                  </td>
                  <td className="border border-gray-400 p-2">{report.outcomes}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    What impact will this visit have on your engagement with your peer students:
                  </td>
                  <td className="border border-gray-400 p-2">{report.impact}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    What activity do you as individual or team plan on hosting for peers:
                  </td>
                  <td className="border border-gray-400 p-2">{report.plannedActivity}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    Did the visit involve any other staff / students besides yourself:
                  </td>
                  <td className="border border-gray-400 p-2">{report.involvement}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    Did you find any possible research opportunities (paper / thesis / external supervisor):
                  </td>
                  <td className="border border-gray-400 p-2">{report.researchOpportunities}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2">
                    Any additional Information or contacts to share:
                  </td>
                  <td className="border border-gray-400 p-2">{report.additionalInfo}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 font-semibold p-2" colSpan={2}>
                    <div className="font-semibold">
                      Kindly attach the following to your full report and share with the Faculty Engagement Officer within 5 days of returning:
                    </div>
                    <ul className="list-disc ml-6 text-xs mt-2">
                      <li>Invitation letter for the engagement</li>
                      <li>Any Supporting documents to support the report</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>

  );
}