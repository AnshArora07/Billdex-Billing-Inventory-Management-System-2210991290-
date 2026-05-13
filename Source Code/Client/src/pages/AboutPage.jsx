import { Link } from "react-router-dom";
import BrandWord from "../components/BrandWord";

const features = [
  {
    title: "Fast Billing",
    desc: "Create clean, itemized bills in seconds with discount and GST handling built in.",
    icon: "🧾",
  },
  {
    title: "Live Inventory",
    desc: "Track product stock automatically as you sell, so your counts stay accurate without extra work.",
    icon: "📦",
  },
  {
    title: "Sales Insights",
    desc: "See your daily growth, recent bills, and payment trends with easy-to-read dashboards.",
    icon: "📈",
  },
];

const testimonials = [
  {
    name: "Riya Patel",
    role: "Retail Store Owner",
    quote:
      "Billdex helped us move from manual billing to a smooth digital flow in just one day.",
  },
  {
    name: "Arjun Mehta",
    role: "Electronics Shop Manager",
    quote:
      "The stock updates and sales history save us hours every week. Very practical for small teams.",
  },
  {
    name: "Nidhi Sharma",
    role: "Pharmacy Operator",
    quote:
      "Simple interface, quick billing, and clear records. It is exactly what our counter needed.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900"><BrandWord dexClassName="text-gray-900" /></p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="card p-7 sm:p-10 mb-8">
          <p className="inline-flex rounded-full bg-blue-100 text-brand-700 text-xs font-semibold px-3 py-1 mb-4">
            Know About Us
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
            Billing and Inventory Management Platform for Growing Businesses
          </h1>
          <p className="mt-4 text-gray-600 max-w-3xl text-sm sm:text-base leading-relaxed">
            <BrandWord dexClassName="text-gray-800" /> is built for shop owners and teams who want speed at the billing counter and clarity in inventory.
            From products to bills to sales reports, everything works in one connected flow so you can focus on customers,
            not spreadsheets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">
              Start Using <BrandWord billClassName="text-white" dexClassName="text-white" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Existing User Login
            </Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What You Can Do With <BrandWord dexClassName="text-gray-900" /></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((item) => (
              <article key={item.title} className="card p-5">
                <p className="text-2xl mb-2">{item.icon}</p>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8 card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">Who We Are</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            We are building <BrandWord dexClassName="text-gray-700" /> as a practical business operating layer for everyday commerce. Our goal is to make
            billing, stock management, and sales tracking easy enough for any business owner to run confidently,
            without technical complexity.
          </p>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Whether you run a local retail shop, pharmacy, electronics counter, or a small distribution point,
            <BrandWord dexClassName="text-gray-700" /> helps you stay organized and make faster decisions with reliable data.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((item) => (
              <article key={item.name} className="card p-5">
                <p className="text-sm text-gray-700 leading-relaxed">"{item.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Ready to Run Your Business Smarter?</h2>
          <p className="text-sm text-gray-600 mt-2">
            Join <BrandWord dexClassName="text-gray-700" /> and manage billing, inventory, and sales from one modern workspace.
          </p>
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <Link to="/signup" className="btn-primary">
              Create Account
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
