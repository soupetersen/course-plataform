import * as React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-md hover:shadow-lg",
        interactive: "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        outlined: "border-2 border-border shadow-none",
        filled: "bg-muted border-transparent",
      },
      size: {
        sm: "gap-3 py-3",
        default: "gap-4 py-4",
        lg: "gap-6 py-6",
      },
      padding: {
        none: "",
        sm: "p-3",
        default: "px-4",
        lg: "px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, padding, className }))}
      role="article"
      {...props}
    />
  );
}

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min items-start",
  {
    variants: {
      spacing: {
        none: "gap-0",
        sm: "gap-1",
        default: "gap-1.5",
        lg: "gap-2",
      },
      layout: {
        default: "grid-rows-[auto_auto]",
        withAction: "grid-cols-[1fr_auto] grid-rows-[auto_auto]",
      },
    },
    defaultVariants: {
      spacing: "default",
      layout: "default",
    },
  }
);

export interface CardHeaderProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardHeaderVariants> {}

function CardHeader({ className, spacing, layout, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        cardHeaderVariants({ spacing, layout }),
        "px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

const cardTitleVariants = cva("font-semibold leading-none", {
  variants: {
    size: {
      sm: "text-sm",
      default: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface CardTitleProps
  extends React.ComponentProps<"h3">,
    VariantProps<typeof cardTitleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

function CardTitle({
  className,
  size,
  as: Component = "h3",
  ...props
}: CardTitleProps) {
  return (
    <Component
      data-slot="card-title"
      className={cn(cardTitleVariants({ size, className }))}
      {...props}
    />
  );
}

const cardDescriptionVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface CardDescriptionProps
  extends React.ComponentProps<"p">,
    VariantProps<typeof cardDescriptionVariants> {}

function CardDescription({ className, size, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn(cardDescriptionVariants({ size, className }))}
      {...props}
    />
  );
}

const cardActionVariants = cva(
  "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface CardActionProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardActionVariants> {}

function CardAction({ className, size, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(cardActionVariants({ size, className }))}
      {...props}
    />
  );
}

const cardContentVariants = cva("", {
  variants: {
    spacing: {
      none: "",
      sm: "px-3",
      default: "px-6",
      lg: "px-8",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export interface CardContentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardContentVariants> {}

function CardContent({ className, spacing, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ spacing, className }))}
      {...props}
    />
  );
}

const cardFooterVariants = cva("flex items-center [.border-t]:pt-6", {
  variants: {
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    spacing: {
      none: "",
      sm: "px-3",
      default: "px-6",
      lg: "px-8",
    },
  },
  defaultVariants: {
    justify: "start",
    spacing: "default",
  },
});

export interface CardFooterProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardFooterVariants> {}

function CardFooter({
  className,
  justify,
  spacing,
  ...props
}: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ justify, spacing, className }))}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
