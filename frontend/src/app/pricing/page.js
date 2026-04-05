import Link from 'next/link';

export default function Pricing() {
  const plans = [
    { name: "Daily", price: "Starts from $15", desc: "Perfect for quick errands or a day trip.", features: ["Insurance included", "Roadside assistance", "Flexible return"] },
    { name: "Weekly", price: "Save up to 20%", desc: "Ideal for business trips or vacations.", features: ["Lower daily rate", "Unlimited miles", "Free GPS"] },
    { name: "Monthly", price: "Best Value", desc: "For those who need a long-term ride.", features: ["Lowest price per day", "Dedicated support", "Vehicle maintenance"] }
  ];

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center pt-8">Simple, Transparent Pricing</h1>
        <p className="text-slate-600 text-center mb-16 max-w-2xl mx-auto">No hidden fees. No complicated contracts. Just great rides at even better prices.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="text-3xl font-extrabold text-blue-600 mb-4">{plan.price}</div>
              <p className="text-slate-500 mb-8">{plan.desc}</p>
              <ul className="space-y-4 mb-10 w-full">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center justify-center gap-2 text-slate-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/vehicles" className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                View Fleet
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
