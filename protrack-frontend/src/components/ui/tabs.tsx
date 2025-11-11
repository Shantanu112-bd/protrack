import * as React from "react";

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  // Store internal state if not controlled
  const [internalValue, setInternalValue] = React.useState("scan");
  const currentValue = value !== undefined ? value : internalValue;
  const setCurrentValue =
    onValueChange !== undefined ? onValueChange : setInternalValue;

  // Provide context to children
  const contextValue = React.useMemo(
    () => ({
      value: currentValue,
      onValueChange: setCurrentValue,
    }),
    [currentValue, setCurrentValue]
  );

  return (
    <div ref={ref} className={`w-full ${className || ""}`} {...props}>
      <div data-tabs-context="" style={{ display: "none" }}>
        {JSON.stringify(contextValue)}
      </div>
      {props.children}
    </div>
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${
        className || ""
      }`}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
  }
>(({ className, value: triggerValue, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${
        className || ""
      }`}
      onClick={() => {
        // In a full implementation, we would trigger tab change
        console.log("Tab trigger clicked:", triggerValue);
      }}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        className || ""
      }`}
      data-tab-value={value}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
