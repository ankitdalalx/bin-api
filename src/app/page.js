export const runtime = 'edge';
import { NextResponse } from "next/server";

// Load and parse the CSV file
async function loadBins() {
  try {
    // Fetch the CSV file from the public folder
    const res = await fetch('https://bin-api.pages.dev/bins.csv');
    if (!res.ok) throw new Error("Failed to load bins.csv");

    const text = await res.text(); // Get CSV data as text
    const bins = {};

    // Parse CSV file line by line
    text.split("\n").forEach((line) => {
      const arr = line
        .trim()
        .split(",")
        .map((x) => decodeURIComponent(x.trim()));

      const bin = {
        bin: arr[0],
        card_brand: arr[1],
        card_type: arr[2],
        card_level: arr[3],
        bank_name: arr[4],
        bank_website: arr[5],
        bank_phone: arr[6],
        country_name: arr[7],
        country_code: arr[8],
        country_iso3: arr[9],
        currency: arr[10],
      };
      bins[bin.bin] = bin;
    });

    return bins;
  } catch (error) {
    console.error("Error loading bins:", error);
    throw error;
  }
}

// API handler function
export async function GET(req) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const binParam = searchParams.get("bin"); // Get 'bin' parameter

    // Validate the bin parameter
    if (!binParam || binParam.length < 6) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing BIN parameter." },
        { status: 400 }
      );
    }

    // Load BIN data from the CSV
    const bins = await loadBins();

    // Search for the BIN
    const binKey = binParam.substring(0, 6);
    const binData = bins[binKey];

    // Return result
    if (binData) {
      return NextResponse.json({ success: true, data: binData });
    } else {
      return NextResponse.json(
        { success: false, error: "BIN not found." },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}