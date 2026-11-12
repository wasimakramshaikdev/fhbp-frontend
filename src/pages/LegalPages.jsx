import React from 'react';
import { ShieldCheck, FileText, Scale, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const PolicyCard = ({ icon: Icon, title, children, accent = 'indigo' }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-${accent}-50 text-${accent}-600`}>
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
    <div className="space-y-3 text-sm leading-7 text-slate-600">{children}</div>
  </div>
);

export const TermsPage = () => (
  <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-10 text-center">
      <Badge variant="primary">Terms of Service</Badge>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">Booking Terms & Venue Agreement</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
        These terms govern the booking, payment, and event confirmation process on PotlaEventSpaces.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <PolicyCard icon={FileText} title="Booking acceptance" accent="indigo">
        <p>Bookings are confirmed only after the venue owner approves the request and the advance payment is successfully verified.</p>
        <p>PotlaEventSpaces acts as a marketplace and does not guarantee the venue’s final acceptance beyond the platform’s review and verification workflow.</p>
      </PolicyCard>

      <PolicyCard icon={ShieldCheck} title="Guest and event details" accent="emerald">
        <p>Customers must provide accurate guest count, contact details, and event date before final confirmation.</p>
        <p>Venue capacity and time-slot availability are binding conditions. Any mismatch may result in revised pricing or cancellation.</p>
      </PolicyCard>

      <PolicyCard icon={CalendarClock} title="Rescheduling" accent="amber">
        <p>One reschedule request may be accepted up to 60 days before the event, subject to date availability and venue approval.</p>
        <p>Rescheduling requests made closer to the event date are subject to the venue's availability and may be treated as a cancellation under the policy schedule.</p>
      </PolicyCard>

      <PolicyCard icon={Scale} title="Platform responsibility" accent="violet">
        <p>PotlaEventSpaces provides the booking infrastructure, payment flow, and dispute support, but the venue remains responsible for the physical experience, staffing, and service delivery.</p>
        <p>In case of a serious service issue, customers may raise a dispute through the PotlaEventSpaces support flow for review by the platform team.</p>
      </PolicyCard>
    </div>
  </div>
);

export const PrivacyPage = () => (
  <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-10 text-center">
      <Badge variant="primary">Privacy Policy</Badge>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">Your information is handled securely</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
        PotlaEventSpaces processes booking, payment, and identity information only to deliver safe and transparent venue reservations.
      </p>
    </div>

    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div>
        <h3 className="text-lg font-bold text-slate-900">What we collect</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">We collect profile data, booking preferences, contact details, payment metadata, venue interaction logs, and communication records necessary for booking fulfilment and support.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">How we use it</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">We use your information to manage bookings, verify identity, settle payment, coordinate venue confirmation, send event updates, and maintain the quality and safety of the marketplace.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Data sharing</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">Your information may be shared with the relevant venue owner, payment gateway, and support personnel strictly required to complete or resolve your booking.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Security</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">We take reasonable steps to protect personal and payment information using secure infrastructure, access controls, and transactional safeguards.</p>
      </div>
    </div>
  </div>
);

export const CancellationPage = () => (
  <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-10 text-center">
      <Badge variant="primary">Cancellation & Refund Policy</Badge>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">Tiered cancellation schedule</h1>
      <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600">
        Refunds are calculated according to the number of days remaining before the scheduled event. This schedule applies to customer-initiated cancellations and is designed to protect venue owners from last-minute losses while keeping the platform fair and transparent.
      </p>
    </div>

    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50 text-left text-sm font-bold uppercase tracking-wider text-slate-700 md:grid-cols-3">
        <div className="px-5 py-4">Time to event</div>
        <div className="px-5 py-4">Customer refund</div>
        <div className="px-5 py-4">Policy notes</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r">
          <p className="text-lg font-bold text-slate-900">More than 90 days</p>
          <p className="mt-2 text-sm text-slate-600">Event is scheduled more than 90 days away.</p>
        </div>
        <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r">
          <p className="text-lg font-bold text-emerald-700">95% refund</p>
          <p className="mt-2 text-sm text-slate-600">Less a small processing fee retained by the platform.</p>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">This reflects a flexible booking window and protects the venue from last-minute churn without creating a blanket 100% refund promise.</p>
        </div>

        <div className="border-t border-slate-200 px-5 py-5 md:border-r">
          <p className="text-lg font-bold text-slate-900">30 to 90 days</p>
          <p className="mt-2 text-sm text-slate-600">Event falls between 30 and 90 days away.</p>
        </div>
        <div className="border-t border-slate-200 px-5 py-5 md:border-r">
          <p className="text-lg font-bold text-amber-700">50% refund</p>
          <p className="mt-2 text-sm text-slate-600">A partial refund is issued to cover the venue’s committed preparation cost.</p>
        </div>
        <div className="border-t border-slate-200 px-5 py-5">
          <p className="text-sm text-slate-600">The venue may retain a meaningful share of the deposit to account for planning, staffing, and vendor scheduling.</p>
        </div>

        <div className="border-t border-slate-200 px-5 py-5 md:border-r">
          <p className="text-lg font-bold text-slate-900">Less than 30 days</p>
          <p className="mt-2 text-sm text-slate-600">Event is within the final 30-day window.</p>
        </div>
        <div className="border-t border-slate-200 px-5 py-5 md:border-r">
          <p className="text-lg font-bold text-rose-700">0% refund</p>
          <p className="mt-2 text-sm text-slate-600">No refund is issued once the event is within 30 days.</p>
        </div>
        <div className="border-t border-slate-200 px-5 py-5">
          <p className="text-sm text-slate-600">This protects final-stage event planning and discourages last-minute cancellations that leave venues with no recovery path.</p>
        </div>
      </div>
    </div>

    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <PolicyCard icon={CheckCircle2} title="Deposit rule" accent="emerald">
        <p>The initial advance deposit is treated as a non-refundable booking commitment from the moment payment is confirmed.</p>
        <p>It is not a refundable “holding fee” and is only released when the booking is completed, cancelled under the agreed schedule, or refunded under platform-approved exceptions.</p>
      </PolicyCard>

      <PolicyCard icon={CalendarClock} title="Reschedule option" accent="sky">
        <p>Customers may request one reschedule up to 60 days before the event without penalty when the new date is available.</p>
        <p>Any reschedule request beyond this window is treated as a cancellation under the tiered schedule unless the venue explicitly agrees otherwise.</p>
      </PolicyCard>
    </div>

    <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm leading-7 text-rose-900">
      <p className="font-bold uppercase tracking-wider">Owner-initiated cancellation</p>
      <p className="mt-2">If the venue owner cancels the booking, the customer receives a full refund of the amount paid, and PotlaEventSpaces may impose a platform penalty or strike on the venue owner depending on the severity and pattern of the cancellation.</p>
    </div>
  </div>
);
