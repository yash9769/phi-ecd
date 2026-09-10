import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, visitorId, consentGiven, deviceType, browser, os, screenWidth, screenHeight, viewportWidth, viewportHeight, referrer, utmSource, utmMedium, utmCampaign, landingPage } = body;

    const session = await db.createSession({
      id: sessionId,
      visitor_id: visitorId,
      consent_given: !!consentGiven,
      device_type: deviceType,
      browser,
      os,
      screen_width: screenWidth,
      screen_height: screenHeight,
      viewport_width: viewportWidth,
      viewport_height: viewportHeight,
      referrer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      landing_page: landingPage || '/',
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
