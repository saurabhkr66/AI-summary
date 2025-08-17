import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { emailSchema } from '@/app/lib/validation'; // keep your validation

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { to, subject, body } = emailSchema.parse(json);

    // Use env variables for credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or "Outlook", "Yahoo" etc.
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // app password (not your real Gmail password)
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender email
      to, // recipient
      subject,
      text: body,
    });

    return NextResponse.json({ ok: true, id: info.messageId });
  } catch (err: unknown) {
    console.error('Email sending error:', err);
    return NextResponse.json(
      { error: typeof err === 'object' && err !== null && 'message' in err ? (err as { message?: string }).message : 'Bad Request' },
      { status: 400 }
    );
  }
}
