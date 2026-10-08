import { createElement } from "react";

const toReactAttribute = (attribute) =>
  attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const LucideIcon = ({ icon, className = "h-5 w-5 shrink-0" }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {icon.map(([tag, attributes], index) =>
      createElement(
        tag,
        {
          ...Object.fromEntries(
            Object.entries(attributes).map(([name, value]) => [
              toReactAttribute(name),
              value,
            ]),
          ),
          key: index,
        },
      ),
    )}
  </svg>
);

export default LucideIcon;
