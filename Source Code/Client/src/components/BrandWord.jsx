export default function BrandWord({ className = "", billClassName = "", dexClassName = "" }) {
  return (
    <span className={`inline-flex items-baseline ${className}`.trim()}>
      <span className={`text-brand-700 ${billClassName}`.trim()}>Bill</span>
      <span className={`text-gray-900 ${dexClassName}`.trim()}>Dex</span>
    </span>
  );
}
