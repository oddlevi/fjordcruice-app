import type { Tour } from "./tours";
import { jsPDF } from "jspdf";
import { getMixedRecommendations, type Activity } from "./tromso-activities";

// Types for trip planner
export interface PlannedTour {
  tourSlug: string;
  date: string; // ISO date string YYYY-MM-DD
  tourName: string;
  durationHours: number;
  price: number;
}

export interface TripPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  personCount: number;
  tours: PlannedTour[];
}

const STORAGE_KEY = "fjordcruice-trip-plan";

// Generate unique ID
function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// LocalStorage functions
export function saveTripPlan(plan: TripPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function loadTripPlan(): TripPlan | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TripPlan;
  } catch {
    return null;
  }
}

export function clearTripPlan(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function createEmptyPlan(): TripPlan {
  const today = new Date();
  return {
    id: generateId(),
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
    startDate: today.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    personCount: 1,
    tours: [],
  };
}

// Convert selected tours to PlannedTours
export function toursToPlannedTours(
  selectedKeys: Set<string>,
  tourMap: Map<string, Tour>
): PlannedTour[] {
  return Array.from(selectedKeys)
    .map((key) => {
      const [date, slug] = key.split(":");
      const tour = tourMap.get(slug);
      if (!tour) return null;
      return {
        tourSlug: slug,
        date,
        tourName: tour.name,
        durationHours: tour.duration_hours,
        price: tour.price_from,
      };
    })
    .filter(Boolean) as PlannedTour[];
}

// Generate ICS calendar file
export function generateICS(plan: TripPlan): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fjordcruice//Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Fjordcruice Trip",
  ];

  for (const tour of plan.tours) {
    const startDate = tour.date.replace(/-/g, "");
    const uid = `${tour.tourSlug}-${tour.date}@fjordcruice.com`;

    // Use durationHours directly
    const durationHours = tour.durationHours || 3;

    // Default start time 09:00, end based on duration
    const startTime = "090000";
    const endHour = (9 + durationHours).toString().padStart(2, "0");
    const endTime = `${endHour}0000`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${startDate}T${startTime}`,
      `DTEND:${startDate}T${endTime}`,
      `SUMMARY:${escapeICS(tour.tourName)}`,
      `DESCRIPTION:Fjord cruise - ${durationHours} hours - ${tour.price} NOK per person`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Download ICS file
export function downloadICS(plan: TripPlan): void {
  const ics = generateICS(plan);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fjordcruice-trip-${plan.startDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate shareable URL with plan encoded
export function generateShareableUrl(plan: TripPlan): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const planData = {
    s: plan.startDate,
    p: plan.personCount,
    t: plan.tours.map((t) => `${t.date}:${t.tourSlug}`),
  };
  const encoded = btoa(JSON.stringify(planData));
  return `${baseUrl}/calendar?plan=${encoded}`;
}

// Parse shareable URL
export function parseShareableUrl(encoded: string): Partial<TripPlan> | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    return {
      startDate: decoded.s,
      personCount: decoded.p,
      tours: decoded.t.map((item: string) => {
        const [date, slug] = item.split(":");
        return { tourSlug: slug, date, tourName: "", duration: "", price: 0 };
      }),
    };
  } catch {
    return null;
  }
}

// Calculate trip statistics
export function calculateTripStats(plan: TripPlan) {
  const totalPrice = plan.tours.reduce((sum, t) => sum + t.price, 0);
  const totalPriceWithPersons = totalPrice * plan.personCount;
  const uniqueDates = new Set(plan.tours.map((t) => t.date));
  const numberOfDays = uniqueDates.size;

  return {
    tourCount: plan.tours.length,
    numberOfDays,
    totalPrice,
    totalPriceWithPersons,
    pricePerPerson: totalPrice,
  };
}

// Parse date string (YYYY-MM-DD) as local date, not UTC
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Helper to draw rounded rectangle
function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: "F" | "S" | "FD" = "F"
) {
  doc.roundedRect(x, y, width, height, radius, radius, style);
}

// Helper to get activity type label (no emojis for PDF)
function getActivityTypeLabel(type: Activity["type"]): string {
  const labels: Record<string, string> = {
    cafe: "[Cafe]",
    museum: "[Museum]",
    attraction: "[Attraction]",
    walk: "[Walk]",
    shopping: "[Shopping]",
    viewpoint: "[View]",
    indoor: "[Indoor]",
  };
  return labels[type] || "";
}

// Helper to add activity recommendation box
function addActivityBox(
  doc: jsPDF,
  activity: Activity,
  x: number,
  y: number,
  width: number
): number {
  const hasTip = activity.tip && activity.tip.length > 0;
  const boxHeight = hasTip ? 28 : 20;

  // Activity box background
  doc.setFillColor(255, 251, 235); // Amber-50
  drawRoundedRect(doc, x, y, width, boxHeight, 3, "F");

  // Border
  doc.setDrawColor(251, 191, 36); // Amber-400
  doc.setLineWidth(0.5);
  drawRoundedRect(doc, x, y, width, boxHeight, 3, "S");

  // Type label
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.setFont("helvetica", "normal");
  doc.text(getActivityTypeLabel(activity.type), x + 4, y + 6);

  // Activity name
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15); // Amber-900
  doc.setFont("helvetica", "bold");
  doc.text(activity.name, x + 4, y + 12);

  // Duration and location
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.text(`${activity.durationMinutes} min - ${activity.location}`, x + 4, y + 17);

  // Tip if available
  if (hasTip) {
    doc.setFontSize(6);
    doc.setTextColor(161, 98, 7);
    doc.setFont("helvetica", "italic");
    const tipText = doc.splitTextToSize(`Tip: ${activity.tip}`, width - 8);
    doc.text(tipText[0], x + 4, y + 23);
  }

  return boxHeight + 4;
}

// Generate and download PDF
export function downloadPDF(plan: TripPlan, tourDetails: Map<string, Tour>): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ============ COVER PAGE ============

  // Gradient-like header (using rectangles)
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 100, "F");

  doc.setFillColor(30, 58, 138); // Blue-900
  doc.rect(0, 70, pageWidth, 30, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("NORWEGIAN", margin, 35);
  doc.setFontSize(28);
  doc.text("FJORDCRUICE", margin, 50);

  // Decorative line
  doc.setDrawColor(59, 130, 246); // Blue-500
  doc.setLineWidth(2);
  doc.line(margin, 58, margin + 80, 58);

  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Your Personal Trip Itinerary", margin, 75);

  // Trip summary card
  y = 115;
  doc.setFillColor(255, 255, 255);
  drawRoundedRect(doc, margin, y, contentWidth, 45, 5, "F");

  // Add shadow effect with border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  drawRoundedRect(doc, margin, y, contentWidth, 45, 5, "S");

  const stats = calculateTripStats(plan);

  // Stats inside card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const col1 = margin + 10;
  const col2 = margin + contentWidth / 3;
  const col3 = margin + (contentWidth / 3) * 2;

  doc.text("TRAVELERS", col1, y + 12);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(`${plan.personCount}`, col1, y + 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text("TOURS", col2, y + 12);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(`${stats.tourCount}`, col2, y + 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text("TOTAL", col3, y + 12);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(`${stats.totalPriceWithPersons.toLocaleString()} NOK`, col3, y + 28);

  // Date range
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${formatDate(plan.startDate)}${plan.startDate !== plan.endDate ? ` – ${formatDate(plan.endDate)}` : ""}`,
    margin + 10,
    y + 40
  );

  // ============ ITINERARY PAGES ============
  doc.addPage();
  y = 20;

  // Page header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Your Itinerary", margin, 16);

  y = 35;

  // Sort and group tours by date
  const sortedTours = [...plan.tours].sort((a, b) => a.date.localeCompare(b.date));
  const toursByDate = new Map<string, PlannedTour[]>();
  for (const tour of sortedTours) {
    const existing = toursByDate.get(tour.date) || [];
    existing.push(tour);
    toursByDate.set(tour.date, existing);
  }

  let dayNumber = 1;
  for (const [date, tours] of toursByDate) {
    // Check if we need a new page
    if (y > pageHeight - 80) {
      doc.addPage();
      // Page header
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Your Itinerary (continued)", margin, 16);
      y = 35;
    }

    // Day header
    doc.setFillColor(241, 245, 249);
    drawRoundedRect(doc, margin, y, contentWidth, 14, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(`Day ${dayNumber}`, margin + 5, y + 9);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(formatDate(date), margin + 30, y + 9);

    y += 20;
    dayNumber++;

    // Tours for this day
    for (let i = 0; i < tours.length; i++) {
      const tour = tours[i];
      const fullTour = tourDetails.get(tour.tourSlug);

      // Check if we need a new page
      if (y > pageHeight - 60) {
        doc.addPage();
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, pageWidth, 25, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Your Itinerary (continued)", margin, 16);
        y = 35;
      }

      // Tour card
      doc.setFillColor(255, 255, 255);
      const cardHeight = fullTour?.description ? 55 : 40;
      drawRoundedRect(doc, margin, y, contentWidth, cardHeight, 4, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      drawRoundedRect(doc, margin, y, contentWidth, cardHeight, 4, "S");

      // Time indicator
      doc.setFillColor(30, 64, 175);
      drawRoundedRect(doc, margin, y, 4, cardHeight, 2, "F");

      // Tour name
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(tour.tourName, margin + 10, y + 12);

      // Duration and price badges
      doc.setFillColor(219, 234, 254); // Blue-100
      drawRoundedRect(doc, margin + 10, y + 17, 40, 8, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(30, 64, 175);
      doc.text(`${tour.durationHours}h duration`, margin + 12, y + 22);

      doc.setFillColor(220, 252, 231); // Green-100
      drawRoundedRect(doc, margin + 55, y + 17, 45, 8, 2, "F");
      doc.setTextColor(22, 101, 52); // Green-800
      doc.text(`${tour.price} NOK/pers`, margin + 57, y + 22);

      // Description
      if (fullTour?.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(fullTour.description, contentWidth - 20);
        const maxLines = Math.min(descLines.length, 2);
        for (let j = 0; j < maxLines; j++) {
          doc.text(descLines[j], margin + 10, y + 32 + j * 5);
        }

        // Highlights as inline text
        if (fullTour?.highlights && fullTour.highlights.length > 0) {
          doc.setFontSize(8);
          doc.setTextColor(30, 64, 175);
          doc.setFont("helvetica", "italic");
          const highlightText = `Highlights: ${fullTour.highlights.slice(0, 3).join(" | ")}`;
          const truncated = highlightText.length > 85 ? highlightText.substring(0, 82) + "..." : highlightText;
          doc.text(truncated, margin + 10, y + 48);
          doc.setFont("helvetica", "normal");
        }
      }

      y += cardHeight + 6;

      // Add activity recommendations between tours (if there's a next tour)
      if (i < tours.length - 1) {
        // Estimate ~2 hours between tours
        const recommendations = getMixedRecommendations(120, 2);
        if (recommendations.length > 0 && y < pageHeight - 50) {
          // "Between tours" label with decorative line
          doc.setDrawColor(251, 191, 36); // Amber-400
          doc.setLineWidth(0.3);
          doc.line(margin, y + 2, margin + 15, y + 2);

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(161, 98, 7); // Amber-700
          doc.text("BETWEEN TOURS - Things to do:", margin + 18, y + 3);

          doc.line(margin + 95, y + 2, margin + contentWidth, y + 2);
          y += 10;

          // Show 2 recommendations side by side
          const boxWidth = (contentWidth - 6) / 2;
          for (let r = 0; r < Math.min(2, recommendations.length); r++) {
            const xPos = margin + (r * (boxWidth + 6));
            addActivityBox(doc, recommendations[r], xPos, y, boxWidth);
          }
          y += 34;
        }
      }
    }

    // Add activity recommendations at end of day
    const recommendations = getMixedRecommendations(180, 3);
    if (recommendations.length > 0 && y < pageHeight - 60) {
      // Section header
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 5, margin + 10, y + 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(161, 98, 7);
      doc.text("MORE TO EXPLORE IN TROMSO", margin + 13, y + 6);

      doc.line(margin + 78, y + 5, margin + contentWidth, y + 5);
      y += 14;

      for (const rec of recommendations.slice(0, 2)) {
        if (y > pageHeight - 45) break;
        y += addActivityBox(doc, rec, margin, y, contentWidth);
      }
    }

    y += 10;
  }

  // ============ SUMMARY PAGE ============
  doc.addPage();

  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Trip Summary", margin, 25);

  y = 55;

  // Summary box
  doc.setFillColor(248, 250, 252);
  drawRoundedRect(doc, margin, y, contentWidth, 60, 5, "F");

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");

  const summaryItems = [
    { label: "Number of tours", value: `${stats.tourCount}` },
    { label: "Number of days", value: `${stats.numberOfDays}` },
    { label: "Travelers", value: `${plan.personCount}` },
    { label: "Price per person", value: `${stats.pricePerPerson.toLocaleString()} NOK` },
  ];

  let summaryY = y + 15;
  for (const item of summaryItems) {
    doc.setFont("helvetica", "normal");
    doc.text(item.label, margin + 10, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, margin + contentWidth - 10, summaryY, { align: "right" });
    summaryY += 12;
  }

  // Total box
  y += 70;
  doc.setFillColor(30, 64, 175);
  drawRoundedRect(doc, margin, y, contentWidth, 30, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount", margin + 10, y + 13);

  doc.setFontSize(20);
  doc.text(`${stats.totalPriceWithPersons.toLocaleString()} NOK`, margin + contentWidth - 10, y + 20, {
    align: "right",
  });

  // Booking info
  y += 45;
  doc.setFillColor(240, 253, 244); // Green-50
  drawRoundedRect(doc, margin, y, contentWidth, 40, 5, "F");
  doc.setDrawColor(34, 197, 94); // Green-500
  doc.setLineWidth(0.5);
  drawRoundedRect(doc, margin, y, contentWidth, 40, 5, "S");

  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52); // Green-800
  doc.setFont("helvetica", "bold");
  doc.text("HOW TO BOOK", margin + 10, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61); // Green-700
  doc.text("1. Visit fjordcruice-app.vercel.app to book your tours online", margin + 10, y + 22);
  doc.text("2. Or contact us directly for group bookings and special requests", margin + 10, y + 30);
  doc.text("3. Remember to bring warm clothes and your camera!", margin + 10, y + 38);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Norwegian Fjordcruice • fjordcruice-app.vercel.app • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Download
  doc.save(`fjordcruice-trip-${plan.startDate}.pdf`);
}
