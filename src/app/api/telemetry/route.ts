import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EventType } from '@/lib/types';

const ALLOWED_EVENTS: EventType[] = [
  'session_start',
  'session_end',
  'page_view',
  'cta_click',
  'button_click',
  'navigation',
  'form_opened',
  'form_field_focus',
  'form_field_interaction',
  'form_field_completed',
  'form_validation_error',
  'form_submission',
  'form_abandonment',
  'payment_page_opened',
  'payment_method_selected',
  'payment_flow_started',
  'payment_success',
  'payment_failure',
  'thank_you_page_reached',
  'scroll_depth',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventType, page, timestamp, metadata } = body;

    if (!sessionId || !eventType) {
      return NextResponse.json({ success: false, error: 'Session ID and Event Type required' }, { status: 400 });
    }

    if (!ALLOWED_EVENTS.includes(eventType as EventType)) {
      return NextResponse.json({ success: false, error: `Invalid telemetry event type: ${eventType}` }, { status: 400 });
    }

    // SERVER-SIDE PRIVACY GUARANTEE: Sanitization filter
    const safeMetadata = { ...metadata };
    delete safeMetadata.password;
    delete safeMetadata.creditCard;
    delete safeMetadata.cardNumber;
    delete safeMetadata.cvv;
    delete safeMetadata.upiPin;
    delete safeMetadata.otp;
    delete safeMetadata.aadhaar;
    delete safeMetadata.phone;
    delete safeMetadata.email;
    delete safeMetadata.fullName;

    const event = await db.addTelemetryEvent({
      session_id: sessionId,
      event_type: eventType,
      page: page || '/',
      timestamp: timestamp || new Date().toISOString(),
      metadata: safeMetadata,
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
