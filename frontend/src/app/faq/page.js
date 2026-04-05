export default function FAQ() {
  const faqs = [
    { q: "How do I book a vehicle?", a: "Simply browse our fleet, choose a vehicle, select your dates, and click 'Confirm Booking'. You must be logged in to book." },
    { q: "What documents do I need?", a: "You will need a valid driver's license and a government-issued ID proof." },
    { q: "Can I extend my booking?", a: "Yes, extensions are possible if the vehicle is not already booked by someone else. Contact the owner or support for assistance." },
    { q: "What is the cancellation policy?", a: "Cancellations made 24 hours before the pickup time are eligible for a full refund." }
  ];

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center pt-8">Frequently Asked Questions</h1>
        <div className="max-w-3xl mx-auto space-y-6 pb-16">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
