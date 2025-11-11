import * as React from "react";

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className, open, onOpenChange, ...props }, ref) => {
  // Use onOpenChange if provided
  const handleBackdropClick = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        open ? "" : "hidden"
      } ${className || ""}`}
      onClick={handleBackdropClick}
      {...props}
    >
      {/* Prevent click events from propagating to the backdrop */}
      <div onClick={(e) => e.stopPropagation()}>{props.children}</div>
    </div>
  );
});
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`fixed z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in fade-in-90 slide-in-from-bottom-10 sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0 ${
        className || ""
      }`}
      {...props}
    />
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${
        className || ""
      }`}
      {...props}
    />
  );
});
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${
        className || ""
      }`}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        className || ""
      }`}
      {...props}
    />
  );
});
DialogTrigger.displayName = "DialogTrigger";

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger };
