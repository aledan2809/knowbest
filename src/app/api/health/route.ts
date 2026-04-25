import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "unknown",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = "connected";
  } catch {
    status.database = "disconnected";
    status.status = "degraded";
    return NextResponse.json(status, { status: 503 });
  }

  return NextResponse.json(status);
}
