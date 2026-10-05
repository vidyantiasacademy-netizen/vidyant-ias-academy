import type { UseFormRegisterReturn } from "react-hook-form";

/** Off-screen decoy field. Real users never fill it; bots usually do. */
export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={registration.name}>Leave this field empty</label>
      <input
        id={registration.name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...registration}
      />
    </div>
  );
}
