// components/ui/tooltip.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
>(({ children, className,...props }, ref) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root {...props} ref={ref}>
      {children}
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className={`bg-black/80 text-white px-3 py-2 rounded-md text-sm font-medium animate-in fade-in-0 zoom-in-95 data-[side=top]:mt-2 data-[side=right]:ml-2 data-[side=bottom]:mb-2 data-[side=left]:mr-2 ${className}`} // Added className prop here
        >
          <TooltipPrimitive.Arrow className="fill-black/80" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
));

Tooltip.displayName = "Tooltip";


const TooltipProvider = ({children,...props}: TooltipPrimitive.TooltipProviderProps) => {
    return (<TooltipPrimitive.Provider {...props}>{children}</TooltipPrimitive.Provider>)
}

const TooltipContent = ({children,...props}: TooltipPrimitive.TooltipContentProps) => {
    return (<TooltipPrimitive.Content className="bg-black/80 text-white px-3 py-2 rounded-md text-sm font-medium animate-in fade-in-0 zoom-in-95 data-[side=top]:mt-2 data-[side=right]:ml-2 data-[side=bottom]:mb-2 data-[side=left]:mr-2" {...props}>{children}</TooltipPrimitive.Content>)
}

const TooltipTrigger = ({children,...props}: TooltipPrimitive.TooltipTriggerProps) => {
    return (<TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>)
}

export { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger };