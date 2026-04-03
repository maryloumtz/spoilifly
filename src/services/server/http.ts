import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(error: string, status = 400, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ error, fieldErrors }, { status });
}
