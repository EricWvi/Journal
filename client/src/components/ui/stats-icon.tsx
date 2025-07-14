import "./stats-icon.css";

export const Entries = () => (
  <svg
    viewBox="0 0 68 67"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
  >
    <rect
      id="svg-rect-1"
      width="38"
      height="31"
      x="15"
      y="0"
      rx="6"
      className="entries-icon"
    />
    <rect
      id="svg-rect-2"
      width="48"
      height="31"
      x="10"
      y="6"
      rx="6"
      className="entries-icon"
    />
    <rect
      id="svg-rect-3"
      width="51"
      height="34"
      x="8.5"
      y="4.5"
      rx="6"
      className="bg-entries-icon"
      stroke-width="3"
    />
    <rect
      id="svg-rect-4"
      width="60"
      height="50"
      x="4"
      y="13"
      rx="6"
      className="entries-icon"
    />
    <rect
      id="svg-rect-5"
      width="64"
      height="54"
      x="2"
      y="11"
      rx="6"
      className="bg-entries-icon"
      stroke-width="4"
    />
  </svg>
);

export const Quote = () => (
  <svg
    viewBox="0 0 86.4909 54.5009"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
  >
    <circle
      id="svg-quote-2"
      cx="20.4908981"
      cy="34.5009155"
      r="20"
      className="quote-icon"
    />
    <path
      id="svg-quote-3"
      d="M9.9909 47.5009C9.9909 47.5009 -1.50914 36.5009 4.99089 20.5009C11.4909 4.50094 25.9909 3.00092 25.9909 3.00092"
      className="quote-stroke"
      stroke-linecap="round"
      stroke-width="6"
    />
    <circle
      id="svg-quote-4"
      cx="66.4908981"
      cy="34.5009155"
      r="20"
      className="quote-icon"
    />
    <path
      id="svg-quote-5"
      d="M55.9909 47.5009C55.9909 47.5009 44.4909 36.5009 50.9909 20.5009C57.4909 4.50094 71.9909 3.00092 71.9909 3.00092"
      className="quote-stroke"
      stroke-linecap="round"
      stroke-width="6"
    />
  </svg>
);

export const Calendar = () => (
  <svg
    viewBox="0 0 73 63"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
  >
    <rect
      id="svg-calendar-1"
      width="73"
      height="63"
      x="0"
      y="0"
      rx="6"
      className="calendar-icon"
    />
    <rect
      id="svg-calendar-2"
      width="58.4000015"
      height="40"
      x="7"
      y="16"
      rx="2"
      className="bg-calendar-icon"
    />
    <circle
      id="svg-calendar-3"
      cx="30"
      cy="24"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-4"
      cx="43"
      cy="24"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-5"
      cx="56"
      cy="24"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-6"
      cx="17"
      cy="36"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-7"
      cx="30"
      cy="36"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-8"
      cx="43"
      cy="36"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-12"
      cx="56"
      cy="36"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-9"
      cx="17"
      cy="48"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-10"
      cx="30"
      cy="48"
      r="4"
      className="calendar-icon"
    />
    <circle
      id="svg-calendar-11"
      cx="43"
      cy="48"
      r="4"
      className="calendar-icon"
    />
  </svg>
);

interface IconProps {
  className?: string;
}

export const Icon = ({
  className = "",
  children,
}: IconProps & { children?: React.ReactNode }) => (
  <div className={"ml-[2px] h-4 w-4 " + className}>{children}</div>
);

export const VerticalBar = ({ className }: IconProps) => (
  <div className={"bg-vertical-bar w-[1px] " + className}></div>
);

export const Number = ({
  className = "",
  children,
}: IconProps & { children?: React.ReactNode }) => (
  <div className={"font-bold " + className}>{children}</div>
);

export const Description = ({
  className = "",
  children,
}: IconProps & { children?: React.ReactNode }) => (
  <div className={"stats-font mt-1 text-xs leading-none" + className}>
    {children}
  </div>
);
